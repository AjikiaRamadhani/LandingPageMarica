type Schema = Record<string, unknown>;
type Method = "get" | "post" | "put" | "patch" | "delete";

const objectSchema: Schema = { type: "object", additionalProperties: true };
const arraySchema = (items: Schema = objectSchema): Schema => ({ type: "array", items });
const jsonContent = (schema: Schema) => ({ content: { "application/json": { schema } } });

const errors: Record<string, Schema> = {
  "400": { description: "Bad request: payload atau parameter tidak valid." },
  "401": { description: "Unauthorized: session login diperlukan." },
  "403": { description: "Forbidden: role admin diperlukan." },
  "404": { description: "Resource tidak ditemukan." },
  "429": { description: "Too many requests." },
  "500": { description: "Internal server error." },
};

const pathParam = (name: string, description: string): Schema => ({
  name,
  in: "path",
  required: true,
  description,
  schema: { type: "string" },
});

const queryParam = (name: string, description: string, schema: Schema = { type: "string" }): Schema => ({
  name,
  in: "query",
  required: false,
  description,
  schema,
});

const operation = (
  summary: string,
  tag: string,
  options: {
    auth?: boolean;
    admin?: boolean;
    parameters?: Schema[];
    requestBody?: Schema;
    success?: Schema;
    successStatus?: string;
    successDescription?: string;
    errorCodes?: string[];
  } = {},
) => ({
  summary,
  description: summary,
  tags: [tag],
  ...(options.parameters ? { parameters: options.parameters } : {}),
  ...(options.requestBody ? { requestBody: jsonContent(options.requestBody) } : {}),
  ...(options.auth || options.admin ? { security: [{ SessionCookie: [] }] } : {}),
  responses: {
    [options.successStatus ?? "200"]: {
      description: options.successDescription ?? "Request berhasil.",
      ...(options.success ? jsonContent(options.success) : {}),
    },
    ...Object.fromEntries((options.errorCodes ?? []).map((code) => [code, errors[code]])),
  },
});

