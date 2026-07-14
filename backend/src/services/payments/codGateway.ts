import { PaymentAdapter, InitiatePaymentInput, InitiatePaymentResult } from './types';

/** Cash on delivery — no external gateway involved. */
export const codAdapter: PaymentAdapter = {
  async initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    return {
      gateway: 'cod',
      status: 'pending',
      gateway_reference: `COD-${input.order.order_number}`,
      checkout_url: null,
      raw: { message: 'Cash on delivery — payment collected at delivery time' }
    };
  },
  parseWebhook(payload) {
    return { reference: String(payload.reference ?? ''), status: 'PENDING', raw: payload };
  }
};
