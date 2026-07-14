import { Order } from '../../models';

export type SupportedGateway = 'tap' | 'deema' | 'taly' | 'cod';

export interface InitiatePaymentInput {
  gateway: SupportedGateway;
  order: Order;
  customerEmail?: string;
}

export interface InitiatePaymentResult {
  gateway: SupportedGateway;
  status: 'initiated' | 'pending' | 'captured' | 'not_configured';
  gateway_reference: string | null;
  checkout_url: string | null;
  raw: Record<string, unknown>;
}

export interface PaymentAdapter {
  initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult>;
  /** Verify + normalize an incoming webhook payload from the gateway */
  parseWebhook(payload: Record<string, unknown>): { reference: string; status: string; raw: Record<string, unknown> };
}
