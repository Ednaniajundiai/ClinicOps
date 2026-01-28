/**
 * Configuracoes e tipos para integracao Stripe.
 */

/**
 * URLs de redirecionamento apos checkout
 */
export const STRIPE_URLS = {
  success: `${process.env.NEXT_PUBLIC_APP_URL}/admin?checkout=success`,
  cancel: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancelled`,
  portal: `${process.env.NEXT_PUBLIC_APP_URL}/admin`,
}

/**
 * Eventos do webhook que processamos
 */
export const STRIPE_WEBHOOK_EVENTS = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
] as const

export type StripeWebhookEvent = (typeof STRIPE_WEBHOOK_EVENTS)[number]

/**
 * Mapeamento de status de subscription do Stripe para status da clinica
 */
export const SUBSCRIPTION_STATUS_MAP: Record<string, string> = {
  active: 'ativa',
  trialing: 'trial',
  past_due: 'suspensa',
  canceled: 'cancelada',
  unpaid: 'suspensa',
  incomplete: 'trial',
  incomplete_expired: 'cancelada',
  paused: 'suspensa',
}
