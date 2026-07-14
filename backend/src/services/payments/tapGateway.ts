import axios from 'axios';
import { PaymentAdapter, InitiatePaymentInput, InitiatePaymentResult } from './types';

/**
 * Tap Payments (https://developers.tap.company) is used as the platform's direct
 * card / Mada / Apple Pay gateway, and also routes the Deema BNPL flow via the
 * same Charges API using a special `source.id`.
 *
 * NOT WIRED YET: set TAP_SECRET_KEY in .env to activate real calls.
 * See /docs/PAYMENTS.md for the full setup checklist.
 */
export function createTapAdapter(deema = false): PaymentAdapter {
  return {
    async initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
      const secretKey = process.env.TAP_SECRET_KEY;
      const baseUrl = process.env.TAP_API_BASE_URL || 'https://api.tap.company/v2';
      const apiUrl = process.env.API_URL || 'http://localhost:4000';

      const payload = {
        amount: Number(input.order.grand_total),
        currency: deema ? 'KWD' : input.order.currency,
        source: { id: deema ? 'src_deema' : 'src_all' },
        customer: input.customerEmail ? { email: input.customerEmail } : undefined,
        description: `Takhayir order ${input.order.order_number}`,
        redirect: { url: `${apiUrl}/api/payments/tap/redirect?order=${input.order.order_number}` },
        post: { url: `${apiUrl}/api/payments/tap/webhook` },
        metadata: { order_id: input.order.id, order_number: input.order.order_number }
      };

      if (!secretKey) {
        return {
          gateway: deema ? 'deema' : 'tap',
          status: 'not_configured',
          gateway_reference: null,
          checkout_url: null,
          raw: {
            message: 'TAP_SECRET_KEY is not set — payment not actually initiated. Fill in your Tap Payments credentials to go live.',
            wouldSendPayload: payload
          }
        };
      }

      const { data } = await axios.post(`${baseUrl}/charges`, payload, {
        headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' }
      });

      return {
        gateway: deema ? 'deema' : 'tap',
        status: 'initiated',
        gateway_reference: data.id,
        checkout_url: data.transaction?.url ?? null,
        raw: data
      };
    },

    parseWebhook(payload) {
      return {
        reference: String(payload.id ?? ''),
        status: String(payload.status ?? 'unknown').toUpperCase(),
        raw: payload
      };
    }
  };
}
