/**
 * Hook para interacoes com o Stripe.
 * Fornece funcoes para checkout e portal do cliente.
 */
'use client'

import { useState } from 'react'

interface UseStripeReturn {
  isLoading: boolean
  error: string | null
  createCheckout: (planKey: string, clinicaId: string) => Promise<void>
  openPortal: (clinicaId: string) => Promise<void>
}

/**
 * Hook para gerenciar checkout e portal do Stripe.
 */
export function useStripe(): UseStripeReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Inicia checkout para assinar um plano.
   * @param planKey - Chave do plano (starter, professional, enterprise)
   * @param clinicaId - ID da clinica
   */
  async function createCheckout(planKey: string, clinicaId: string): Promise<void> {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planKey, clinicaId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar checkout')
      }

      // Redirecionar para o Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      console.error('Erro no checkout:', err)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Abre o portal do cliente para gerenciar assinatura.
   * @param clinicaId - ID da clinica
   */
  async function openPortal(clinicaId: string): Promise<void> {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinicaId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao abrir portal')
      }

      // Redirecionar para o portal
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      console.error('Erro ao abrir portal:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    error,
    createCheckout,
    openPortal,
  }
}
