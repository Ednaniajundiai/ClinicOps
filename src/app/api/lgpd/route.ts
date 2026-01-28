import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * API para operacoes LGPD (Lei Geral de Protecao de Dados)
 * Suporta: exportar dados, anonimizar paciente
 */

async function getSupabaseClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Ignora erro em Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // Ignora erro em Server Components
          }
        },
      },
    }
  )
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const pacienteId = searchParams.get('paciente_id')

    // Verificar autenticacao
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    // Verificar perfil do usuario
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('perfil, clinica_id')
      .eq('auth_user_id', user.id)
      .single()

    if (!usuario || !['admin', 'master'].includes(usuario.perfil)) {
      return NextResponse.json(
        { error: 'Apenas administradores podem acessar dados LGPD' },
        { status: 403 }
      )
    }

    if (action === 'exportar' && pacienteId) {
      // Exportar dados do paciente
      const { data, error } = await supabase
        .rpc('exportar_dados_paciente', { p_paciente_id: pacienteId })

      if (error) {
        console.error('Erro ao exportar dados:', error)
        return NextResponse.json(
          { error: error.message || 'Erro ao exportar dados' },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        dados: data,
        exportado_em: new Date().toISOString(),
      })
    }

    return NextResponse.json(
      { error: 'Acao invalida' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Erro na API LGPD:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient()
    const body = await request.json()
    const { action, paciente_id, motivo } = body

    // Verificar autenticacao
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    // Verificar perfil do usuario
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('perfil, clinica_id')
      .eq('auth_user_id', user.id)
      .single()

    if (!usuario || !['admin', 'master'].includes(usuario.perfil)) {
      return NextResponse.json(
        { error: 'Apenas administradores podem executar acoes LGPD' },
        { status: 403 }
      )
    }

    if (action === 'anonimizar' && paciente_id) {
      // Anonimizar paciente (direito ao esquecimento)
      const { data, error } = await supabase
        .rpc('anonimizar_paciente', { p_paciente_id: paciente_id })

      if (error) {
        console.error('Erro ao anonimizar:', error)
        return NextResponse.json(
          { error: error.message || 'Erro ao anonimizar paciente' },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Paciente anonimizado com sucesso',
        anonimizado_em: new Date().toISOString(),
      })
    }

    if (action === 'solicitar_exclusao' && paciente_id) {
      // Registrar solicitacao de exclusao
      const { error } = await supabase.from('auditoria').insert({
        clinica_id: usuario.clinica_id,
        usuario_id: user.id,
        acao: 'INSERT',
        tabela: 'solicitacoes_lgpd',
        registro_id: paciente_id,
        dados_novos: {
          tipo: 'exclusao',
          paciente_id,
          motivo: motivo || 'Solicitacao do titular',
          status: 'pendente',
          solicitado_em: new Date().toISOString(),
        },
      })

      if (error) {
        console.error('Erro ao registrar solicitacao:', error)
        return NextResponse.json(
          { error: 'Erro ao registrar solicitacao' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Solicitacao de exclusao registrada',
      })
    }

    return NextResponse.json(
      { error: 'Acao invalida' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Erro na API LGPD:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
