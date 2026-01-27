'use client'

import { useEffect, useState } from 'react'
import { Users, UserCheck, Calendar, FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useClinica } from '@/hooks/use-clinica'
import { formatCurrency } from '@/lib/utils'

interface DashboardStats {
  totalUsuarios: number
  totalPacientes: number
  atendimentosHoje: number
  totalDocumentos: number
}

export default function AdminDashboard() {
  const { clinica, plano, isLoading: clinicaLoading } = useClinica()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsuarios: 0,
    totalPacientes: 0,
    atendimentosHoje: 0,
    totalDocumentos: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      if (!clinica?.id) return

      try {
        // Total de usuários da clínica
        const { count: usuariosCount } = await supabase
          .from('usuarios')
          .select('*', { count: 'exact', head: true })
          .eq('clinica_id', clinica.id)
          .eq('ativo', true)

        // Total de pacientes
        const { count: pacientesCount } = await supabase
          .from('pacientes')
          .select('*', { count: 'exact', head: true })
          .eq('clinica_id', clinica.id)
          .eq('ativo', true)

        // Atendimentos de hoje
        const hoje = new Date()
        hoje.setHours(0, 0, 0, 0)
        const amanha = new Date(hoje)
        amanha.setDate(amanha.getDate() + 1)

        const { count: atendimentosCount } = await supabase
          .from('atendimentos')
          .select('*', { count: 'exact', head: true })
          .eq('clinica_id', clinica.id)
          .gte('data_hora', hoje.toISOString())
          .lt('data_hora', amanha.toISOString())

        // Total de documentos
        const { count: documentosCount } = await supabase
          .from('documentos')
          .select('*', { count: 'exact', head: true })
          .eq('clinica_id', clinica.id)

        setStats({
          totalUsuarios: usuariosCount || 0,
          totalPacientes: pacientesCount || 0,
          atendimentosHoje: atendimentosCount || 0,
          totalDocumentos: documentosCount || 0,
        })
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [clinica, supabase])

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
      ativa: 'success',
      trial: 'warning',
      suspensa: 'destructive',
      cancelada: 'destructive',
    }
    const labels: Record<string, string> = {
      ativa: 'Ativa',
      trial: 'Período de Teste',
      suspensa: 'Suspensa',
      cancelada: 'Cancelada',
    }
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>
  }

  const statsCards = [
    {
      title: 'Usuários',
      value: stats.totalUsuarios,
      limit: plano?.limite_usuarios || 0,
      description: `de ${plano?.limite_usuarios === -1 ? 'ilimitados' : plano?.limite_usuarios || 0} disponíveis`,
      icon: <Users className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: 'Pacientes',
      value: stats.totalPacientes,
      limit: plano?.limite_pacientes || 0,
      description: `de ${plano?.limite_pacientes === -1 ? 'ilimitados' : plano?.limite_pacientes || 0} disponíveis`,
      icon: <UserCheck className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: 'Atendimentos Hoje',
      value: stats.atendimentosHoje,
      description: 'agendados para hoje',
      icon: <Calendar className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: 'Documentos',
      value: stats.totalDocumentos,
      description: 'arquivos armazenados',
      icon: <FileText className="h-5 w-5 text-muted-foreground" />,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header com informações da clínica */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {clinicaLoading ? 'Carregando...' : clinica?.nome || 'Dashboard'}
          </h2>
          <p className="text-muted-foreground">
            Visão geral da sua clínica
          </p>
        </div>
        {clinica && (
          <div className="flex items-center gap-2">
            {getStatusBadge(clinica.status)}
            <Badge variant="outline">{plano?.nome || 'Sem plano'}</Badge>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : stat.value.toLocaleString('pt-BR')}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              {stat.limit && stat.limit > 0 && (
                <div className="mt-2 h-2 w-full rounded-full bg-muted">
                  <div 
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${Math.min((stat.value / stat.limit) * 100, 100)}%` }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plano e Assinatura */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Seu Plano</CardTitle>
            <CardDescription>
              Detalhes do plano atual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {plano ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Plano</span>
                  <span className="font-medium">{plano.nome}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Valor Mensal</span>
                  <span className="font-medium">{formatCurrency(plano.preco_mensal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Limite de Usuários</span>
                  <span className="font-medium">
                    {plano.limite_usuarios === -1 ? 'Ilimitado' : plano.limite_usuarios}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Limite de Pacientes</span>
                  <span className="font-medium">
                    {plano.limite_pacientes === -1 ? 'Ilimitado' : plano.limite_pacientes}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Carregando informações do plano...
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Últimas ações na clínica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Nenhuma atividade registrada ainda.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
