import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

type JsonValue = Record<string, any> | any[] | string | number | boolean | null;
type HttpResult<T extends JsonValue = JsonValue> = { status: number; body: T };

class ApiClient {
  private readonly cookies = new Map<string, string>();

  constructor(private readonly baseUrl: string) {}

  private rememberCookies(headers: Headers) {
    const extendedHeaders = headers as Headers & { getSetCookie?: () => string[] };
    for (const value of extendedHeaders.getSetCookie?.() ?? []) {
      const pair = value.split(";", 1)[0];
      const separator = pair.indexOf("=");
      if (separator > 0) this.cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
    }
  }

  private cookieHeader() {
    return [...this.cookies.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
  }

  async request<T extends JsonValue = JsonValue>(path: string, init: RequestInit = {}): Promise<HttpResult<T>> {
    const headers = new Headers(init.headers);
    if (!headers.has("Accept")) headers.set("Accept", "application/json");
    const cookie = this.cookieHeader();
    if (cookie) headers.set("Cookie", cookie);
    const response = await fetch(new URL(path, this.baseUrl), { ...init, headers, redirect: "manual" });
    this.rememberCookies(response.headers);
    const text = await response.text();
    let body: JsonValue = text;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      // Keep non-JSON responses available in assertion messages.
    }
    return { status: response.status, body: body as T };
  }

