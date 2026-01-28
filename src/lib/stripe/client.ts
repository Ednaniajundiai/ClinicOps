/**
 * Cliente Stripe para uso no servidor.
 * Configura a instância do Stripe com a chave secreta.
 */
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY não está definida nas variáveis de ambiente')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
})

/**
 * IDs dos produtos/preços no Stripe.
 * Estes devem ser criados no dashboard do Stripe ou via API.
 */
export const STRIPE_PLANS = {
  starter: {
    name: 'Starter',
    priceId: process.env.STRIPE_PRICE_STARTER || '',
    price: 9700, // centavos
  },
  professional: {
    name: 'Professional',
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL || '',
    price: 19700, // centavos
  },
  enterprise: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_PRICE_ENTERPRISE || '',
    price: 39700, // centavos
  },
} as const

export type StripePlanKey = keyof typeof STRIPE_PLANS
