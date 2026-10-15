import assert from "node:assert/strict";
import test from "node:test";
import { normalizeWhatsAppPhone } from "@/lib/whatsapp-cloud";

test("WhatsApp phone normalization converts Indonesian local numbers to international format", () => {
  assert.equal(normalizeWhatsAppPhone("0812-3456-7890"), "6281234567890");
  assert.equal(normalizeWhatsAppPhone("+62 812 3456 7890"), "6281234567890");
  assert.equal(normalizeWhatsAppPhone("6281234567890"), "6281234567890");
});

test("WhatsApp phone normalization rejects invalid numbers", () => {
  assert.throws(() => normalizeWhatsAppPhone("12345"), /format internasional/);
});
