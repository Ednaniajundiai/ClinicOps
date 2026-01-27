'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Clinica, Plano } from '@/lib/supabase/database.types'
import { useAuth } from './use-auth'

interface ClinicaState {
  clinica: Clinica | null
  plano: Plano | null
  isLoading: boolean
}

export function useClinica() {
  const { usuario } = useAuth()
  const [state, setState] = useState<ClinicaState>({
    clinica: null,
    plano: null,
    isLoading: true,
  })

  const supabase = createClient()

  useEffect(() => {
    const fetchClinica = async () => {
      if (!usuario?.clinica_id) {
        setState({
          clinica: null,
          plano: null,
          isLoading: false,
        })
        return
      }

      const { data: clinica } = await supabase
        .from('clinicas')
        .select('*')
        .eq('id', usuario.clinica_id)
        .single()

      if (clinica) {
        const { data: plano } = await supabase
          .from('planos')
          .select('*')
          .eq('id', clinica.plano_id)
          .single()

        setState({
          clinica,
          plano,
          isLoading: false,
        })
      } else {
        setState({
          clinica: null,
          plano: null,
          isLoading: false,
        })
      }
    }

    fetchClinica()
  }, [usuario, supabase])

  const updateClinica = async (data: Partial<Clinica>) => {
    if (!state.clinica) return { error: new Error('Clínica não encontrada') }

    const { error } = await supabase
      .from('clinicas')
      .update(data)
      .eq('id', state.clinica.id)

    if (!error) {
      setState(prev => ({
        ...prev,
        clinica: prev.clinica ? { ...prev.clinica, ...data } : null,
      }))
    }

    return { error }
  }

  return {
    ...state,
    updateClinica,
  }
}
