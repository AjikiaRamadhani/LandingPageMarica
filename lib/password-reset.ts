import crypto from "crypto";

export const PASSWORD_RESET_OTP_TTL_MS = 10 * 60 * 1000;
export const PASSWORD_RESET_OTP_LENGTH = 6;

export function createPasswordResetOtp(): string {
  return crypto
    .randomInt(0, 10 ** PASSWORD_RESET_OTP_LENGTH)
    .toString()
    .padStart(PASSWORD_RESET_OTP_LENGTH, "0");
}

export function hashPasswordResetOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export function isPasswordResetOtp(value: string): boolean {
  return new RegExp(`^\\d{${PASSWORD_RESET_OTP_LENGTH}}$`).test(value);
}
