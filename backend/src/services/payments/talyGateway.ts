import axios from 'axios';
import { PaymentAdapter, InitiatePaymentInput, InitiatePaymentResult } from './types';

/**
 * Taly (https://docs.taly.io) — Kuwait-licensed BNPL provider.
 * Integration flow: merchant login -> token -> create/initiate order -> redirect
 * customer to checkout_url -> poll/get order status or listen to webhook.
 *
 * NOT WIRED YET: set TALY_MERCHANT_USERNAME / TALY_MERCHANT_PASSWORD in .env
 * to activate real calls. See /docs/PAYMENTS.md.
 */
async function getTalyToken(baseUrl: string, username: string, password: string): Promise<string> {
  const { data } = await axios.post(`${baseUrl}/auth/login`, { username, password });
  return data.token ?? data.access_token;
}

export const talyAdapter: PaymentAdapter = {
  async initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    const baseUrl = process.env.TALY_API_BASE_URL || 'https://api.taly.io';
    const username = process.env.TALY_MERCHANT_USERNAME;
    const password = process.env.TALY_MERCHANT_PASSWORD;
    const apiUrl = process.env.API_URL || 'http://localhost:4000';

    const orderPayload = {
      amount: Number(input.order.grand_total),
      currency: input.order.currency,
      order_reference: input.order.order_number,
      redirect_url: `${apiUrl}/api/payments/taly/redirect?order=${input.order.order_number}`,
      webhook_url: `${apiUrl}/api/payments/taly/webhook`
    };

    if (!username || !password) {
      return {
        gateway: 'taly',
        status: 'not_configured',
        gateway_reference: null,
        checkout_url: null,
        raw: {
          message: 'TALY_MERCHANT_USERNAME / TALY_MERCHANT_PASSWORD are not set — payment not actually initiated.',
          wouldSendPayload: orderPayload
        }
      };
    }

    const token = await getTalyToken(baseUrl, username, password);
    const { data } = await axios.post(`${baseUrl}/orders/initiate`, orderPayload, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    });

    return {
      gateway: 'taly',
      status: 'initiated',
      gateway_reference: data.orderToken ?? data.OrderID ?? data.order_id,
      checkout_url: data.checkout_url ?? null,
      raw: data
    };
  },

  parseWebhook(payload) {
    return {
      reference: String(payload.orderToken ?? payload.OrderID ?? ''),
      status: String(payload.status ?? 'unknown').toUpperCase(),
      raw: payload
    };
  }
};
