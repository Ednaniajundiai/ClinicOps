'use client'

import { useState, useCallback } from 'react'
import {
  Shield,
  Search,
  Download,
  UserX,
  FileText,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { useClinica } from '@/hooks/use-clinica'

interface Paciente {
  id: string
  nome: string
  email: string | null
  telefone: string | null
  data_nascimento: string | null
  ativo: boolean
  created_at: string
}

interface DadosExportados {
  dados_pessoais: {
    nome: string
    cpf: string | null
    data_nascimento: string | null
    sexo: string | null
    telefone: string | null
    email: string | null
    endereco: string | null
    data_cadastro: string
  }
  atendimentos: Array<{
    data_hora: string
    tipo: string
    status: string
    descricao: string | null
  }>
  documentos: Array<{
    nome: string
    tipo: string
    data_upload: string
  }>
  data_exportacao: string
}

export default function LGPDPage() {
  const { clinica } = useClinica()
  const [searchTerm, setSearchTerm] = useState('')
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null)
  const [dadosExportados, setDadosExportados] = useState<DadosExportados | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isAnonimizing, setIsAnonimizing] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showAnonimizeDialog, setShowAnonimizeDialog] = useState(false)
  const [anonimizeMotivo, setAnonimizeMotivo] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const supabase = createClient()

  const searchPacientes = useCallback(async () => {
    if (!searchTerm.trim() || !clinica?.id) return

    setIsSearching(true)
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select('id, nome, email, telefone, data_nascimento, ativo, created_at')
        .eq('clinica_id', clinica.id)
        .or(`nome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(20)

      if (error) throw error
      setPacientes(data || [])
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error)
    } finally {
      setIsSearching(false)
    }
  }, [searchTerm, clinica?.id, supabase])

  const exportarDados = async (pacienteId: string) => {
    setIsExporting(true)
    try {
      const response = await fetch(`/api/lgpd?action=exportar&paciente_id=${pacienteId}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao exportar dados')
      }

      setDadosExportados(result.dados)
      setShowExportDialog(true)
    } catch (error) {
      console.error('Erro ao exportar:', error)
      alert('Erro ao exportar dados do paciente')
    } finally {
      setIsExporting(false)
    }
  }

  const downloadJSON = () => {
    if (!dadosExportados || !selectedPaciente) return

    const blob = new Blob([JSON.stringify(dadosExportados, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `dados_${selectedPaciente.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const anonimizarPaciente = async () => {
    if (!selectedPaciente) return

    setIsAnonimizing(true)
    try {
      const response = await fetch('/api/lgpd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'anonimizar',
          paciente_id: selectedPaciente.id,
          motivo: anonimizeMotivo,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao anonimizar')
      }

      setShowAnonimizeDialog(false)
      setSuccessMessage('Paciente anonimizado com sucesso!')
      setSelectedPaciente(null)
      setAnonimizeMotivo('')
      
      // Atualizar lista
      searchPacientes()

      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (error) {
      console.error('Erro ao anonimizar:', error)
      alert('Erro ao anonimizar paciente')
    } finally {
      setIsAnonimizing(false)
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Privacidade e LGPD
        </h2>
        <p className="text-muted-foreground">
          Gerenciamento de dados pessoais em conformidade com a Lei Geral de Protecao de Dados
        </p>
      </div>

      {/* Mensagem de sucesso */}
      {successMessage && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          <CheckCircle className="h-5 w-5" />
          {successMessage}
        </div>
      )}

      {/* Cards informativos */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Portabilidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Exporte todos os dados de um paciente em formato JSON para atender solicitacoes de portabilidade.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserX className="h-4 w-4 text-red-500" />
              Direito ao Esquecimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Anonimize dados pessoais de pacientes que solicitarem a exclusao de seus registros.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              Dados Protegidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              CPFs sao criptografados e todas as acoes sao registradas no log de auditoria.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Busca de pacientes */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Dados de Paciente</CardTitle>
          <CardDescription>
            Busque um paciente para visualizar, exportar ou anonimizar seus dados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchPacientes()}
                className="pl-8"
              />
            </div>
            <Button onClick={searchPacientes} disabled={isSearching}>
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Buscar'
              )}
            </Button>
          </div>

          {/* Resultados */}
          {pacientes.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pacientes.map((paciente) => (
                  <TableRow key={paciente.id}>
                    <TableCell className="font-medium">{paciente.nome}</TableCell>
                    <TableCell>{paciente.email || '-'}</TableCell>
                    <TableCell>{formatDate(paciente.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant={paciente.ativo ? 'success' : 'secondary'}>
                        {paciente.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isExporting}
                          onClick={() => {
                            setSelectedPaciente(paciente)
                            exportarDados(paciente.id)
                          }}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Exportar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={!paciente.ativo}
                          onClick={() => {
                            setSelectedPaciente(paciente)
                            setShowAnonimizeDialog(true)
                          }}
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Anonimizar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {pacientes.length === 0 && searchTerm && !isSearching && (
            <p className="text-center py-8 text-muted-foreground">
              Nenhum paciente encontrado com os termos buscados.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Exportacao */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dados Exportados - {selectedPaciente?.nome}</DialogTitle>
            <DialogDescription>
              Dados pessoais em conformidade com a LGPD
            </DialogDescription>
          </DialogHeader>

          {dadosExportados && (
            <div className="space-y-4">
              {/* Dados Pessoais */}
              <div>
                <h4 className="font-medium mb-2">Dados Pessoais</h4>
                <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nome:</span>
                    <span>{dadosExportados.dados_pessoais.nome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CPF:</span>
                    <span>{dadosExportados.dados_pessoais.cpf || 'Nao informado'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{dadosExportados.dados_pessoais.email || 'Nao informado'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Telefone:</span>
                    <span>{dadosExportados.dados_pessoais.telefone || 'Nao informado'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data de Nascimento:</span>
                    <span>{formatDate(dadosExportados.dados_pessoais.data_nascimento)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cadastrado em:</span>
                    <span>{formatDate(dadosExportados.dados_pessoais.data_cadastro)}</span>
                  </div>
                </div>
              </div>

              {/* Atendimentos */}
              <div>
                <h4 className="font-medium mb-2">
                  Atendimentos ({dadosExportados.atendimentos.length})
                </h4>
                {dadosExportados.atendimentos.length > 0 ? (
                  <div className="bg-muted rounded-lg p-4 space-y-2 text-sm max-h-40 overflow-y-auto">
                    {dadosExportados.atendimentos.map((a, i) => (
                      <div key={i} className="border-b border-muted-foreground/20 pb-2 last:border-0">
                        <div className="flex justify-between">
                          <span>{a.tipo}</span>
                          <Badge variant="outline">{a.status}</Badge>
                        </div>
                        <span className="text-muted-foreground">
                          {new Date(a.data_hora).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum atendimento registrado.</p>
                )}
              </div>

              {/* Documentos */}
              <div>
                <h4 className="font-medium mb-2">
                  Documentos ({dadosExportados.documentos.length})
                </h4>
                {dadosExportados.documentos.length > 0 ? (
                  <div className="bg-muted rounded-lg p-4 space-y-2 text-sm max-h-40 overflow-y-auto">
                    {dadosExportados.documentos.map((d, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{d.nome}</span>
                        <span className="text-muted-foreground">{d.tipo}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum documento registrado.</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Fechar
            </Button>
            <Button onClick={downloadJSON}>
              <Download className="h-4 w-4 mr-2" />
              Baixar JSON
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Anonimizacao */}
      <Dialog open={showAnonimizeDialog} onOpenChange={setShowAnonimizeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Anonimizar Paciente
            </DialogTitle>
            <DialogDescription>
              Esta acao e irreversivel e remove todos os dados pessoais do paciente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Atencao:</strong> Os seguintes dados serao permanentemente removidos:
              </p>
              <ul className="text-sm text-red-700 mt-2 space-y-1 list-disc list-inside">
                <li>Nome completo</li>
                <li>CPF</li>
                <li>Telefone e email</li>
                <li>Endereco completo</li>
                <li>Observacoes pessoais</li>
              </ul>
              <p className="text-sm text-red-700 mt-2">
                O historico de atendimentos sera preservado de forma anonima para fins estatisticos.
              </p>
            </div>

            <div>
              <Label htmlFor="motivo">Motivo da anonimizacao</Label>
              <Textarea
                id="motivo"
                placeholder="Ex: Solicitacao do titular conforme Art. 18 da LGPD..."
                value={anonimizeMotivo}
                onChange={(e) => setAnonimizeMotivo(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm">
                <strong>Paciente:</strong> {selectedPaciente?.nome}
              </p>
              <p className="text-sm text-muted-foreground">
                Email: {selectedPaciente?.email || 'Nao informado'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAnonimizeDialog(false)
                setAnonimizeMotivo('')
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={anonimizarPaciente}
              disabled={isAnonimizing || !anonimizeMotivo.trim()}
            >
              {isAnonimizing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UserX className="h-4 w-4 mr-2" />
              )}
              Confirmar Anonimizacao
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