  json<T extends JsonValue = JsonValue>(path: string, body: unknown, method = "POST") {
    return this.request<T>(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  async login(email: string, password: string) {
    const csrf = await this.request<{ csrfToken?: string }>("/api/auth/csrf");
    assert.equal(csrf.status, 200, `CSRF gagal: ${JSON.stringify(csrf.body)}`);
    assert.ok(csrf.body.csrfToken, "CSRF token tidak tersedia");
    const form = new URLSearchParams({ csrfToken: csrf.body.csrfToken, email, password, callbackUrl: "/", json: "true" });
    const result = await this.request("/api/auth/callback/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    assert.ok([200, 302].includes(result.status), `Login gagal: ${result.status} ${JSON.stringify(result.body)}`);
    const session = await this.request<{ user?: { email?: string } }>("/api/auth/session");
    assert.equal(session.status, 200, `Session gagal: ${JSON.stringify(session.body)}`);
    assert.equal(session.body.user?.email, email.toLowerCase());
  }
}

function jsonBody<T extends Record<string, any>>(result: HttpResult, label: string) {
  assert.equal(result.status, 200, `${label} gagal: ${result.status} ${JSON.stringify(result.body)}`);
  assert.equal(typeof result.body, "object", `${label} bukan JSON object`);
  return result.body as T;
}

const enabled = ["1", "true", "yes"].includes((process.env.SMOKE_TEST ?? "").toLowerCase());
const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";

test("backend smoke test", { skip: !enabled }, async (t) => {
  const email = (process.env.SMOKE_EMAIL ?? `smoke-${Date.now()}@example.test`).toLowerCase();
  const password = process.env.SMOKE_PASSWORD ?? "SmokeTest!123";
  const name = process.env.SMOKE_NAME ?? "Marica Smoke Test";
  const client = new ApiClient(baseUrl);
  let adminClient: ApiClient | null = null;

  await t.test("register dan login", async () => {
    const registration = await client.json<{ user?: { email?: string }; error?: string }>("/api/auth/register", {
      name, email, password, confirmPassword: password,
    });
    assert.ok([201, 409].includes(registration.status), `Register gagal: ${registration.status} ${JSON.stringify(registration.body)}`);
    await client.login(email, password);
  });

  await t.test("checkout dan webhook pembayaran", async (subtest) => {
    const productId = process.env.SMOKE_PRODUCT_ID?.trim();
    const serverKey = process.env.MIDTRANS_SERVER_KEY?.trim();
    if (!productId || !serverKey) {
      subtest.skip("Isi SMOKE_PRODUCT_ID dan MIDTRANS_SERVER_KEY untuk menguji pembayaran.");
      return;
    }
    const cart = await client.json("/api/cart", { productId, quantity: 1 });
    assert.equal(cart.status, 201, `Tambah cart gagal: ${JSON.stringify(cart.body)}`);
    const checkout = await client.json<{ order?: { id?: string; orderNumber?: string; total?: number }; error?: string }>("/api/checkout", {
      shippingName: name, shippingPhone: process.env.SMOKE_PHONE ?? "081234567890", shippingAddress: "Alamat smoke test",
      shippingCity: "Jakarta", shippingProvince: "DKI Jakarta", shippingPostalCode: "10110", shippingCourier: "JNE",
      shippingService: "REG", shippingCost: 0,
    });
    assert.equal(checkout.status, 201, `Checkout gagal: ${JSON.stringify(checkout.body)}`);
    const order = checkout.body.order;
    assert.ok(order?.id && order.orderNumber && order.total !== undefined, "Response checkout tidak lengkap");
    const grossAmount = String(order.total);
    const statusCode = "200";
    const signature = createHash("sha512").update(`${order.orderNumber}${statusCode}${grossAmount}${serverKey}`).digest("hex");
    const webhook = await client.json<{ message?: string; error?: string }>("/api/webhooks/midtrans", {
      order_id: order.orderNumber, status_code: statusCode, gross_amount: grossAmount, signature_key: signature,
      transaction_status: "settlement", transaction_id: `smoke-${Date.now()}`,
    });
    assert.equal(webhook.status, 200, `Webhook gagal: ${JSON.stringify(webhook.body)}`);
    const detail = await client.request<{ status?: string }>(`/api/orders/${order.id}`);
    assert.equal(jsonBody<{ status?: string }>(detail, "Detail order").status, "PAID");
  });

  await t.test("POS dan pengurangan stok", async (subtest) => {
    const adminEmail = process.env.SMOKE_ADMIN_EMAIL?.trim();
    const adminPassword = process.env.SMOKE_ADMIN_PASSWORD?.trim();
    const productId = process.env.SMOKE_POS_PRODUCT_ID?.trim();
    if (!adminEmail || !adminPassword || !productId) {
      subtest.skip("Isi SMOKE_ADMIN_EMAIL, SMOKE_ADMIN_PASSWORD, dan SMOKE_POS_PRODUCT_ID untuk menguji POS.");
      return;
    }
    adminClient = new ApiClient(baseUrl);
    await adminClient.login(adminEmail, adminPassword);
    const products = await adminClient.request<{ products?: Array<{ id: string; price: number; stock: number }> }>("/api/cashier/products");
    const product = jsonBody<{ products?: Array<{ id: string; price: number; stock: number }> }>(products, "Katalog POS").products?.find((item) => item.id === productId);
    assert.ok(product, "Produk POS tidak ditemukan");
    assert.ok(product.stock > 0, "Stok Experience Store harus lebih dari 0");
    const shifts = await adminClient.request<{ shift?: { id: string } }>("/api/cashier/shifts");
    let shift = jsonBody<{ shift?: { id: string } }>(shifts, "Shift POS").shift;
    if (!shift) {
      const opened = await adminClient.json<{ id?: string; error?: string }>("/api/cashier/shifts", { openingCash: 0 });
      assert.equal(opened.status, 201, `Buka shift gagal: ${JSON.stringify(opened.body)}`);
      shift = { id: opened.body.id! };
    }
    assert.ok(shift?.id, "Shift POS tidak tersedia");
    const sale = await adminClient.json<{ total?: number; error?: string }>("/api/cashier/sales", {
      paymentMethod: "CASH", paidAmount: product.price, items: [{ type: "PRODUCT", productId, quantity: 1 }],
    });
    assert.equal(sale.status, 201, `POS sale gagal: ${JSON.stringify(sale.body)}`);
    assert.equal(sale.body.total, product.price);
    const after = await adminClient.request<{ products?: Array<{ id: string; stock: number }> }>("/api/cashier/products");
    const afterProduct = jsonBody<{ products?: Array<{ id: string; stock: number }> }>(after, "Stok POS setelah sale").products?.find((item) => item.id === productId);
    assert.equal(afterProduct?.stock, product.stock - 1);
  });

  await t.test("booking event gratis dan QR check-in", async (subtest) => {
    const eventSlug = process.env.SMOKE_FREE_EVENT_SLUG?.trim();
    if (!eventSlug || !adminClient) {
      subtest.skip("Isi SMOKE_FREE_EVENT_SLUG dan konfigurasi akun admin untuk menguji event check-in.");
      return;
    }
    const booking = await client.json<{ booking?: { status?: string; tickets?: Array<{ qrToken?: string }> }; error?: string }>("/api/event-bookings", {
      eventSlug, quantity: 1, participantNames: [name], customerPhone: process.env.SMOKE_PHONE ?? "081234567890",
    });
    assert.equal(booking.status, 201, `Booking event gagal: ${JSON.stringify(booking.body)}`);
    assert.equal(booking.body.booking?.status, "PAID");
    const qrToken = booking.body.booking?.tickets?.[0]?.qrToken;
    assert.ok(qrToken, "Booking event tidak menghasilkan QR token");
    const checkin = await adminClient.json("/api/event-tickets/check-in", { qrToken });
    assert.equal(checkin.status, 200, `Check-in gagal: ${JSON.stringify(checkin.body)}`);
  });

  await t.test("download printable dan link WhatsApp", async (subtest) => {
    const printableId = process.env.SMOKE_PRINTABLE_ID?.trim();
    if (!printableId) {
      subtest.skip("Isi SMOKE_PRINTABLE_ID untuk menguji printable dan link WhatsApp.");
      return;
    }
    const result = await client.json<{ downloadUrl?: string; whatsappUrl?: string; delivery?: { email?: string; whatsapp?: string }; error?: string }>(`/api/printables/${printableId}/download`, {
      name, email, whatsapp: process.env.SMOKE_PHONE ?? "081234567890", childAge: 7,
    });
    assert.equal(result.status, 200, `Printable gagal: ${JSON.stringify(result.body)}`);
    assert.ok(result.body.downloadUrl?.startsWith("http"), "Signed download URL tidak tersedia");
    assert.ok(result.body.whatsappUrl?.startsWith("https://wa.me/"), "Link WhatsApp tidak tersedia");
    assert.ok(["sent", "failed"].includes(result.body.delivery?.email ?? ""));
    assert.ok(["accepted", "failed", "not_configured"].includes(result.body.delivery?.whatsapp ?? ""));
  });

  await t.test("kunjungan game dan batas poin harian", async () => {
    const gameIds = ["pacu-jalur", "panjat-pinang", "dino-escape", "angkasa-rasa"];
    for (const gameId of gameIds) {
      const visit = await client.json<{ awarded?: boolean; reason?: string; pointsAwarded?: number; error?: string }>("/api/games/visit", { gameId });
      assert.equal(visit.status, 200, `Visit ${gameId} gagal: ${JSON.stringify(visit.body)}`);
      if (visit.body.awarded) assert.equal(visit.body.pointsAwarded, 5);
      else assert.ok(["already_awarded", "daily_limit_reached"].includes(visit.body.reason ?? ""));
    }
    const duplicate = await client.json<{ awarded?: boolean; reason?: string }>("/api/games/visit", { gameId: gameIds[0] });
    assert.equal(duplicate.status, 200);
    assert.equal(duplicate.body.awarded, false);
    assert.ok(["already_awarded", "daily_limit_reached"].includes(duplicate.body.reason ?? ""));
    const points = await client.request<{ transactions?: Array<{ type?: string; referenceType?: string; pointsDelta?: number; createdAt?: string }> }>("/api/points");
    const transactions = jsonBody<{ transactions?: Array<{ type?: string; referenceType?: string; pointsDelta?: number; createdAt?: string }> }>(points, "Saldo poin").transactions ?? [];
    const start = new Date(Date.now() + 7 * 60 * 60 * 1000);
    start.setUTCHours(0, 0, 0, 0);
    start.setTime(start.getTime() - 7 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    const gamePointsToday = transactions
      .filter((item) => item.type === "EARN" && item.referenceType === "GAME_VISIT" && item.createdAt)
      .filter((item) => { const createdAt = new Date(item.createdAt!); return createdAt >= start && createdAt < end; })
      .reduce((sum, item) => sum + (item.pointsDelta ?? 0), 0);
    assert.ok(gamePointsToday <= 20, `Poin game hari ini melewati batas: ${gamePointsToday}`);
  });
});
