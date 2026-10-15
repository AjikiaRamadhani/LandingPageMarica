import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  DAILY_GAME_VISIT_LIMIT,
  GAME_VISIT_POINTS,
  getIndonesiaDayBounds,
  isWebGameId,
  WEB_GAMES,
} from "@/lib/game-bridge";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (isRateLimited(request, "game-visit", 20)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan, coba lagi nanti" }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Silakan login untuk mendapatkan poin kunjungan" }, { status: 401 });
  }

  let body: { gameId?: unknown };
  try {
    body = (await request.json()) as { gameId?: unknown };
  } catch {
    return NextResponse.json({ error: "Payload JSON tidak valid" }, { status: 400 });
  }

  if (!isWebGameId(body.gameId)) {
    return NextResponse.json({ error: "Game tidak ditemukan" }, { status: 404 });
  }

  const gameId = body.gameId;

  const { start, end } = getIndonesiaDayBounds();
  const dayKey = start.toISOString().slice(0, 10);
  const idempotencyKey = `game-visit:${session.user.id}:${gameId}:${dayKey}`;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const account = await tx.pointAccount.upsert({
        where: { userId: session.user.id },
        update: {},
        create: { userId: session.user.id },
      });

      await tx.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM "point_accounts" WHERE id = ${account.id} FOR UPDATE
      `;

      const lockedAccount = await tx.pointAccount.findUnique({
        where: { id: account.id },
        select: { balance: true },
      });
      if (!lockedAccount) throw new Error("POINT_ACCOUNT_MISSING");

      const existing = await tx.pointTransaction.findUnique({ where: { idempotencyKey } });
      if (existing) {
        return { awarded: false, reason: "already_awarded", balance: lockedAccount.balance };
      }

      const today = await tx.pointTransaction.aggregate({
        where: {
          userId: session.user.id,
          type: "EARN",
          referenceType: "GAME_VISIT",
          createdAt: { gte: start, lt: end },
        },
        _sum: { pointsDelta: true },
      });
      const pointsToday = today._sum.pointsDelta ?? 0;
      if (pointsToday + GAME_VISIT_POINTS > DAILY_GAME_VISIT_LIMIT) {
        return { awarded: false, reason: "daily_limit_reached", balance: lockedAccount.balance };
      }

      await tx.pointAccount.update({
        where: { id: account.id },
        data: { balance: { increment: GAME_VISIT_POINTS } },
      });
      await tx.pointTransaction.create({
        data: {
          accountId: account.id,
          userId: session.user.id,
          type: "EARN",
          pointsDelta: GAME_VISIT_POINTS,
          reason: `Kunjungan game: ${WEB_GAMES[gameId].title}`,
          referenceType: "GAME_VISIT",
          referenceId: gameId,
          idempotencyKey,
        },
      });

      return {
        awarded: true,
        pointsAwarded: GAME_VISIT_POINTS,
        pointsToday: pointsToday + GAME_VISIT_POINTS,
        dailyLimit: DAILY_GAME_VISIT_LIMIT,
        balance: lockedAccount.balance + GAME_VISIT_POINTS,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[POST /api/games/visit]", error);
    return NextResponse.json({ error: "Gagal mencatat kunjungan game" }, { status: 500 });
  }
}
