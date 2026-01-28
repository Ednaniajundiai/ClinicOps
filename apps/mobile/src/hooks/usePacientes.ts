/**
 * Hook para gerenciamento de pacientes.
 * Fornece funcoes CRUD e estado de carregamento.
 */

import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Paciente, PacienteInsert } from '../types/database.types'
import { useAuth } from '../contexts/AuthContext'

interface UsePacientesReturn {
  pacientes: Paciente[]
  isLoading: boolean
  error: string | null
  fetchPacientes: () => Promise<void>
  getPaciente: (id: string) => Promise<Paciente | null>
  searchPacientes: (query: string) => Promise<void>
}

export function usePacientes(): UsePacientesReturn {
  const { clinica } = useAuth()
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Busca todos os pacientes da clinica.
   */
  const fetchPacientes = useCallback(async () => {
    if (!clinica?.id) return

    setIsLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('pacientes')
      .select('*')
      .eq('clinica_id', clinica.id)
      .eq('ativo', true)
      .order('nome', { ascending: true })

    if (err) {
      setError(err.message)
    } else {
      setPacientes(data ?? [])
    }

    setIsLoading(false)
  }, [clinica?.id])

  /**
   * Busca um paciente especifico por ID.
   */
  const getPaciente = useCallback(async (id: string): Promise<Paciente | null> => {
    const { data, error: err } = await supabase
      .from('pacientes')
      .select('*')
      .eq('id', id)
      .single()

    if (err) {
      setError(err.message)
      return null
    }

    return data
  }, [])

  /**
   * Busca pacientes por nome ou telefone.
   */
  const searchPacientes = useCallback(async (query: string) => {
    if (!clinica?.id) return

    setIsLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('pacientes')
      .select('*')
      .eq('clinica_id', clinica.id)
      .eq('ativo', true)
      .or(`nome.ilike.%${query}%,telefone.ilike.%${query}%`)
      .order('nome', { ascending: true })
      .limit(50)

    if (err) {
      setError(err.message)
    } else {
      setPacientes(data ?? [])
    }

    setIsLoading(false)
  }, [clinica?.id])

  return {
    pacientes,
    isLoading,
    error,
    fetchPacientes,
    getPaciente,
    searchPacientes,
  }
}
