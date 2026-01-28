/**
 * API Route para criar sessao do Portal do Cliente Stripe.
 * Permite que usuarios gerenciem suas assinaturas.
 */
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
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
    const { clinicaId } = body as { clinicaId: string }

    if (!clinicaId) {
      return NextResponse.json(
        { error: 'ID da clinica obrigatorio' },
        { status: 400 }
      )
    }

    // Verificar autenticacao
    const supabase = createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario nao autenticado' },
        { status: 401 }
      )
    }

    // Buscar clinica e verificar permissao
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('clinica_id, perfil')
      .eq('auth_user_id', user.id)
      .single()

    if (!usuario || (usuario.clinica_id !== clinicaId && usuario.perfil !== 'master')) {
      return NextResponse.json(
        { error: 'Sem permissao para acessar esta clinica' },
        { status: 403 }
      )
    }

    // Buscar customer_id da clinica
    const { data: clinica, error: clinicaError } = await supabase
      .from('clinicas')
      .select('stripe_customer_id')
      .eq('id', clinicaId)
      .single()

    if (clinicaError || !clinica?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Clinica sem assinatura ativa' },
        { status: 400 }
      )
    }

    // Criar sessao do portal
    const session = await stripe.billingPortal.sessions.create({
      customer: clinica.stripe_customer_id,
      return_url: STRIPE_URLS.portal,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Erro ao criar portal session:', error)
    return NextResponse.json(
      { error: 'Erro interno ao criar portal' },
      { status: 500 }
    )
  }
}
