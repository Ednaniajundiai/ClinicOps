/**
 * API Route para processar webhooks do Stripe.
 * Atualiza o status da assinatura no banco de dados.
 */
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe/client'
import { SUBSCRIPTION_STATUS_MAP } from '@/lib/stripe/config'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

/**
 * Cliente Supabase com service role para bypass de RLS
 */
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Assinatura do webhook ausente' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Erro ao verificar webhook:', error)
    return NextResponse.json(
      { error: 'Webhook invalido' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Evento nao tratado: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return NextResponse.json(
      { error: 'Erro ao processar evento' },
      { status: 500 }
    )
  }
}

/**
 * Processa checkout completado - atualiza subscription_id na clinica
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const clinicaId = session.metadata?.clinica_id
  const planKey = session.metadata?.plan_key

  if (!clinicaId) {
    console.error('clinica_id ausente no metadata do checkout')
    return
  }

  // Buscar plano pelo nome
  const { data: plano } = await supabaseAdmin
    .from('planos')
    .select('id')
    .eq('nome', getPlanNameFromKey(planKey || ''))
    .single()

  // Atualizar clinica com subscription_id e plano
  await supabaseAdmin
    .from('clinicas')
    .update({
      stripe_subscription_id: session.subscription as string,
      plano_id: plano?.id,
      status: 'ativa',
    })
    .eq('id', clinicaId)

  console.log(`Checkout completado para clinica ${clinicaId}`)
}

/**
 * Processa atualizacao de subscription
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const clinicaId = subscription.metadata?.clinica_id

  if (!clinicaId) {
    // Tentar buscar pelo customer_id
    const { data: clinica } = await supabaseAdmin
      .from('clinicas')
      .select('id')
      .eq('stripe_customer_id', subscription.customer as string)
      .single()

    if (!clinica) {
      console.error('Clinica nao encontrada para subscription')
      return
    }

    await updateClinicaStatus(clinica.id, subscription.status)
    return
  }

  await updateClinicaStatus(clinicaId, subscription.status)
}

/**
 * Processa cancelamento de subscription
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const clinicaId = subscription.metadata?.clinica_id

  if (!clinicaId) {
    const { data: clinica } = await supabaseAdmin
      .from('clinicas')
      .select('id')
      .eq('stripe_subscription_id', subscription.id)
      .single()

    if (clinica) {
      await supabaseAdmin
        .from('clinicas')
        .update({ status: 'cancelada', stripe_subscription_id: null })
        .eq('id', clinica.id)
    }
    return
  }

  await supabaseAdmin
    .from('clinicas')
    .update({ status: 'cancelada', stripe_subscription_id: null })
    .eq('id', clinicaId)

  console.log(`Subscription cancelada para clinica ${clinicaId}`)
}

/**
 * Processa pagamento bem-sucedido
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string
  
  if (!subscriptionId) return

  const { data: clinica } = await supabaseAdmin
    .from('clinicas')
    .select('id')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (clinica) {
    await supabaseAdmin
      .from('clinicas')
      .update({ status: 'ativa' })
      .eq('id', clinica.id)
  }
}

/**
 * Processa falha de pagamento
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string
  
  if (!subscriptionId) return

  const { data: clinica } = await supabaseAdmin
    .from('clinicas')
    .select('id')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (clinica) {
    await supabaseAdmin
      .from('clinicas')
      .update({ status: 'suspensa' })
      .eq('id', clinica.id)

    console.log(`Pagamento falhou para clinica ${clinica.id}`)
  }
}

/**
 * Atualiza status da clinica baseado no status do Stripe
 */
async function updateClinicaStatus(clinicaId: string, stripeStatus: string) {
  const status = SUBSCRIPTION_STATUS_MAP[stripeStatus] || 'trial'

  await supabaseAdmin
    .from('clinicas')
    .update({ status })
    .eq('id', clinicaId)

  console.log(`Status da clinica ${clinicaId} atualizado para ${status}`)
}

/**
 * Converte key do plano para nome
 */
function getPlanNameFromKey(key: string): string {
  const mapping: Record<string, string> = {
    starter: 'Starter',
    professional: 'Professional',
    enterprise: 'Enterprise',
  }
  return mapping[key] || 'Starter'
}
