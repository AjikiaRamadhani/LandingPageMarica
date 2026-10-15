import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  DAILY_GAME_POINTS_LIMIT,
  gameCompletionKeyEnvironmentName,
  gameCompletionKeyMatches,
  GameBridgeConfigurationError,
  getGameCompletionAward,
  getIndonesiaDayBounds,
  isWebGameId,
  verifyGameLaunchToken,
  WEB_GAMES,
} from "@/lib/game-bridge";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> },
) {
  const { gameId } = await params;
  if (!isWebGameId(gameId)) {
    return NextResponse.json({ error: "Game tidak ditemukan" }, { status: 404 });
  }

  try {
    const expectedApiKey = process.env[gameCompletionKeyEnvironmentName(gameId)];
    if (!expectedApiKey || expectedApiKey.length < 32) {
      throw new GameBridgeConfigurationError(
        `${gameCompletionKeyEnvironmentName(gameId)} is not configured`,
      );
    }

    if (!gameCompletionKeyMatches(request.headers.get("x-game-api-key"), expectedApiKey)) {
      return NextResponse.json({ error: "API key tidak valid" }, { status: 401 });
    }

    let body: { launchToken?: unknown };
    try {
      body = (await request.json()) as { launchToken?: unknown };
    } catch {
      return NextResponse.json({ error: "Payload JSON tidak valid" }, { status: 400 });
    }

    if (typeof body.launchToken !== "string" || body.launchToken.length > 4096) {
      return NextResponse.json({ error: "Launch token wajib diisi" }, { status: 400 });
    }

    const claims = verifyGameLaunchToken(body.launchToken);
    if (!claims) {
      return NextResponse.json(
        { error: "Launch token tidak valid atau sudah kedaluwarsa" },
        { status: 401 },
      );
    }

    if (claims.gameId !== gameId) {
      return NextResponse.json(
        { error: "Launch token tidak berlaku untuk game ini" },
        { status: 403 },
      );
    }

    const now = new Date();
    const { start, end } = getIndonesiaDayBounds(now);
    const idempotencyKey = `game-completion:${claims.nonce}`;
    const result = await prisma.$transaction(async (tx) => {
      const account = await tx.pointAccount.upsert({
        where: { userId: claims.userId },
        update: {},
        create: { userId: claims.userId },
      });

      await tx.$queryRaw<Array<{ id: string }>>`
        SELECT id
        FROM "point_accounts"
        WHERE id = ${account.id}
        FOR UPDATE
      `;

      const lockedAccount = await tx.pointAccount.findUnique({
        where: { id: account.id },
        select: { balance: true },
      });
      if (!lockedAccount) throw new Error("POINT_ACCOUNT_MISSING");

      const priorAward = await tx.pointTransaction.findUnique({
        where: { idempotencyKey },
      });
      if (priorAward) {
        return {
          awarded: false,
          reason: "already_awarded",
          balance: lockedAccount.balance,
        };
      }

      const dailyGamePoints = await tx.pointTransaction.aggregate({
        where: {
          userId: claims.userId,
          type: "EARN",
          referenceType: "GAME_COMPLETION",
          createdAt: { gte: start, lt: end },
        },
        _sum: { pointsDelta: true },
      });
      const pointsToday = dailyGamePoints._sum.pointsDelta ?? 0;
      const pointsAwarded = getGameCompletionAward(pointsToday);

      if (pointsAwarded === 0) {
        return {
          awarded: false,
          reason: "daily_limit_reached",
          balance: lockedAccount.balance,
        };
      }

      await tx.pointAccount.update({
        where: { id: account.id },
        data: { balance: { increment: pointsAwarded } },
      });
      await tx.pointTransaction.create({
        data: {
          accountId: account.id,
          userId: claims.userId,
          type: "EARN",
          pointsDelta: pointsAwarded,
          reason: `Menyelesaikan game: ${WEB_GAMES[gameId].title}`,
          referenceType: "GAME_COMPLETION",
          referenceId: claims.nonce,
          idempotencyKey,
        },
      });

      return {
        awarded: true,
        pointsAwarded,
        pointsToday: pointsToday + pointsAwarded,
        dailyLimit: DAILY_GAME_POINTS_LIMIT,
        balance: lockedAccount.balance + pointsAwarded,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof GameBridgeConfigurationError) {
      console.error("[POST /api/games/[gameId]/complete] Configuration error", error.message);
      return NextResponse.json(
        { error: "Integrasi poin game belum dikonfigurasi" },
        { status: 503 },
      );
    }

    console.error("[POST /api/games/[gameId]/complete]", error);
    return NextResponse.json({ error: "Gagal mencatat penyelesaian game" }, { status: 500 });
  }
}
