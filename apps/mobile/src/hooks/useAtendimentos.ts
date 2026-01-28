/**
 * Hook para gerenciamento de atendimentos.
 * Fornece funcoes para criar e listar atendimentos.
 */

import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Atendimento, AtendimentoInsert } from '../types/database.types'
import { useAuth } from '../contexts/AuthContext'

interface AtendimentoComPaciente extends Atendimento {
  paciente?: {
    nome: string
    telefone: string | null
  }
}

interface UseAtendimentosReturn {
  atendimentos: AtendimentoComPaciente[]
  isLoading: boolean
  error: string | null
  fetchAtendimentos: (pacienteId?: string) => Promise<void>
  createAtendimento: (data: Omit<AtendimentoInsert, 'clinica_id' | 'profissional_id'>) => Promise<{ success: boolean; error?: string }>
  fetchAtendimentosHoje: () => Promise<void>
}

export function useAtendimentos(): UseAtendimentosReturn {
  const { clinica, usuario } = useAuth()
  const [atendimentos, setAtendimentos] = useState<AtendimentoComPaciente[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Busca atendimentos, opcionalmente filtrado por paciente.
   */
  const fetchAtendimentos = useCallback(async (pacienteId?: string) => {
    if (!clinica?.id) return

    setIsLoading(true)
    setError(null)

    let query = supabase
      .from('atendimentos')
      .select(`
        *,
        paciente:pacientes(nome, telefone)
      `)
      .eq('clinica_id', clinica.id)
      .order('data_hora', { ascending: false })

    if (pacienteId) {
      query = query.eq('paciente_id', pacienteId)
    }

    const { data, error: err } = await query.limit(50)

    if (err) {
      setError(err.message)
    } else {
      setAtendimentos(data ?? [])
    }

    setIsLoading(false)
  }, [clinica?.id])

  /**
   * Busca atendimentos de hoje.
   */
  const fetchAtendimentosHoje = useCallback(async () => {
    if (!clinica?.id) return

    setIsLoading(true)
    setError(null)

    const hoje = new Date()
    const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).toISOString()
    const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1).toISOString()

    const { data, error: err } = await supabase
      .from('atendimentos')
      .select(`
        *,
        paciente:pacientes(nome, telefone)
      `)
      .eq('clinica_id', clinica.id)
      .gte('data_hora', inicioHoje)
      .lt('data_hora', fimHoje)
      .order('data_hora', { ascending: true })

    if (err) {
      setError(err.message)
    } else {
      setAtendimentos(data ?? [])
    }

    setIsLoading(false)
  }, [clinica?.id])

  /**
   * Cria um novo atendimento.
   */
  const createAtendimento = useCallback(async (
    data: Omit<AtendimentoInsert, 'clinica_id' | 'profissional_id'>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!clinica?.id || !usuario?.id) {
      return { success: false, error: 'Usuario ou clinica nao encontrados' }
    }

    const { error: err } = await supabase
      .from('atendimentos')
      .insert({
        ...data,
        clinica_id: clinica.id,
        profissional_id: usuario.id,
      })

    if (err) {
      return { success: false, error: err.message }
    }

    return { success: true }
  }, [clinica?.id, usuario?.id])

  return {
    atendimentos,
    isLoading,
    error,
    fetchAtendimentos,
    createAtendimento,
    fetchAtendimentosHoje,
  }
}
