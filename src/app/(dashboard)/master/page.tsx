'use client'

import { useEffect, useState } from 'react'
import { Building2, Users, CreditCard, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'

interface DashboardStats {
  totalClinicas: number
  totalUsuarios: number
  totalPacientes: number
  receitaMensal: number
}

export default function MasterDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClinicas: 0,
    totalUsuarios: 0,
    totalPacientes: 0,
    receitaMensal: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Total de clínicas ativas
        const { count: clinicasCount } = await supabase
          .from('clinicas')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'ativa')

        // Total de usuários
        const { count: usuariosCount } = await supabase
          .from('usuarios')
          .select('*', { count: 'exact', head: true })
          .eq('ativo', true)

        // Total de pacientes
        const { count: pacientesCount } = await supabase
          .from('pacientes')
          .select('*', { count: 'exact', head: true })
          .eq('ativo', true)

        // Receita mensal (clínicas ativas * valor do plano)
        const { data: clinicasComPlano } = await supabase
          .from('clinicas')
          .select('planos(preco_mensal)')
          .eq('status', 'ativa')

        const receita = clinicasComPlano?.reduce((acc, clinica: any) => {
          return acc + (clinica.planos?.preco_mensal || 0)
        }, 0) || 0

        setStats({
          totalClinicas: clinicasCount || 0,
          totalUsuarios: usuariosCount || 0,
          totalPacientes: pacientesCount || 0,
          receitaMensal: receita,
        })
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  const statsCards = [
    {
      title: 'Total de Clínicas',
      value: stats.totalClinicas,
      description: 'Clínicas ativas na plataforma',
      icon: <Building2 className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: 'Total de Usuários',
      value: stats.totalUsuarios,
      description: 'Usuários ativos',
      icon: <Users className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: 'Total de Pacientes',
      value: stats.totalPacientes,
      description: 'Pacientes cadastrados',
      icon: <Users className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: 'Receita Mensal',
      value: formatCurrency(stats.receitaMensal),
      description: 'Receita recorrente mensal',
      icon: <CreditCard className="h-5 w-5 text-muted-foreground" />,
      isMonetary: true,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Master</h2>
        <p className="text-muted-foreground">
          Visão geral da plataforma ClinicOps
        </p>
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
                {isLoading ? '...' : stat.isMonetary ? stat.value : stat.value.toLocaleString('pt-BR')}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Clínicas Recentes</CardTitle>
            <CardDescription>
              Últimas clínicas cadastradas na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Nenhuma clínica cadastrada ainda.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade do Sistema</CardTitle>
            <CardDescription>
              Eventos recentes da plataforma
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
