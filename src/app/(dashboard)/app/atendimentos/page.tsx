'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, MoreHorizontal, Calendar, Eye, Edit, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'
import { useClinica } from '@/hooks/use-clinica'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import type { Atendimento, Paciente, Usuario } from '@/lib/supabase/database.types'

interface AtendimentoCompleto extends Atendimento {
  paciente: Pick<Paciente, 'nome'> | null
  profissional: Pick<Usuario, 'nome'> | null
}

const ITEMS_PER_PAGE = 10

const STATUS_OPTIONS = [
  { value: 'todos', label: 'Todos os Status' },
  { value: 'agendado', label: 'Agendado' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'concluido', label: 'Concluido' },
  { value: 'cancelado', label: 'Cancelado' },
  { value: 'faltou', label: 'Faltou' },
]

export default function AtendimentosPage() {
  const { clinica } = useClinica()
  const [atendimentos, setAtendimentos] = useState<AtendimentoCompleto[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [currentPage, setCurrentPage] = useState(1)
  const [dateFilter, setDateFilter] = useState<'hoje' | 'semana' | 'mes' | 'todos'>('semana')

  const { toast } = useToast()
  const supabase = createClient()

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setCurrentPage(1)
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  const getDateRange = useCallback(() => {
    const now = new Date()
    let startDate: Date
    let endDate: Date = new Date(now)
    endDate.setHours(23, 59, 59, 999)

    switch (dateFilter) {
      case 'hoje':
        startDate = new Date(now)
        startDate.setHours(0, 0, 0, 0)
        break
      case 'semana':
        startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 7)
        startDate.setHours(0, 0, 0, 0)
        endDate.setDate(endDate.getDate() + 7)
        break
      case 'mes':
        startDate = new Date(now)
        startDate.setDate(1)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        break
      default:
        return null
    }

    return { startDate, endDate }
  }, [dateFilter])

  const fetchAtendimentos = useCallback(async () => {
    if (!clinica?.id) return

    setIsLoading(true)
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      let query = supabase
        .from('atendimentos')
        .select('*, paciente:pacientes(nome), profissional:usuarios!profissional_id(nome)', { count: 'exact' })
        .eq('clinica_id', clinica.id)
        .order('data_hora', { ascending: false })
        .range(from, to)

      // Filtro de status
      if (statusFilter !== 'todos') {
        query = query.eq('status', statusFilter)
      }

      // Filtro de data
      const dateRange = getDateRange()
      if (dateRange) {
        query = query
          .gte('data_hora', dateRange.startDate.toISOString())
          .lte('data_hora', dateRange.endDate.toISOString())
      }

      const { data, error, count } = await query

      if (error) throw error

      setAtendimentos((data as AtendimentoCompleto[]) || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Erro ao buscar atendimentos:', error)
      toast({
        title: 'Erro',
        description: 'Nao foi possivel carregar os atendimentos.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [clinica?.id, supabase, currentPage, statusFilter, dateFilter, getDateRange, toast])

  useEffect(() => {
    if (clinica?.id) {
      fetchAtendimentos()
    }
  }, [clinica?.id, fetchAtendimentos])

  const updateStatus = async (id: string, newStatus: Atendimento['status']) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('atendimentos')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'Status atualizado com sucesso.',
      })
      fetchAtendimentos()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Nao foi possivel atualizar o status.',
        variant: 'destructive',
      })
    }
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
  const canGoBack = currentPage > 1
  const canGoForward = currentPage < totalPages

  const getStatusBadge = (status: Atendimento['status']) => {
    const config = {
      agendado: { variant: 'secondary' as const, label: 'Agendado' },
      confirmado: { variant: 'default' as const, label: 'Confirmado' },
      em_andamento: { variant: 'warning' as const, label: 'Em Andamento' },
      concluido: { variant: 'success' as const, label: 'Concluido' },
      cancelado: { variant: 'destructive' as const, label: 'Cancelado' },
      faltou: { variant: 'destructive' as const, label: 'Faltou' },
    }
    const { variant, label } = config[status]
    return <Badge variant={variant}>{label}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Atendimentos</h2>
          <p className="text-muted-foreground">
            {totalCount} atendimentos encontrados
          </p>
        </div>
        <Button asChild>
          <Link href="/app/atendimentos/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Atendimento
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <Select value={dateFilter} onValueChange={(v) => { setDateFilter(v as any); setCurrentPage(1); }}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Periodo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="semana">Esta Semana</SelectItem>
                  <SelectItem value="mes">Este Mes</SelectItem>
                  <SelectItem value="todos">Todos</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              Pagina {currentPage} de {totalPages || 1}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : atendimentos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Nenhum atendimento encontrado</p>
              <Button asChild className="mt-4">
                <Link href="/app/atendimentos/novo">
                  <Plus className="mr-2 h-4 w-4" />
                  Agendar primeiro atendimento
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {atendimentos.map((atendimento) => (
                    <TableRow key={atendimento.id}>
                      <TableCell className="font-medium">
                        {formatDateTime(atendimento.data_hora)}
                      </TableCell>
                      <TableCell>
                        <Link 
                          href={`/app/pacientes/${atendimento.paciente_id}`}
                          className="hover:underline"
                        >
                          {atendimento.paciente?.nome || '-'}
                        </Link>
                      </TableCell>
                      <TableCell>{atendimento.tipo}</TableCell>
                      <TableCell>{atendimento.profissional?.nome || '-'}</TableCell>
                      <TableCell>
                        {atendimento.valor ? formatCurrency(atendimento.valor) : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(atendimento.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acoes</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/app/atendimentos/${atendimento.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalhes
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/app/atendimentos/${atendimento.id}/editar`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>
                            {atendimento.status === 'agendado' && (
                              <DropdownMenuItem onClick={() => updateStatus(atendimento.id, 'confirmado')}>
                                Confirmar
                              </DropdownMenuItem>
                            )}
                            {(atendimento.status === 'agendado' || atendimento.status === 'confirmado') && (
                              <DropdownMenuItem onClick={() => updateStatus(atendimento.id, 'em_andamento')}>
                                Iniciar Atendimento
                              </DropdownMenuItem>
                            )}
                            {atendimento.status === 'em_andamento' && (
                              <DropdownMenuItem onClick={() => updateStatus(atendimento.id, 'concluido')}>
                                Concluir
                              </DropdownMenuItem>
                            )}
                            {atendimento.status !== 'cancelado' && atendimento.status !== 'concluido' && (
                              <>
                                <DropdownMenuItem onClick={() => updateStatus(atendimento.id, 'cancelado')}>
                                  Cancelar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateStatus(atendimento.id, 'faltou')}>
                                  Marcar Falta
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginacao */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} de {totalCount}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => p - 1)}
                      disabled={!canGoBack}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => p + 1)}
                      disabled={!canGoForward}
                    >
                      Proximo
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
