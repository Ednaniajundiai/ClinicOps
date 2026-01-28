'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { useAuth } from '@/hooks/use-auth'
import { atendimentoSchema, type AtendimentoFormData } from '@/lib/validations'
import type { Paciente, Usuario } from '@/lib/supabase/database.types'

const TIPOS_ATENDIMENTO = [
  'Consulta',
  'Retorno',
  'Avaliacao',
  'Procedimento',
  'Exame',
  'Urgencia',
  'Outro',
]

export default function NovoAtendimentoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pacienteIdParam = searchParams.get('paciente_id')

  const { clinica } = useClinica()
  const { usuario } = useAuth()
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [profissionais, setProfissionais] = useState<Usuario[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const { toast } = useToast()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AtendimentoFormData>({
    resolver: zodResolver(atendimentoSchema),
    defaultValues: {
      paciente_id: pacienteIdParam || '',
      profissional_id: usuario?.id || '',
      duracao_minutos: 30,
      status: 'agendado',
    },
  })

  const fetchData = useCallback(async () => {
    if (!clinica?.id) return

    try {
      // Buscar pacientes
      const { data: pacientesData } = await supabase
        .from('pacientes')
        .select('id, nome')
        .eq('clinica_id', clinica.id)
        .eq('ativo', true)
        .order('nome', { ascending: true })

      setPacientes(pacientesData || [])

      // Buscar profissionais
      const { data: profissionaisData } = await supabase
        .from('usuarios')
        .select('id, nome, especialidade')
        .eq('clinica_id', clinica.id)
        .eq('ativo', true)
        .in('perfil', ['admin', 'profissional'])
        .order('nome', { ascending: true })

      setProfissionais(profissionaisData || [])
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }, [clinica?.id, supabase])

  useEffect(() => {
    if (clinica?.id) {
      fetchData()
    }
  }, [clinica?.id, fetchData])

  // Definir profissional padrao
  useEffect(() => {
    if (usuario?.id && !watch('profissional_id')) {
      setValue('profissional_id', usuario.id)
    }
  }, [usuario?.id, setValue, watch])

  // Definir paciente da URL
  useEffect(() => {
    if (pacienteIdParam && !watch('paciente_id')) {
      setValue('paciente_id', pacienteIdParam)
    }
  }, [pacienteIdParam, setValue, watch])

  const onSubmit = async (data: AtendimentoFormData) => {
    if (!clinica?.id) {
      toast({
        title: 'Erro',
        description: 'Clinica nao encontrada.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('atendimentos')
        .insert({
          clinica_id: clinica.id,
          paciente_id: data.paciente_id,
          profissional_id: data.profissional_id,
          data_hora: data.data_hora,
          duracao_minutos: data.duracao_minutos,
          tipo: data.tipo,
          descricao: data.descricao || null,
          observacoes: data.observacoes || null,
          status: data.status,
          valor: data.valor || null,
        })

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'Atendimento agendado com sucesso.',
      })

      router.push('/app/atendimentos')
    } catch (error: any) {
      console.error('Erro ao salvar atendimento:', error)
      toast({
        title: 'Erro',
        description: error.message || 'Nao foi possivel agendar o atendimento.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/app/atendimentos">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Novo Atendimento</h2>
          <p className="text-muted-foreground">
            Agende um novo atendimento
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Dados do Atendimento */}
          <Card>
            <CardHeader>
              <CardTitle>Dados do Atendimento</CardTitle>
              <CardDescription>Informacoes basicas do atendimento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="paciente_id">Paciente *</Label>
                <Select
                  value={watch('paciente_id')}
                  onValueChange={(value) => setValue('paciente_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {pacientes.map((paciente) => (
                      <SelectItem key={paciente.id} value={paciente.id}>
                        {paciente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.paciente_id && (
                  <p className="text-sm text-destructive">{errors.paciente_id.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="profissional_id">Profissional *</Label>
                <Select
                  value={watch('profissional_id')}
                  onValueChange={(value) => setValue('profissional_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    {profissionais.map((prof) => (
                      <SelectItem key={prof.id} value={prof.id}>
                        {prof.nome} {prof.especialidade ? `(${prof.especialidade})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.profissional_id && (
                  <p className="text-sm text-destructive">{errors.profissional_id.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tipo">Tipo de Atendimento *</Label>
                <Select
                  onValueChange={(value) => setValue('tipo', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_ATENDIMENTO.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipo && (
                  <p className="text-sm text-destructive">{errors.tipo.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Data e Hora */}
          <Card>
            <CardHeader>
              <CardTitle>Agendamento</CardTitle>
              <CardDescription>Data, hora e duracao</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="data_hora">Data e Hora *</Label>
                <Input
                  id="data_hora"
                  type="datetime-local"
                  {...register('data_hora')}
                />
                {errors.data_hora && (
                  <p className="text-sm text-destructive">{errors.data_hora.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="duracao_minutos">Duracao (minutos)</Label>
                <Select
                  defaultValue="30"
                  onValueChange={(value) => setValue('duracao_minutos', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Duracao" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="90">1h30</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('valor')}
                  placeholder="0.00"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  defaultValue="agendado"
                  onValueChange={(value) => setValue('status', value as AtendimentoFormData['status'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Observacoes */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Detalhes</CardTitle>
              <CardDescription>Informacoes adicionais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="descricao">Descricao</Label>
                <Textarea
                  id="descricao"
                  {...register('descricao')}
                  placeholder="Descricao do atendimento..."
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="observacoes">Observacoes</Label>
                <Textarea
                  id="observacoes"
                  {...register('observacoes')}
                  placeholder="Observacoes adicionais..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" type="button" asChild>
            <Link href="/app/atendimentos">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Agendar Atendimento'}
          </Button>
        </div>
      </form>
    </div>
  )
}
