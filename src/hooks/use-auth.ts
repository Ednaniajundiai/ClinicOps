'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Usuario } from '@/lib/supabase/database.types'

interface AuthState {
  user: User | null
  usuario: Usuario | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    usuario: null,
    isLoading: true,
    isAuthenticated: false,
  })

  const supabase = createClient()

  const fetchUsuario = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .eq('auth_user_id', userId)
      .single()
    
    return data
  }, [supabase])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const usuario = await fetchUsuario(user.id)
        setState({
          user,
          usuario,
          isLoading: false,
          isAuthenticated: true,
        })
      } else {
        setState({
          user: null,
          usuario: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const usuario = await fetchUsuario(session.user.id)
          setState({
            user: session.user,
            usuario,
            isLoading: false,
            isAuthenticated: true,
          })
        } else {
          setState({
            user: null,
            usuario: null,
            isLoading: false,
            isAuthenticated: false,
          })
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchUsuario])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string, nome: string, perfil: Usuario['perfil'] = 'admin') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome,
          perfil,
        },
      },
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { data, error }
  }

  const updatePassword = async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { data, error }
  }

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  }
}
