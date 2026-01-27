'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, Calendar, Clock, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useClinica } from '@/hooks/use-clinica'
import { useAuth } from '@/hooks/use-auth'
import { formatDateTime } from '@/lib/utils'
import type { Atendimento, Paciente } from '@/lib/supabase/database.types'

interface AtendimentoComPaciente extends Atendimento {
  paciente: Pick<Paciente, 'nome'>
}

export default function AppDashboard() {
  const { usuario } = useAuth()
  const { clinica } = useClinica()
  const [atendimentosHoje, setAtendimentosHoje] = useState<AtendimentoComPaciente[]>([])
  const [pacientesRecentes, setPacientesRecentes] = useState<Paciente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      if (!clinica?.id) return

      try {
        // Atendimentos de hoje
        const hoje = new Date()
        hoje.setHours(0, 0, 0, 0)
        const amanha = new Date(hoje)
        amanha.setDate(amanha.getDate() + 1)

        const { data: atendimentos } = await supabase
          .from('atendimentos')
          .select('*, paciente:pacientes(nome)')
          .eq('clinica_id', clinica.id)
          .gte('data_hora', hoje.toISOString())
          .lt('data_hora', amanha.toISOString())
          .order('data_hora', { ascending: true })
          .limit(5)

        setAtendimentosHoje((atendimentos as any) || [])

        // Pacientes recentes
        const { data: pacientes } = await supabase
          .from('pacientes')
          .select('*')
          .eq('clinica_id', clinica.id)
          .eq('ativo', true)
          .order('created_at', { ascending: false })
          .limit(5)

        setPacientesRecentes(pacientes || [])
      } catch (error) {
        console.error('Erro ao buscar dados:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [clinica, supabase])

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
      agendado: 'secondary',
      confirmado: 'default',
      em_andamento: 'warning',
      concluido: 'success',
      cancelado: 'destructive',
      faltou: 'destructive',
    }
    const labels: Record<string, string> = {
      agendado: 'Agendado',
      confirmado: 'Confirmado',
      em_andamento: 'Em Andamento',
      concluido: 'Concluído',
      cancelado: 'Cancelado',
      faltou: 'Faltou',
    }
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Olá, {usuario?.nome?.split(' ')[0] || 'Usuário'}!
          </h2>
          <p className="text-muted-foreground">
            Aqui está um resumo do seu dia
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/app/pacientes/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Paciente
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/app/atendimentos/novo">
              <Calendar className="mr-2 h-4 w-4" />
              Novo Atendimento
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Atendimentos de Hoje */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Atendimentos de Hoje
              </CardTitle>
              <CardDescription>
                Seus próximos atendimentos
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app/atendimentos">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : atendimentosHoje.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum atendimento agendado para hoje.
              </p>
            ) : (
              <div className="space-y-4">
                {atendimentosHoje.map((atendimento) => (
                  <div 
                    key={atendimento.id} 
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{atendimento.paciente?.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(atendimento.data_hora)} - {atendimento.tipo}
                      </p>
                    </div>
                    {getStatusBadge(atendimento.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pacientes Recentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Pacientes Recentes
              </CardTitle>
              <CardDescription>
                Últimos pacientes cadastrados
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app/pacientes">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : pacientesRecentes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum paciente cadastrado ainda.
              </p>
            ) : (
              <div className="space-y-4">
                {pacientesRecentes.map((paciente) => (
                  <div 
                    key={paciente.id} 
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{paciente.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {paciente.telefone || paciente.email || 'Sem contato'}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/app/pacientes/${paciente.id}`}>
                        Ver
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
