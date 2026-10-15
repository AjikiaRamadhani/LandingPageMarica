import assert from "node:assert/strict";
import test from "node:test";
import {
  createGameLaunchToken,
  DAILY_GAME_POINTS_LIMIT,
  GAME_LAUNCH_TOKEN_TTL_SECONDS,
  gameCompletionKeyEnvironmentName,
  gameCompletionKeyMatches,
  getGameCompletionAward,
  getIndonesiaDayBounds,
  verifyGameLaunchToken,
} from "@/lib/game-bridge";
import { getApiDocs } from "@/lib/swagger";

const secret = "a".repeat(64);

test("game launch tokens carry a signed, expiring user and game identity", () => {
  const now = 1_800_000_000;
  const { token, claims } = createGameLaunchToken("user-123", "pacu-jalur", now, secret);
  const verified = verifyGameLaunchToken(token, now + 1, secret);

  assert.equal(verified?.userId, "user-123");
  assert.equal(verified?.gameId, "pacu-jalur");
  assert.equal(verified?.nonce, claims.nonce);
  assert.equal(verified?.expiresAt, now + GAME_LAUNCH_TOKEN_TTL_SECONDS);
});

test("game launch tokens reject tampering and expired sessions", () => {
  const now = 1_800_000_000;
  const { token } = createGameLaunchToken("user-123", "dino-escape", now, secret);

  assert.equal(verifyGameLaunchToken(`${token}x`, now + 1, secret), null);
  assert.equal(
    verifyGameLaunchToken(token, now + GAME_LAUNCH_TOKEN_TTL_SECONDS, secret),
    null,
  );
});

test("game completion keys are game-specific and compared without timing leaks", () => {
  assert.equal(
    gameCompletionKeyEnvironmentName("panjat-pinang"),
    "GAME_COMPLETION_KEY_PANJAT_PINANG",
  );
  assert.equal(gameCompletionKeyMatches("secret", "secret"), true);
  assert.equal(gameCompletionKeyMatches("wrong", "secret"), false);
  assert.equal(gameCompletionKeyMatches(null, "secret"), false);
});

test("game completion rewards stop at the daily cap", () => {
  assert.equal(getGameCompletionAward(0), 50);
  assert.equal(getGameCompletionAward(DAILY_GAME_POINTS_LIMIT - 50), 50);
  assert.equal(getGameCompletionAward(DAILY_GAME_POINTS_LIMIT), 0);
  assert.equal(getGameCompletionAward(-1), 0);
  assert.equal(getGameCompletionAward(1.5), 0);
});

test("daily game point windows follow the Jakarta calendar day", () => {
  const { start, end } = getIndonesiaDayBounds(new Date("2026-10-15T16:59:59.000Z"));

  assert.equal(start.toISOString(), "2026-10-14T17:00:00.000Z");
  assert.equal(end.toISOString(), "2026-10-15T17:00:00.000Z");
});

test("Swagger documents authenticated game launch and protected completion APIs", () => {
  const spec = getApiDocs();
  const paths = spec.paths as Record<string, Record<string, {
    security?: Array<Record<string, string[]>>;
  }>>;

  assert.ok(paths["/api/games/launch"]?.post);
  assert.deepEqual(paths["/api/games/launch"].post.security, [{ SessionCookie: [] }]);
  assert.deepEqual(paths["/api/games/{gameId}/complete"].post.security, [{ GameApiKey: [] }]);
});