export const getApiDocs = () => {
  const paths: Record<string, Record<string, unknown>> = {};
  const add = (path: string, method: Method, summary: string, tag: string, options: Parameters<typeof operation>[2] = {}) => {
    paths[path] ??= {};
    paths[path][method] = operation(summary, tag, options);
  };

  // Public landing page content.
  for (const [path, summary] of [
    ["/api/benefits", "Get benefits"],
    ["/api/faqs", "Get FAQs"],
    ["/api/how-it-works", "Get how-it-works steps"],
    ["/api/pain-points", "Get pain points"],
    ["/api/solutions", "Get solutions"],
    ["/api/statistics", "Get statistics"],
    ["/api/testimonials", "Get testimonials"],
  ]) add(path, "get", summary, "Content", { success: arraySchema(), errorCodes: ["500"] });
  add("/api/company", "get", "Get company profile", "Content", { success: objectSchema, errorCodes: ["404", "500"] });
  add("/api/hero", "get", "Get hero section", "Content", { success: objectSchema, errorCodes: ["500"] });

  // Catalog, cart, checkout, and orders.
  add("/api/product-categories", "get", "List active product categories", "Catalog", { success: arraySchema(), errorCodes: ["500"] });
  add("/api/products", "get", "List products", "Catalog", {
    parameters: [
      queryParam("page", "Page number.", { type: "integer", minimum: 1, default: 1 }),
      queryParam("limit", "Items per page; maximum 50.", { type: "integer", minimum: 1, maximum: 50, default: 12 }),
      queryParam("search", "Search product name or description."),
      queryParam("category", "Product category slug."),
      queryParam("age", "Age range such as 3-5."),
      queryParam("skillFocus", "Skill focus filter."),
      queryParam("minPrice", "Minimum price.", { type: "integer", minimum: 0 }),
      queryParam("maxPrice", "Maximum price.", { type: "integer", minimum: 0 }),
      queryParam("sort", "newest, price_asc, price_desc, or bestseller."),
    ],
    success: objectSchema,
    errorCodes: ["500"],
  });
  add("/api/products/{slug}", "get", "Get product detail", "Catalog", { parameters: [pathParam("slug", "Product slug.")], success: objectSchema, errorCodes: ["404", "500"] });

  add("/api/cart", "get", "Get current user cart", "Cart", { auth: true, success: objectSchema, errorCodes: ["401", "500"] });
  add("/api/cart", "post", "Add product to cart", "Cart", { auth: true, requestBody: { type: "object", required: ["productId", "quantity"], properties: { productId: { type: "string" }, quantity: { type: "integer", minimum: 1 }, bundleId: { type: "string", nullable: true } } }, success: objectSchema, successStatus: "201", errorCodes: ["400", "401", "404", "500"] });
  add("/api/cart", "patch", "Update cart item quantity", "Cart", { auth: true, requestBody: { type: "object", required: ["itemId", "quantity"], properties: { itemId: { type: "string" }, quantity: { type: "integer", minimum: 1 } } }, success: objectSchema, errorCodes: ["400", "401", "404", "500"] });
  add("/api/cart", "delete", "Delete cart item", "Cart", { auth: true, requestBody: { type: "object", required: ["itemId"], properties: { itemId: { type: "string" } } }, success: objectSchema, errorCodes: ["400", "401", "404", "500"] });
  add("/api/cart/{itemId}", "put", "Update cart item", "Cart", { auth: true, parameters: [pathParam("itemId", "Cart item ID.")], requestBody: { type: "object", required: ["quantity"], properties: { quantity: { type: "integer", minimum: 1 } } }, success: objectSchema, errorCodes: ["400", "401", "404", "500"] });
  add("/api/cart/{itemId}", "delete", "Delete cart item by ID", "Cart", { auth: true, parameters: [pathParam("itemId", "Cart item ID.")], success: objectSchema, errorCodes: ["401", "404", "500"] });
  add("/api/checkout", "post", "Create product checkout", "Orders", { auth: true, requestBody: { type: "object", required: ["shippingName", "shippingPhone", "shippingAddress", "shippingCity", "shippingProvince", "shippingPostalCode", "shippingCost"], properties: { shippingName: { type: "string" }, shippingPhone: { type: "string" }, shippingAddress: { type: "string" }, shippingCity: { type: "string" }, shippingProvince: { type: "string" }, shippingPostalCode: { type: "string" }, shippingCourier: { type: "string" }, shippingService: { type: "string" }, shippingCost: { type: "integer", minimum: 0 }, checkoutProductId: { type: "string" } } }, success: objectSchema, successStatus: "201", errorCodes: ["400", "401", "500"] });
  add("/api/orders", "get", "List current user orders", "Orders", { auth: true, success: arraySchema(), errorCodes: ["401", "500"] });
  add("/api/orders/{id}", "get", "Get order detail", "Orders", { auth: true, parameters: [pathParam("id", "Order ID.")], success: objectSchema, errorCodes: ["401", "404", "500"] });
  add("/api/orders/{id}", "patch", "Cancel current user order", "Orders", { auth: true, parameters: [pathParam("id", "Order ID.")], requestBody: { type: "object", properties: { action: { type: "string", enum: ["cancel"] } } }, success: objectSchema, errorCodes: ["400", "401", "404", "500"] });

  // Events and tickets.
  add("/api/events", "get", "List active events", "Events", { success: arraySchema(), errorCodes: ["500"] });
  add("/api/events/{slug}", "get", "Get event detail", "Events", { parameters: [pathParam("slug", "Event slug.")], success: objectSchema, errorCodes: ["404", "500"] });
  add("/api/event-bookings", "get", "List current user event bookings", "Events", { auth: true, success: arraySchema(), errorCodes: ["401", "500"] });
  add("/api/event-bookings", "post", "Create event booking", "Events", { auth: true, requestBody: { type: "object", required: ["eventId", "quantity", "participantNames"], properties: { eventId: { type: "string" }, quantity: { type: "integer", minimum: 1 }, participantNames: { type: "array", items: { type: "string" } }, customerPhone: { type: "string" } } }, success: objectSchema, successStatus: "201", errorCodes: ["400", "401", "404", "500"] });
  add("/api/event-bookings/{bookingNumber}", "get", "Get event booking detail", "Events", { auth: true, parameters: [pathParam("bookingNumber", "Booking number.")], success: objectSchema, errorCodes: ["401", "404", "500"] });
  add("/api/event-bookings/{bookingNumber}", "post", "Refresh or pay event booking", "Events", { auth: true, parameters: [pathParam("bookingNumber", "Booking number.")], success: objectSchema, errorCodes: ["400", "401", "404", "500"] });
  add("/api/event-tickets/{ticketCode}", "get", "Get e-ticket and QR data", "Tickets", { auth: true, parameters: [pathParam("ticketCode", "Ticket code.")], success: objectSchema, errorCodes: ["401", "404", "500"] });
  add("/api/event-tickets/{ticketCode}", "post", "Check in ticket by code", "Tickets", { admin: true, parameters: [pathParam("ticketCode", "Ticket code.")], requestBody: { type: "object", required: ["qrToken"], properties: { qrToken: { type: "string" } } }, success: objectSchema, errorCodes: ["400", "401", "403", "404", "429", "500"] });
  add("/api/event-tickets/check-in", "post", "Check in ticket by QR token", "Tickets", { admin: true, requestBody: { type: "object", required: ["qrToken"], properties: { qrToken: { type: "string" } } }, success: objectSchema, errorCodes: ["400", "401", "403", "404", "429", "500"] });

  // Printables, articles, newsletter, and authentication.
  add("/api/printables", "get", "List active printables", "Printables", { success: arraySchema(), errorCodes: ["500"] });
  add("/api/printables/{id}", "get", "Get printable detail", "Printables", { parameters: [pathParam("id", "Printable ID or slug.")], success: objectSchema, errorCodes: ["404", "500"] });
  add("/api/printables/{id}/download", "post", "Download printable", "Printables", { parameters: [pathParam("id", "Printable ID or slug.")], requestBody: { type: "object", required: ["name", "email"], properties: { name: { type: "string" }, email: { type: "string", format: "email" }, whatsapp: { type: "string" } } }, success: objectSchema, successStatus: "201", errorCodes: ["400", "404", "500"] });
  add("/api/articles", "get", "List published articles", "Articles", { parameters: [queryParam("page", "Page number."), queryParam("limit", "Items per page."), queryParam("search", "Search article title.")], success: objectSchema, errorCodes: ["500"] });
  add("/api/articles/{slug}", "get", "Get published article", "Articles", { parameters: [pathParam("slug", "Article slug.")], success: objectSchema, errorCodes: ["404", "500"] });
  add("/api/articles/{slug}/comments", "get", "List article comments", "Articles", { parameters: [pathParam("slug", "Article slug.")], success: arraySchema(), errorCodes: ["404", "500"] });
  add("/api/articles/{slug}/comments", "post", "Create article comment", "Articles", { auth: true, parameters: [pathParam("slug", "Article slug.")], requestBody: { type: "object", required: ["content"], properties: { content: { type: "string", maxLength: 2000 } } }, success: objectSchema, successStatus: "201", errorCodes: ["400", "401", "404", "500"] });
  add("/api/article-categories", "get", "List article categories", "Articles", { success: arraySchema(), errorCodes: ["500"] });
  add("/api/newsletter", "post", "Subscribe to newsletter", "Marketing", { requestBody: { type: "object", required: ["email"], properties: { email: { type: "string", format: "email" } } }, success: objectSchema, successStatus: "201", errorCodes: ["400", "500"] });
  add("/api/auth/register", "post", "Register user", "Authentication", { requestBody: { type: "object", required: ["name", "email", "password"], properties: { name: { type: "string" }, email: { type: "string", format: "email" }, password: { type: "string", format: "password" }, confirmPassword: { type: "string", format: "password" } } }, success: objectSchema, successStatus: "201", errorCodes: ["400", "409", "429", "500"] });
  add("/api/auth/forgot-password", "post", "Request password reset", "Authentication", { requestBody: { type: "object", required: ["email"], properties: { email: { type: "string", format: "email" } } }, success: objectSchema, errorCodes: ["400", "429", "500"] });
  add("/api/auth/reset-password", "post", "Reset password", "Authentication", { requestBody: { type: "object", required: ["email", "token", "newPassword"], properties: { email: { type: "string", format: "email" }, token: { type: "string" }, newPassword: { type: "string", format: "password" } } }, success: objectSchema, errorCodes: ["400", "500"] });
  add("/api/auth/{nextauth}", "get", "NextAuth handler", "Authentication", { parameters: [pathParam("nextauth", "NextAuth action such as csrf, session, or providers.")], success: objectSchema, errorCodes: ["400", "500"] });
  add("/api/auth/{nextauth}", "post", "NextAuth callback handler", "Authentication", { parameters: [pathParam("nextauth", "NextAuth action.")], success: objectSchema, errorCodes: ["400", "401", "500"] });

  // Shipping and external service adapters.
  add("/api/shipping/destinations", "get", "Search shipping destinations", "Shipping", { parameters: [queryParam("search", "Destination search query.")], success: arraySchema(), errorCodes: ["400", "500"] });
  add("/api/shipping/cost", "post", "Calculate shipping cost", "Shipping", { requestBody: { type: "object", required: ["destinationId", "weightGrams", "courier"], properties: { destinationId: { type: "string" }, weightGrams: { type: "integer", minimum: 1 }, courier: { type: "string" } } }, success: objectSchema, errorCodes: ["400", "500"] });
  add("/api/shipping/reverse-geocode", "get", "Reverse geocode coordinates", "Shipping", { parameters: [queryParam("latitude", "Latitude."), queryParam("longitude", "Longitude.")], success: objectSchema, errorCodes: ["400", "500"] });
  add("/api/webhooks/midtrans", "get", "Check Midtrans webhook status", "Webhooks", { success: objectSchema, errorCodes: ["500"] });
  add("/api/webhooks/midtrans", "post", "Process Midtrans notification", "Webhooks", { requestBody: objectSchema, success: objectSchema, errorCodes: ["400", "500"] });

  // Admin API.
  add("/api/admin/analytics", "get", "Get admin analytics", "Admin", { admin: true, success: objectSchema, errorCodes: ["401", "403", "500"] });
  add("/api/admin/articles", "get", "List admin articles", "Admin", { admin: true, parameters: [queryParam("status", "DRAFT or PUBLISHED."), queryParam("page", "Page number."), queryParam("limit", "Items per page.")], success: objectSchema, errorCodes: ["401", "403", "500"] });
  add("/api/admin/articles", "post", "Create article", "Admin", { admin: true, requestBody: objectSchema, success: objectSchema, successStatus: "201", errorCodes: ["400", "401", "403", "500"] });
  add("/api/admin/articles/{id}", "get", "Get admin article", "Admin", { admin: true, parameters: [pathParam("id", "Article ID.")], success: objectSchema, errorCodes: ["401", "403", "404", "500"] });
  add("/api/admin/articles/{id}", "put", "Update article", "Admin", { admin: true, parameters: [pathParam("id", "Article ID.")], requestBody: objectSchema, success: objectSchema, errorCodes: ["400", "401", "403", "404", "500"] });
  add("/api/admin/articles/{id}", "delete", "Delete article", "Admin", { admin: true, parameters: [pathParam("id", "Article ID.")], success: objectSchema, errorCodes: ["401", "403", "404", "500"] });
  add("/api/admin/article-categories", "get", "List article categories for admin", "Admin", { admin: true, success: arraySchema(), errorCodes: ["401", "403", "500"] });
  add("/api/admin/article-categories", "post", "Create article category", "Admin", { admin: true, requestBody: objectSchema, success: objectSchema, successStatus: "201", errorCodes: ["400", "401", "403", "500"] });
  add("/api/admin/article-categories/{id}", "put", "Update article category", "Admin", { admin: true, parameters: [pathParam("id", "Category ID.")], requestBody: objectSchema, success: objectSchema, errorCodes: ["400", "401", "403", "404", "500"] });
  add("/api/admin/article-categories/{id}", "delete", "Delete article category", "Admin", { admin: true, parameters: [pathParam("id", "Category ID.")], success: objectSchema, errorCodes: ["401", "403", "404", "500"] });
  add("/api/admin/products", "get", "List products for admin", "Admin", { admin: true, success: objectSchema, errorCodes: ["401", "403", "500"] });
  add("/api/admin/products", "post", "Create product", "Admin", { admin: true, requestBody: objectSchema, success: objectSchema, successStatus: "201", errorCodes: ["400", "401", "403", "500"] });
  add("/api/admin/products/{id}", "get", "Get admin product", "Admin", { admin: true, parameters: [pathParam("id", "Product ID.")], success: objectSchema, errorCodes: ["401", "403", "404", "500"] });
  add("/api/admin/products/{id}", "put", "Update product", "Admin", { admin: true, parameters: [pathParam("id", "Product ID.")], requestBody: objectSchema, success: objectSchema, errorCodes: ["400", "401", "403", "404", "500"] });
  add("/api/admin/products/{id}", "delete", "Delete product", "Admin", { admin: true, parameters: [pathParam("id", "Product ID.")], success: objectSchema, errorCodes: ["401", "403", "404", "500"] });
  add("/api/admin/product-categories", "get", "List product categories for admin", "Admin", { admin: true, success: arraySchema(), errorCodes: ["401", "403", "500"] });
  add("/api/admin/product-categories", "post", "Create product category", "Admin", { admin: true, requestBody: objectSchema, success: objectSchema, successStatus: "201", errorCodes: ["400", "401", "403", "500"] });
  add("/api/admin/product-categories/{id}", "put", "Update product category", "Admin", { admin: true, parameters: [pathParam("id", "Category ID.")], requestBody: objectSchema, success: objectSchema, errorCodes: ["400", "401", "403", "404", "500"] });
  add("/api/admin/product-categories/{id}", "delete", "Delete product category", "Admin", { admin: true, parameters: [pathParam("id", "Category ID.")], success: objectSchema, errorCodes: ["401", "403", "404", "500"] });
  add("/api/admin/product-bundles", "get", "List product bundles", "Admin", { admin: true, success: arraySchema(), errorCodes: ["401", "403", "500"] });
  add("/api/admin/product-bundles", "post", "Create product bundle", "Admin", { admin: true, requestBody: objectSchema, success: objectSchema, successStatus: "201", errorCodes: ["400", "401", "403", "500"] });
  add("/api/admin/product-bundles/{id}", "put", "Update product bundle", "Admin", { admin: true, parameters: [pathParam("id", "Bundle ID.")], requestBody: objectSchema, success: objectSchema, errorCodes: ["400", "401", "403", "404", "500"] });
  add("/api/admin/product-bundles/{id}", "delete", "Delete product bundle", "Admin", { admin: true, parameters: [pathParam("id", "Bundle ID.")], success: objectSchema, errorCodes: ["401", "403", "404", "500"] });
  add("/api/admin/orders", "get", "List all orders", "Admin", { admin: true, parameters: [queryParam("status", "Order status."), queryParam("page", "Page number."), queryParam("limit", "Items per page."), queryParam("search", "Search order number or email.")], success: objectSchema, errorCodes: ["401", "403", "500"] });
  add("/api/admin/orders/{id}", "put", "Update order status", "Admin", { admin: true, parameters: [pathParam("id", "Order ID.")], requestBody: { type: "object", required: ["status"], properties: { status: { type: "string" } } }, success: objectSchema, errorCodes: ["400", "401", "403", "404", "500"] });
  add("/api/admin/events", "get", "List events for admin", "Admin", { admin: true, success: arraySchema(), errorCodes: ["401", "403", "500"] });
  add("/api/admin/events", "post", "Create event", "Admin", { admin: true, requestBody: objectSchema, success: objectSchema, successStatus: "201", errorCodes: ["400", "401", "403", "500"] });
  add("/api/admin/events/{id}", "get", "Get admin event", "Admin", { admin: true, parameters: [pathParam("id", "Event ID.")], success: objectSchema, errorCodes: ["401", "403", "404", "500"] });
  add("/api/admin/events/{id}", "patch", "Update event", "Admin", { admin: true, parameters: [pathParam("id", "Event ID.")], requestBody: objectSchema, success: objectSchema, errorCodes: ["400", "401", "403", "404", "500"] });
  add("/api/admin/events/{id}", "delete", "Delete event", "Admin", { admin: true, parameters: [pathParam("id", "Event ID.")], success: objectSchema, errorCodes: ["401", "403", "404", "500"] });
  add("/api/admin/event-bookings", "get", "List event bookings", "Admin", { admin: true, parameters: [queryParam("status", "Booking status."), queryParam("page", "Page number."), queryParam("limit", "Items per page.")], success: objectSchema, errorCodes: ["401", "403", "500"] });
  add("/api/admin/event-bookings/{bookingNumber}/resend-email", "post", "Resend event ticket email", "Admin", { admin: true, parameters: [pathParam("bookingNumber", "Booking number.")], success: objectSchema, errorCodes: ["400", "401", "403", "404", "500"] });
  add("/api/admin/printables", "get", "List printables for admin", "Admin", { admin: true, success: arraySchema(), errorCodes: ["401", "403", "500"] });
  add("/api/admin/printables", "post", "Create printable", "Admin", { admin: true, requestBody: objectSchema, success: objectSchema, successStatus: "201", errorCodes: ["400", "401", "403", "500"] });
  add("/api/admin/printables/{id}", "patch", "Update printable", "Admin", { admin: true, parameters: [pathParam("id", "Printable ID.")], requestBody: objectSchema, success: objectSchema, errorCodes: ["400", "401", "403", "404", "500"] });
  add("/api/admin/printables/{id}", "delete", "Delete printable", "Admin", { admin: true, parameters: [pathParam("id", "Printable ID.")], success: objectSchema, errorCodes: ["401", "403", "404", "500"] });
  add("/api/admin/printable-leads", "get", "List printable leads", "Admin", { admin: true, parameters: [queryParam("page", "Page number."), queryParam("limit", "Items per page.")], success: objectSchema, errorCodes: ["401", "403", "500"] });
  add("/api/admin/upload", "post", "Upload admin image", "Admin", { admin: true, requestBody: { type: "object", description: "multipart/form-data upload payload" }, success: objectSchema, successStatus: "201", errorCodes: ["400", "401", "403", "500"] });
  add("/api/admin/printables/upload", "post", "Upload printable PDF", "Admin", { admin: true, requestBody: { type: "object", description: "multipart/form-data PDF upload payload" }, success: objectSchema, successStatus: "201", errorCodes: ["400", "401", "403", "500"] });

  add("/api/swagger", "get", "Get OpenAPI document", "Documentation", { success: objectSchema, errorCodes: ["500"] });

  return {
    openapi: "3.0.3",
    info: {
      title: "Marica API",
      version: "2.0.0",
      description: "Dokumentasi API untuk website, katalog, checkout, event, printable, artikel, autentikasi, dan admin Marica.",
    },
    servers: [
      { url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000", description: "Configured API server" },
      { url: "http://localhost:3000", description: "Local development" },
    ],
    tags: [
      { name: "Authentication", description: "Registrasi dan pemulihan akun." },
      { name: "Content", description: "Konten landing page." },
      { name: "Catalog", description: "Produk dan kategori produk." },
      { name: "Cart", description: "Keranjang user yang sedang login." },
      { name: "Orders", description: "Checkout dan pesanan." },
      { name: "Events", description: "Event, booking, dan tiket." },
      { name: "Tickets", description: "E-ticket dan check-in QR." },
      { name: "Printables", description: "Materi aktivitas dan download." },
      { name: "Articles", description: "Artikel dan komentar." },
      { name: "Shipping", description: "Destinasi dan ongkos kirim." },
      { name: "Marketing", description: "Newsletter." },
      { name: "Admin", description: "Endpoint yang membutuhkan role ADMIN." },
      { name: "Webhooks", description: "Callback dari payment provider." },
      { name: "Documentation", description: "Endpoint dokumentasi API." },
    ],
    paths,
    components: {
      securitySchemes: {
        SessionCookie: {
          type: "apiKey",
          in: "cookie",
          name: "authjs.session-token",
          description: "Session cookie Auth.js. Pada HTTPS production dapat menggunakan __Secure-authjs.session-token.",
        },
      },
    },
  };
};
