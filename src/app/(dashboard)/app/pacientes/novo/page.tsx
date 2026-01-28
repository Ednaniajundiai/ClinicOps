'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { pacienteSchema, type PacienteFormData } from '@/lib/validations'

export default function NovoPacientePage() {
  const router = useRouter()
  const { clinica, plano } = useClinica()
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: {
      ativo: true,
    },
  })

  const onSubmit = async (data: PacienteFormData) => {
    if (!clinica?.id) {
      toast({
        title: 'Erro',
        description: 'Clinica nao encontrada.',
        variant: 'destructive',
      })
      return
    }

    // Verificar limite de pacientes
    if (plano && plano.limite_pacientes !== -1) {
      const { count } = await supabase
        .from('pacientes')
        .select('*', { count: 'exact', head: true })
        .eq('clinica_id', clinica.id)
        .eq('ativo', true)

      if (count && count >= plano.limite_pacientes) {
        toast({
          title: 'Limite atingido',
          description: `Seu plano permite apenas ${plano.limite_pacientes} pacientes. Faca upgrade para adicionar mais.`,
          variant: 'destructive',
        })
        return
      }
    }

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('pacientes')
        // @ts-ignore
        .insert({
          clinica_id: clinica.id,
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
          ativo: true,
        })

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'Paciente cadastrado com sucesso.',
      })

      router.push('/app/pacientes')
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/app/pacientes">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Novo Paciente</h2>
          <p className="text-muted-foreground">
            Preencha os dados para cadastrar um novo paciente
          </p>
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
            <Link href="/app/pacientes">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Cadastrar Paciente'}
          </Button>
        </div>
      </form>
    </div>
  )
}
