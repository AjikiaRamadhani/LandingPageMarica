import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createGameLaunchToken,
  GameBridgeConfigurationError,
  isWebGameId,
  WEB_GAMES,
} from "@/lib/game-bridge";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (isRateLimited(request, "game-launch", 40)) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan, coba lagi nanti" },
      { status: 429 },
    );
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Silakan login untuk bermain" }, { status: 401 });
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

    const { token, claims } = createGameLaunchToken(session.user.id, body.gameId);
    const launchUrl = new URL(WEB_GAMES[body.gameId].url);
    launchUrl.hash = new URLSearchParams({ maricaLaunchToken: token }).toString();

    return NextResponse.json({
      launchUrl: launchUrl.toString(),
      expiresAt: new Date(claims.expiresAt * 1000).toISOString(),
    });
  } catch (error) {
    if (error instanceof GameBridgeConfigurationError) {
      return NextResponse.json(
        { error: "Integrasi poin game belum dikonfigurasi" },
        { status: 503 },
      );
    }

    console.error("[POST /api/games/launch]", error);
    return NextResponse.json({ error: "Gagal menyiapkan sesi game" }, { status: 500 });
  }
}
