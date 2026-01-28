'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar as CalendarIcon,
  FileText,
  Plus,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatDateTime, formatPhone, formatCPF } from '@/lib/utils'
import type { Paciente, Atendimento, Documento, Usuario } from '@/lib/supabase/database.types'

interface AtendimentoComProfissional extends Atendimento {
  profissional: Pick<Usuario, 'nome'> | null
}

export default function PacienteDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const pacienteId = params.id as string

  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [atendimentos, setAtendimentos] = useState<AtendimentoComProfissional[]>([])
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { toast } = useToast()
  const supabase = createClient()

  const fetchPaciente = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', pacienteId)
        .single()

      if (error) throw error
      setPaciente(data)
    } catch (error) {
      console.error('Erro ao buscar paciente:', error)
      toast({
        title: 'Erro',
        description: 'Paciente nao encontrado.',
        variant: 'destructive',
      })
      router.push('/app/pacientes')
    }
  }, [pacienteId, supabase, toast, router])

  const fetchAtendimentos = useCallback(async () => {
    const { data } = await supabase
      .from('atendimentos')
      .select('*, profissional:usuarios!profissional_id(nome)')
      .eq('paciente_id', pacienteId)
      .order('data_hora', { ascending: false })
      .limit(10)

    setAtendimentos((data as AtendimentoComProfissional[]) || [])
  }, [pacienteId, supabase])

  const fetchDocumentos = useCallback(async () => {
    const { data } = await supabase
      .from('documentos')
      .select('*')
      .eq('paciente_id', pacienteId)
      .order('created_at', { ascending: false })
      .limit(10)

    setDocumentos(data || [])
  }, [pacienteId, supabase])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([fetchPaciente(), fetchAtendimentos(), fetchDocumentos()])
      setIsLoading(false)
    }
    loadData()
  }, [fetchPaciente, fetchAtendimentos, fetchDocumentos])

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este paciente?')) {
      return
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('pacientes')
        .update({ ativo: false })
        .eq('id', pacienteId)

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'Paciente excluido com sucesso.',
      })
      router.push('/app/pacientes')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Nao foi possivel excluir o paciente.',
        variant: 'destructive',
      })
    }
  }

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

  const getSexoLabel = (sexo: Paciente['sexo']) => {
    const labels = { M: 'Masculino', F: 'Feminino', O: 'Outro' }
    return sexo ? labels[sexo] : '-'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  if (!paciente) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/app/pacientes">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{paciente.nome}</h2>
            <p className="text-muted-foreground">
              Cadastrado em {formatDate(paciente.created_at)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/app/pacientes/${paciente.id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Dados Pessoais */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Nome Completo</p>
                <p className="font-medium">{paciente.nome}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CPF</p>
                <p className="font-medium">
                  {paciente.cpf_encrypted ? formatCPF(paciente.cpf_encrypted) : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                <p className="font-medium">
                  {paciente.data_nascimento ? formatDate(paciente.data_nascimento) : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sexo</p>
                <p className="font-medium">{getSexoLabel(paciente.sexo)}</p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">
                    {paciente.telefone ? formatPhone(paciente.telefone) : '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">E-mail</p>
                  <p className="font-medium">{paciente.email || '-'}</p>
                </div>
              </div>
            </div>

            {(paciente.endereco || paciente.cidade) && (
              <>
                <Separator className="my-4" />
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Endereco</p>
                    <p className="font-medium">
                      {[paciente.endereco, paciente.cidade, paciente.estado, paciente.cep]
                        .filter(Boolean)
                        .join(', ') || '-'}
                    </p>
                  </div>
                </div>
              </>
            )}

            {paciente.observacoes && (
              <>
                <Separator className="my-4" />
                <div>
                  <p className="text-sm text-muted-foreground">Observacoes</p>
                  <p className="font-medium whitespace-pre-wrap">{paciente.observacoes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Acoes Rapidas */}
        <Card>
          <CardHeader>
            <CardTitle>Acoes Rapidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" asChild>
              <Link href={`/app/atendimentos/novo?paciente_id=${paciente.id}`}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Atendimento
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href={`/app/documentos/novo?paciente_id=${paciente.id}`}>
                <FileText className="mr-2 h-4 w-4" />
                Novo Documento
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Atendimentos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Atendimentos
            </CardTitle>
            <CardDescription>Historico de atendimentos do paciente</CardDescription>
          </div>
          <Button size="sm" asChild>
            <Link href={`/app/atendimentos/novo?paciente_id=${paciente.id}`}>
              <Plus className="mr-2 h-4 w-4" />
              Novo
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {atendimentos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum atendimento registrado
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {atendimentos.map((atendimento) => (
                  <TableRow key={atendimento.id}>
                    <TableCell>{formatDateTime(atendimento.data_hora)}</TableCell>
                    <TableCell>{atendimento.tipo}</TableCell>
                    <TableCell>{atendimento.profissional?.nome || '-'}</TableCell>
                    <TableCell>{getStatusBadge(atendimento.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Documentos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentos
            </CardTitle>
            <CardDescription>Arquivos anexados ao paciente</CardDescription>
          </div>
          <Button size="sm" asChild>
            <Link href={`/app/documentos/novo?paciente_id=${paciente.id}`}>
              <Plus className="mr-2 h-4 w-4" />
              Novo
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {documentos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum documento anexado
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documentos.map((documento) => (
                  <TableRow key={documento.id}>
                    <TableCell className="font-medium">{documento.nome}</TableCell>
                    <TableCell>{documento.tipo}</TableCell>
                    <TableCell>{formatDate(documento.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
