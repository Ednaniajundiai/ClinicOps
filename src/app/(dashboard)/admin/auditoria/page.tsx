'use client'

import { useEffect, useState, useCallback } from 'react'
import { 
  Shield, 
  Search, 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { useClinica } from '@/hooks/use-clinica'
import { useAuth } from '@/hooks/use-auth'

interface LogAuditoria {
  id: string
  clinica_id: string
  usuario_id: string | null
  acao: 'INSERT' | 'UPDATE' | 'DELETE'
  tabela: string
  registro_id: string
  dados_anteriores: Record<string, unknown> | null
  dados_novos: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  usuarios?: {
    nome: string
    email: string
  } | null
}

const ITEMS_PER_PAGE = 20

export default function AuditoriaPage() {
  const { clinica } = useClinica()
  const { usuario } = useAuth()
  const [logs, setLogs] = useState<LogAuditoria[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTabela, setFilterTabela] = useState<string>('todas')
  const [filterAcao, setFilterAcao] = useState<string>('todas')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedLog, setSelectedLog] = useState<LogAuditoria | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const supabase = createClient()

  const isMaster = usuario?.perfil === 'master'

  const fetchLogs = useCallback(async () => {
    // Master pode ver todos, admin precisa de clinica_id
    if (!isMaster && !clinica?.id) return

    setIsLoading(true)
    try {
      let query = supabase
        .from('auditoria')
        .select(`
          *,
          usuarios (
            nome,
            email
          )
        `, { count: 'exact' })
      
      // Filtrar por clinica apenas se NAO for master
      if (!isMaster && clinica?.id) {
        query = query.eq('clinica_id', clinica.id)
      }
      
      query = query.order('created_at', { ascending: false })

      // Aplicar filtros
      if (filterTabela !== 'todas') {
        query = query.eq('tabela', filterTabela)
      }
      if (filterAcao !== 'todas') {
        query = query.eq('acao', filterAcao)
      }

      // Paginacao
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      setLogs(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Erro ao buscar logs:', error)
    } finally {
      setIsLoading(false)
    }
  }, [clinica?.id, isMaster, filterTabela, filterAcao, currentPage, supabase])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const getAcaoBadge = (acao: string) => {
    const config: Record<string, { variant: 'success' | 'warning' | 'destructive'; label: string }> = {
      INSERT: { variant: 'success', label: 'Criacao' },
      UPDATE: { variant: 'warning', label: 'Alteracao' },
      DELETE: { variant: 'destructive', label: 'Exclusao' },
    }
    const { variant, label } = config[acao] || { variant: 'default' as const, label: acao }
    return <Badge variant={variant}>{label}</Badge>
  }

  const getTabelaLabel = (tabela: string) => {
    const labels: Record<string, string> = {
      pacientes: 'Pacientes',
      atendimentos: 'Atendimentos',
      documentos: 'Documentos',
      usuarios: 'Usuarios',
      clinicas: 'Clinica',
    }
    return labels[tabela] || tabela
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const exportLogs = async () => {
    try {
      let query = supabase
        .from('auditoria')
        .select(`
          *,
          usuarios (
            nome,
            email
          )
        `)
      
      // Filtrar por clinica apenas se NAO for master
      if (!isMaster && clinica?.id) {
        query = query.eq('clinica_id', clinica.id)
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(1000)

      if (error) throw error

      const csvContent = [
        ['Data', 'Usuario', 'Acao', 'Tabela', 'Registro ID', 'Dados Anteriores', 'Dados Novos'].join(';'),
        ...(data || []).map(log => [
          formatDate(log.created_at),
          log.usuarios?.nome || 'Sistema',
          log.acao,
          log.tabela,
          log.registro_id,
          JSON.stringify(log.dados_anteriores || {}),
          JSON.stringify(log.dados_novos || {}),
        ].join(';'))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `auditoria_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
    } catch (error) {
      console.error('Erro ao exportar:', error)
    }
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      log.usuarios?.nome?.toLowerCase().includes(searchLower) ||
      log.usuarios?.email?.toLowerCase().includes(searchLower) ||
      log.tabela.toLowerCase().includes(searchLower) ||
      log.registro_id.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Auditoria e Compliance
          </h2>
          <p className="text-muted-foreground">
            Historico de alteracoes e acoes do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Estatisticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount.toLocaleString('pt-BR')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Criacoes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {logs.filter(l => l.acao === 'INSERT').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Alteracoes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {logs.filter(l => l.acao === 'UPDATE').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Exclusoes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {logs.filter(l => l.acao === 'DELETE').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por usuario, tabela ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filterTabela} onValueChange={setFilterTabela}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tabela" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as tabelas</SelectItem>
                <SelectItem value="pacientes">Pacientes</SelectItem>
                <SelectItem value="atendimentos">Atendimentos</SelectItem>
                <SelectItem value="documentos">Documentos</SelectItem>
                <SelectItem value="usuarios">Usuarios</SelectItem>
                <SelectItem value="clinicas">Clinica</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterAcao} onValueChange={setFilterAcao}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Acao" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as acoes</SelectItem>
                <SelectItem value="INSERT">Criacoes</SelectItem>
                <SelectItem value="UPDATE">Alteracoes</SelectItem>
                <SelectItem value="DELETE">Exclusoes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Historico de Auditoria</CardTitle>
          <CardDescription>
            {totalCount} registros encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum registro de auditoria encontrado.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Acao</TableHead>
                    <TableHead>Tabela</TableHead>
                    <TableHead>Registro</TableHead>
                    <TableHead className="text-right">Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {formatDate(log.created_at)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {log.usuarios?.nome || 'Sistema'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {log.usuarios?.email || '-'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getAcaoBadge(log.acao)}</TableCell>
                      <TableCell>{getTabelaLabel(log.tabela)}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.registro_id.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedLog(log)
                            setIsDetailOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginacao */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Pagina {currentPage} de {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    Proxima
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Registro de Auditoria</DialogTitle>
            <DialogDescription>
              {selectedLog && formatDate(selectedLog.created_at)}
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Usuario</label>
                  <p className="font-medium">{selectedLog.usuarios?.nome || 'Sistema'}</p>
                  <p className="text-sm text-muted-foreground">{selectedLog.usuarios?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Acao</label>
                  <div className="mt-1">{getAcaoBadge(selectedLog.acao)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tabela</label>
                  <p className="font-medium">{getTabelaLabel(selectedLog.tabela)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID do Registro</label>
                  <p className="font-mono text-sm">{selectedLog.registro_id}</p>
                </div>
              </div>

              {selectedLog.dados_anteriores && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Dados Anteriores</label>
                  <pre className="mt-1 p-3 bg-muted rounded-md text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.dados_anteriores, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.dados_novos && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Dados Novos</label>
                  <pre className="mt-1 p-3 bg-muted rounded-md text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.dados_novos, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.ip_address && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">IP de Origem</label>
                  <p className="font-mono text-sm">{selectedLog.ip_address}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
