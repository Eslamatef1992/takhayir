import { Payment } from '../../models';
import { InitiatePaymentInput, PaymentAdapter, SupportedGateway } from './types';
import { createTapAdapter } from './tapGateway';
import { talyAdapter } from './talyGateway';
import { codAdapter } from './codGateway';

const adapters: Record<SupportedGateway, PaymentAdapter> = {
  tap: createTapAdapter(false),
  deema: createTapAdapter(true),
  taly: talyAdapter,
  cod: codAdapter
};

export function getAdapter(gateway: SupportedGateway): PaymentAdapter {
  return adapters[gateway];
}

export async function initiatePayment(input: InitiatePaymentInput) {
  const adapter = getAdapter(input.gateway);
  const result = await adapter.initiate(input);

  const payment = await Payment.create({
    order_id: input.order.id,
    gateway: input.gateway,
    gateway_reference: result.gateway_reference,
    amount: Number(input.order.grand_total),
    currency: input.order.currency,
    status: result.status === 'not_configured' ? 'initiated' : (result.status as any),
    raw_response: result.raw
  });

  return { payment, checkout_url: result.checkout_url, status: result.status };
}

export async function handleWebhook(gateway: SupportedGateway, payload: Record<string, unknown>) {
  const adapter = getAdapter(gateway);
  const parsed = adapter.parseWebhook(payload);

  const payment = await Payment.findOne({ where: { gateway_reference: parsed.reference } });
  if (!payment) return null;

  const capturedStatuses = ['CAPTURED', 'PAID', 'COMPLETED', 'SUCCESS'];
  const failedStatuses = ['FAILED', 'DECLINED', 'CANCELLED'];

  payment.status = capturedStatuses.includes(parsed.status)
    ? 'captured'
    : failedStatuses.includes(parsed.status)
      ? 'failed'
      : 'pending';
  payment.raw_response = parsed.raw;
  await payment.save();

  return payment;
}
