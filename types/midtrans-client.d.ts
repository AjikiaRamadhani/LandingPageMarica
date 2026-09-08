declare module "midtrans-client" {
  type TransactionDetails = {
    order_id: string;
    gross_amount: number;
  };

  type TransactionParameters = {
    transaction_details: TransactionDetails;
    customer_details?: Record<string, unknown>;
    item_details?: Array<Record<string, string | number>>;
  };

  class Snap {
    constructor(options: { isProduction: boolean; serverKey: string; clientKey: string });
    createTransaction(parameters: TransactionParameters): Promise<{
      token: string;
      redirect_url: string;
    }>;
  }

  class CoreApi {
    constructor(options: { isProduction: boolean; serverKey: string; clientKey: string });
  }

  const midtransClient: { Snap: typeof Snap; CoreApi: typeof CoreApi };
  export default midtransClient;
}