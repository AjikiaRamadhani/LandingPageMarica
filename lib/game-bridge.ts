import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export const GAME_POINTS_PER_COMPLETION = 50;
export const DAILY_GAME_POINTS_LIMIT = 1_000;
export const GAME_LAUNCH_TOKEN_TTL_SECONDS = 10 * 60;

export const WEB_GAMES = {
  "pacu-jalur": {
    title: "Marica Pacu Jalur",
    url: "https://pacujalur.marica.id/",
  },
  "panjat-pinang": {
    title: "Panjat Pinang",
    url: "https://panjatpinang.marica.id/",
  },
  "dino-escape": {
    title: "Dino Escape",
    url: "https://dino.marica.id/",
  },
  "angkasa-rasa": {
    title: "Marica Angkasa Rasa",
    url: "https://angkarasa.marica.id/",
  },
} as const;

export type WebGameId = keyof typeof WEB_GAMES;

type GameLaunchClaims = {
  version: 1;
  userId: string;
  gameId: WebGameId;
  nonce: string;
  issuedAt: number;
  expiresAt: number;
};

export class GameBridgeConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GameBridgeConfigurationError";
  }
}

function requireSecret(value: string | undefined, name: string) {
  if (!value || value.length < 32) {
    throw new GameBridgeConfigurationError(
      `${name} must be configured with at least 32 characters`,
    );
  }
  return value;
}

export function isWebGameId(value: unknown): value is WebGameId {
  return typeof value === "string" && Object.hasOwn(WEB_GAMES, value);
}

export function gameCompletionKeyEnvironmentName(gameId: WebGameId) {
  return `GAME_COMPLETION_KEY_${gameId.replace(/-/g, "_").toUpperCase()}`;
}

export function createGameLaunchToken(
  userId: string,
  gameId: WebGameId,
  nowSeconds = Math.floor(Date.now() / 1000),
  secret = process.env.GAME_LAUNCH_TOKEN_SECRET,
) {
  const claims: GameLaunchClaims = {
    version: 1,
    userId,
    gameId,
    nonce: randomUUID(),
    issuedAt: nowSeconds,
    expiresAt: nowSeconds + GAME_LAUNCH_TOKEN_TTL_SECONDS,
  };
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  const signature = createHmac(
    "sha256",
    requireSecret(secret, "GAME_LAUNCH_TOKEN_SECRET"),
  )
    .update(payload)
    .digest("base64url");

  return { token: `${payload}.${signature}`, claims };
}

export function verifyGameLaunchToken(
  token: string,
  nowSeconds = Math.floor(Date.now() / 1000),
  secret = process.env.GAME_LAUNCH_TOKEN_SECRET,
): GameLaunchClaims | null {
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra !== undefined) return null;

  const expectedSignature = createHmac(
    "sha256",
    requireSecret(secret, "GAME_LAUNCH_TOKEN_SECRET"),
  )
    .update(payload)
    .digest("base64url");
  const actualBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expectedSignature);
  if (
    actualBytes.length !== expectedBytes.length ||
    !timingSafeEqual(actualBytes, expectedBytes)
  ) {
    return null;
  }

  let claims: unknown;
  try {
    claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (
    typeof claims !== "object" ||
    claims === null ||
    !("version" in claims) ||
    claims.version !== 1 ||
    !("userId" in claims) ||
    typeof claims.userId !== "string" ||
    !claims.userId ||
    !("gameId" in claims) ||
    !isWebGameId(claims.gameId) ||
    !("nonce" in claims) ||
    typeof claims.nonce !== "string" ||
    !/^[0-9a-f-]{36}$/i.test(claims.nonce) ||
    !("issuedAt" in claims) ||
    typeof claims.issuedAt !== "number" ||
    !("expiresAt" in claims) ||
    typeof claims.expiresAt !== "number"
  ) {
    return null;
  }

  if (
    claims.issuedAt > nowSeconds + 60 ||
    claims.expiresAt <= nowSeconds ||
    claims.expiresAt <= claims.issuedAt ||
    claims.expiresAt - claims.issuedAt > GAME_LAUNCH_TOKEN_TTL_SECONDS
  ) {
    return null;
  }

  return claims as GameLaunchClaims;
}

export function gameCompletionKeyMatches(
  providedKey: string | null,
  expectedKey: string,
) {
  if (!providedKey) return false;
  const providedBytes = Buffer.from(providedKey);
  const expectedBytes = Buffer.from(expectedKey);
  return (
    providedBytes.length === expectedBytes.length &&
    timingSafeEqual(providedBytes, expectedBytes)
  );
}

export function getIndonesiaDayBounds(now = new Date()) {
  const indonesiaOffsetMs = 7 * 60 * 60 * 1000;
  const indonesiaDate = new Date(now.getTime() + indonesiaOffsetMs);
  const start = new Date(
    Date.UTC(
      indonesiaDate.getUTCFullYear(),
      indonesiaDate.getUTCMonth(),
      indonesiaDate.getUTCDate(),
    ) - indonesiaOffsetMs,
  );

  return {
    start,
    end: new Date(start.getTime() + 24 * 60 * 60 * 1000),
  };
}

export function getGameCompletionAward(todayPoints: number) {
  if (
    !Number.isInteger(todayPoints) ||
    todayPoints < 0 ||
    todayPoints + GAME_POINTS_PER_COMPLETION > DAILY_GAME_POINTS_LIMIT
  ) {
    return 0;
  }

  return GAME_POINTS_PER_COMPLETION;
}
