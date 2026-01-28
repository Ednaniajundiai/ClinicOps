'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
import { pacienteSchema, type PacienteFormData } from '@/lib/validations'
import type { Paciente } from '@/lib/supabase/database.types'

export default function EditarPacientePage() {
  const params = useParams()
  const router = useRouter()
  const pacienteId = params.id as string

  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const { toast } = useToast()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteSchema),
  })

  const fetchPaciente = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('pacientes')
        .select('*')
        .eq('id', pacienteId)
        .single()

      if (error) throw error

      setPaciente(data as Paciente)
      reset({
        nome: data.nome,
        cpf_encrypted: data.cpf_encrypted || '',
        data_nascimento: data.data_nascimento || '',
        sexo: data.sexo,
        telefone: data.telefone || '',
        email: data.email || '',
        endereco: data.endereco || '',
        cidade: data.cidade || '',
        estado: data.estado || '',
        cep: data.cep || '',
        observacoes: data.observacoes || '',
        ativo: data.ativo,
      })
    } catch (error) {
      console.error('Erro ao buscar paciente:', error)
      toast({
        title: 'Erro',
        description: 'Paciente nao encontrado.',
        variant: 'destructive',
      })
      router.push('/app/pacientes')
    } finally {
      setIsLoading(false)
    }
  }, [pacienteId, supabase, toast, router, reset])

  useEffect(() => {
    fetchPaciente()
  }, [fetchPaciente])

  const onSubmit = async (data: PacienteFormData) => {
    setIsSaving(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('pacientes')
        .update({
          nome: data.nome,
          cpf_encrypted: data.cpf_encrypted || null,
          data_nascimento: data.data_nascimento || null,
          sexo: data.sexo || null,
          telefone: data.telefone || null,
          email: data.email || null,
          endereco: data.endereco || null,
          cidade: data.cidade || null,
          estado: data.estado || null,
          cep: data.cep || null,
          observacoes: data.observacoes || null,
        })
        .eq('id', pacienteId)

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'Paciente atualizado com sucesso.',
      })

      router.push(`/app/pacientes/${pacienteId}`)
    } catch (error: any) {
      console.error('Erro ao salvar paciente:', error)
      toast({
        title: 'Erro',
        description: error.message || 'Nao foi possivel salvar o paciente.',
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
          <Link href={`/app/pacientes/${pacienteId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Editar Paciente</h2>
          <p className="text-muted-foreground">{paciente?.nome}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
              <CardDescription>Informacoes basicas do paciente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  {...register('nome')}
                  placeholder="Nome do paciente"
                />
                {errors.nome && (
                  <p className="text-sm text-destructive">{errors.nome.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cpf_encrypted">CPF</Label>
                  <Input
                    id="cpf_encrypted"
                    {...register('cpf_encrypted')}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                  <Input
                    id="data_nascimento"
                    type="date"
                    {...register('data_nascimento')}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sexo">Sexo</Label>
                <Select
                  defaultValue={paciente?.sexo || undefined}
                  onValueChange={(value) => setValue('sexo', value as 'M' | 'F' | 'O')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Feminino</SelectItem>
                    <SelectItem value="O">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Contato */}
          <Card>
            <CardHeader>
              <CardTitle>Contato</CardTitle>
              <CardDescription>Informacoes de contato do paciente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  {...register('telefone')}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="email@exemplo.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Endereco */}
          <Card>
            <CardHeader>
              <CardTitle>Endereco</CardTitle>
              <CardDescription>Endereco do paciente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  {...register('cep')}
                  placeholder="00000-000"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endereco">Endereco</Label>
                <Input
                  id="endereco"
                  {...register('endereco')}
                  placeholder="Rua, numero, complemento"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    {...register('cidade')}
                    placeholder="Cidade"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    {...register('estado')}
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observacoes */}
          <Card>
            <CardHeader>
              <CardTitle>Observacoes</CardTitle>
              <CardDescription>Informacoes adicionais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Label htmlFor="observacoes">Observacoes</Label>
                <Textarea
                  id="observacoes"
                  {...register('observacoes')}
                  placeholder="Observacoes sobre o paciente..."
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" type="button" asChild>
            <Link href={`/app/pacientes/${pacienteId}`}>Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar Alteracoes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
