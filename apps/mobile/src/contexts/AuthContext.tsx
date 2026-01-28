/**
 * Contexto de autenticacao para o app mobile.
 * Gerencia estado do usuario e sessao Supabase.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { Usuario, Clinica } from '../types/database.types'

interface AuthState {
  user: User | null
  session: Session | null
  usuario: Usuario | null
  clinica: Clinica | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    usuario: null,
    clinica: null,
    isLoading: true,
    isAuthenticated: false,
  })

  /**
   * Busca dados do usuario na tabela usuarios.
   */
  const fetchUsuario = useCallback(async (authUserId: string): Promise<Usuario | null> => {
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single()
    
    return data
  }, [])

  /**
   * Busca dados da clinica do usuario.
   */
  const fetchClinica = useCallback(async (clinicaId: string): Promise<Clinica | null> => {
    const { data } = await supabase
      .from('clinicas')
      .select('*')
      .eq('id', clinicaId)
      .single()
    
    return data
  }, [])

  /**
   * Atualiza estado completo do usuario.
   */
  const updateUserState = useCallback(async (user: User | null, session: Session | null) => {
    if (user) {
      const usuario = await fetchUsuario(user.id)
      let clinica: Clinica | null = null
      
      if (usuario?.clinica_id) {
        clinica = await fetchClinica(usuario.clinica_id)
      }

      setState({
        user,
        session,
        usuario,
        clinica,
        isLoading: false,
        isAuthenticated: true,
      })
    } else {
      setState({
        user: null,
        session: null,
        usuario: null,
        clinica: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }, [fetchUsuario, fetchClinica])

  /**
   * Inicializa sessao e configura listener de mudancas de auth.
   */
  useEffect(() => {
    // Busca sessao existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateUserState(session?.user ?? null, session)
    })

    // Listener para mudancas de autenticacao
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await updateUserState(session?.user ?? null, session)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [updateUserState])

  /**
   * Realiza login com email e senha.
   */
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  /**
   * Realiza logout.
   */
  const signOut = async () => {
    await supabase.auth.signOut()
  }

  /**
   * Atualiza dados do usuario manualmente.
   */
  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    await updateUserState(session?.user ?? null, session)
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook para acessar o contexto de autenticacao.
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
