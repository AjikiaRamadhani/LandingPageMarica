export class WhatsAppCloudConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WhatsAppCloudConfigurationError";
  }
}

export function normalizeWhatsAppPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  const internationalNumber = digits.startsWith("0")
    ? `62${digits.slice(1)}`
    : digits;

  if (!/^[1-9]\d{7,14}$/.test(internationalNumber)) {
    throw new Error("Nomor WhatsApp harus menggunakan format internasional yang valid");
  }

  return internationalNumber;
}

export async function sendPrintableDownloadWhatsApp(input: {
  phone: string;
  name: string;
  printableTitle: string;
  downloadUrl: string;
}) {
  const accessToken = process.env.WHATSAPP_CLOUD_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_PRINTABLE_TEMPLATE_NAME;
  const language = process.env.WHATSAPP_PRINTABLE_TEMPLATE_LANGUAGE || "id";
  const apiVersion = process.env.WHATSAPP_GRAPH_API_VERSION;

  if (!accessToken || !phoneNumberId || !templateName || !apiVersion) {
    throw new WhatsAppCloudConfigurationError(
      "WhatsApp Cloud API belum dikonfigurasi lengkap",
    );
  }

  if (
    !/^[A-Za-z0-9_]+$/.test(templateName) ||
    !/^[a-z]{2}(?:_[A-Z]{2})?$/.test(language) ||
    !/^v\d+\.\d+$/.test(apiVersion)
  ) {
    throw new WhatsAppCloudConfigurationError(
      "Konfigurasi template atau versi WhatsApp Cloud API tidak valid",
    );
  }

  const phone = normalizeWhatsAppPhone(input.phone);
  const response = await fetch(
    `https://graph.facebook.com/${apiVersion}/${encodeURIComponent(phoneNumberId)}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: "template",
        template: {
          name: templateName,
          language: { code: language },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: input.name },
                { type: "text", text: input.printableTitle },
                { type: "text", text: input.downloadUrl },
              ],
            },
          ],
        },
      }),
      signal: AbortSignal.timeout(10_000),
    },
  );

  if (!response.ok) {
    throw new Error(`WhatsApp Cloud API returned HTTP ${response.status}`);
  }

  const result = (await response.json()) as {
    messages?: Array<{ id?: string }>;
  };

  if (!result.messages?.[0]?.id) {
    throw new Error("WhatsApp Cloud API did not confirm message acceptance");
  }

  return { messageId: result.messages[0].id };
}
