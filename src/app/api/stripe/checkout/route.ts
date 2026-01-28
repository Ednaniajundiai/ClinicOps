/**
 * API Route para criar Checkout Session do Stripe.
 * Permite que usuarios iniciem o processo de assinatura.
 */
import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PLANS, StripePlanKey } from '@/lib/stripe/client'
import { STRIPE_URLS } from '@/lib/stripe/config'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Cria cliente Supabase no servidor
 */
function createSupabaseClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planKey, clinicaId } = body as { planKey: StripePlanKey; clinicaId: string }

    // Validar plano
    if (!planKey || !STRIPE_PLANS[planKey]) {
      return NextResponse.json(
        { error: 'Plano invalido' },
        { status: 400 }
      )
    }

    const plan = STRIPE_PLANS[planKey]
    
    // Obter usuario autenticado
    const supabase = createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario nao autenticado' },
        { status: 401 }
      )
    }

    // Buscar dados da clinica
    const { data: clinica, error: clinicaError } = await supabase
      .from('clinicas')
      .select('id, nome, email, stripe_customer_id')
      .eq('id', clinicaId)
      .single()

    if (clinicaError || !clinica) {
      return NextResponse.json(
        { error: 'Clinica nao encontrada' },
        { status: 404 }
      )
    }

    // Criar ou reutilizar customer no Stripe
    let customerId = clinica.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: clinica.nome,
        metadata: {
          clinica_id: clinica.id,
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      // Salvar customer_id na clinica
      await supabase
        .from('clinicas')
        .update({ stripe_customer_id: customerId })
        .eq('id', clinica.id)
    }

    // Criar checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${STRIPE_URLS.success}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: STRIPE_URLS.cancel,
      metadata: {
        clinica_id: clinica.id,
        plan_key: planKey,
      },
      subscription_data: {
        metadata: {
          clinica_id: clinica.id,
          plan_key: planKey,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      locale: 'pt-BR',
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Erro ao criar checkout session:', error)
    return NextResponse.json(
      { error: 'Erro interno ao processar checkout' },
      { status: 500 }
    )
  }
}
