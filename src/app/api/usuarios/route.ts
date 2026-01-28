import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { UsuarioInsert } from '@/lib/supabase/database.types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, email, perfil, telefone, especialidade, registro_profissional, clinica_id, comAcesso, password } = body

    // Verificar se usuario esta autenticado
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Nao autorizado' },
        { status: 401 }
      )
    }

    // Verificar se usuario e admin da clinica
    const { data: currentUser } = await supabase
      .from('usuarios')
      .select('perfil, clinica_id')
      .eq('auth_user_id', user.id)
      .single()

    if (!currentUser || (currentUser.perfil !== 'admin' && currentUser.perfil !== 'master')) {
      return NextResponse.json(
        { error: 'Sem permissao para criar usuarios' },
        { status: 403 }
      )
    }

    // Verificar se clinica_id corresponde (a menos que seja master)
    if (currentUser.perfil !== 'master' && currentUser.clinica_id !== clinica_id) {
      return NextResponse.json(
        { error: 'Sem permissao para criar usuarios nesta clinica' },
        { status: 403 }
      )
    }

    const adminClient = createAdminClient()

    // Se usuario deve ter acesso ao sistema, criar no Auth
    if (comAcesso && email && password) {
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          nome,
          perfil,
        },
      })

      if (authError) {
        return NextResponse.json(
          { error: authError.message },
          { status: 400 }
        )
      }

      if (authData.user) {
        const { data, error } = await adminClient
          .from('usuarios')
          .insert({
            auth_user_id: authData.user.id,
            clinica_id,
            email,
            nome,
            perfil,
            telefone: telefone || null,
            especialidade: especialidade || null,
            registro_profissional: registro_profissional || null,
            ativo: true,
          })
          .select()
          .single()

        if (error) {
          // Rollback: deletar usuario do Auth
          await adminClient.auth.admin.deleteUser(authData.user.id)
          return NextResponse.json(
            { error: error.message },
            { status: 400 }
          )
        }

        return NextResponse.json({ data, comAcesso: true })
      }
    } else {
      // Criar usuario sem acesso ao sistema
      const { data, error } = await adminClient
        .from('usuarios')
        .insert({
          auth_user_id: crypto.randomUUID(),
          clinica_id,
          email: email || `interno-${Date.now()}@sem-acesso.local`,
          nome,
          perfil,
          telefone: telefone || null,
          especialidade: especialidade || null,
          registro_profissional: registro_profissional || null,
          ativo: true,
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }

      return NextResponse.json({ data, comAcesso: false })
    }

    return NextResponse.json({ error: 'Erro inesperado' }, { status: 500 })
  } catch (error: any) {
    console.error('Erro na API de usuarios:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno' },
      { status: 500 }
    )
  }
}
