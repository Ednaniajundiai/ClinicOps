'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useStripe } from '@/hooks/use-stripe'
import { 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle,
  Loader2,
  ExternalLink
} from 'lucide-react'

interface SubscriptionManagementProps {
  clinicaId: string
  planoAtual: {
    nome: string
    preco: number
    recursos: Record<string, boolean | string>
  } | null
  status: string
  stripeCustomerId: string | null
}

/**
 * Status possiveis da clinica mapeados para exibicao
 */
const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  ativa: { label: 'Ativa', variant: 'default' },
  trial: { label: 'Periodo de Teste', variant: 'secondary' },
  suspensa: { label: 'Suspensa', variant: 'destructive' },
  cancelada: { label: 'Cancelada', variant: 'destructive' },
}

/**
 * Componente para gerenciamento de assinatura no dashboard admin.
 * Permite visualizar o plano atual e acessar o portal do Stripe.
 */
export function SubscriptionManagement({ 
  clinicaId, 
  planoAtual,
  status,
  stripeCustomerId 
}: SubscriptionManagementProps) {
  const { isLoading, error, createCheckout, openPortal } = useStripe()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const statusConfig = STATUS_CONFIG[status] || { label: status, variant: 'outline' as const }
  const hasSubscription = !!stripeCustomerId

  if (!isClient) {
    return null
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Assinatura
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie seu plano e forma de pagamento
          </p>
        </div>
        <Badge variant={statusConfig.variant}>
          {statusConfig.label}
        </Badge>
      </div>

      {/* Plano Atual */}
      {planoAtual ? (
        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">{planoAtual.nome}</span>
            <span className="text-lg font-bold">
              R$ {planoAtual.preco.toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/mes</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {Object.entries(planoAtual.recursos || {}).map(([key, value]) => (
              value === true && (
                <span key={key} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  {formatResourceKey(key)}
                </span>
              )
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">Nenhum plano ativo</p>
              <p className="text-sm text-yellow-700 mt-1">
                Escolha um plano para continuar usando o ClinicOps apos o periodo de teste.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status Alerts */}
      {status === 'suspensa' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Assinatura Suspensa</p>
              <p className="text-sm text-red-700 mt-1">
                Houve um problema com seu pagamento. Atualize sua forma de pagamento para continuar.
              </p>
            </div>
          </div>
        </div>
      )}

      {status === 'trial' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800">Periodo de Teste Ativo</p>
              <p className="text-sm text-blue-700 mt-1">
                Aproveite todas as funcionalidades. Escolha um plano antes do termino do teste.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {hasSubscription ? (
          <Button 
            onClick={() => openPortal(clinicaId)}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <ExternalLink className="h-4 w-4 mr-2" />
            )}
            Gerenciar Assinatura
          </Button>
        ) : (
          <>
            <Button 
              onClick={() => createCheckout('starter', clinicaId)}
              disabled={isLoading}
              variant="outline"
              className="flex-1"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Plano Starter
            </Button>
            <Button 
              onClick={() => createCheckout('professional', clinicaId)}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Plano Professional
            </Button>
            <Button 
              onClick={() => createCheckout('enterprise', clinicaId)}
              disabled={isLoading}
              variant="outline"
              className="flex-1"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Plano Enterprise
            </Button>
          </>
        )}
      </div>
    </Card>
  )
}

/**
 * Formata chave de recurso para exibicao
 */
function formatResourceKey(key: string): string {
  const mapping: Record<string, string> = {
    relatorios_basicos: 'Relatorios Basicos',
    relatorios_avancados: 'Relatorios Avancados',
    relatorios_customizados: 'Relatorios Customizados',
    suporte_email: 'Suporte Email',
    suporte_prioritario: 'Suporte Prioritario',
    suporte_24_7: 'Suporte 24/7',
    api_integracao: 'API',
    api_completa: 'API Completa',
    sla_garantido: 'SLA Garantido',
  }
  return mapping[key] || key.replace(/_/g, ' ')
}
