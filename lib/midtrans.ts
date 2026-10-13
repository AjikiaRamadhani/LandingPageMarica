import midtransClient from "midtrans-client";
import { createPaymentTransaction } from "@/lib/payment-gateway";

export const snap = { createTransaction: createPaymentTransaction };

export const coreApi = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});
