'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'

const registerSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  nomeClinica: z.string().min(3, 'O nome da clínica deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)

    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            nome: data.nome,
            nome_clinica: data.nomeClinica,
          },
        },
      })

      if (authError) {
        toast({
          title: 'Erro ao criar conta',
          description: authError.message,
          variant: 'destructive',
        })
        return
      }

      if (!authData.user) {
        toast({
          title: 'Erro ao criar conta',
          description: 'Não foi possível criar o usuário',
          variant: 'destructive',
        })
        return
      }

      // 2. Buscar plano trial/starter padrão
      const { data: planoDefault } = await supabase
        .from('planos')
        .select('id')
        .eq('nome', 'Starter')
        .single()

      if (!planoDefault) {
        // Se não existir plano, cria um básico
        const { data: novoPlano, error: planoError } = await supabase
          .from('planos')
          .insert({
            nome: 'Starter',
            descricao: 'Plano inicial para pequenas clínicas',
            preco_mensal: 97,
            limite_usuarios: 3,
            limite_pacientes: 500,
            recursos: { relatorios_basicos: true },
          })
          .select('id')
          .single()

        if (planoError || !novoPlano) {
          console.error('Erro ao criar plano:', planoError)
        }
      }

      // 3. Criar clínica
      const { data: clinica, error: clinicaError } = await supabase
        .from('clinicas')
        .insert({
          nome: data.nomeClinica,
          plano_id: planoDefault?.id || (await supabase.from('planos').select('id').limit(1).single()).data?.id,
          email: data.email,
          status: 'trial',
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 dias
        })
        .select('id')
        .single()

      if (clinicaError || !clinica) {
        console.error('Erro ao criar clínica:', clinicaError)
        toast({
          title: 'Erro ao criar clínica',
          description: 'Por favor, tente novamente',
          variant: 'destructive',
        })
        return
      }

      // 4. Criar perfil de usuário (admin da clínica)
      const { error: usuarioError } = await supabase
        .from('usuarios')
        .insert({
          auth_user_id: authData.user.id,
          clinica_id: clinica.id,
          email: data.email,
          nome: data.nome,
          perfil: 'admin',
        })

      if (usuarioError) {
        console.error('Erro ao criar usuário:', usuarioError)
        toast({
          title: 'Erro ao criar perfil',
          description: 'Por favor, tente novamente',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Conta criada com sucesso!',
        description: 'Você será redirecionado para o painel',
      })

      // Redireciona para o dashboard admin
      router.push('/admin')
    } catch (error) {
      console.error('Erro:', error)
      toast({
        title: 'Erro inesperado',
        description: 'Tente novamente mais tarde',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Criar Conta</CardTitle>
          <CardDescription>
            Comece seu período de teste gratuito de 14 dias
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Seu Nome</Label>
              <Input
                id="nome"
                type="text"
                placeholder="João Silva"
                {...register('nome')}
                disabled={isLoading}
              />
              {errors.nome && (
                <p className="text-sm text-destructive">{errors.nome.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nomeClinica">Nome da Clínica</Label>
              <Input
                id="nomeClinica"
                type="text"
                placeholder="Clínica São Lucas"
                {...register('nomeClinica')}
                disabled={isLoading}
              />
              {errors.nomeClinica && (
                <p className="text-sm text-destructive">{errors.nomeClinica.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="******"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="******"
                {...register('confirmPassword')}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Conta Gratuita
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Fazer login
              </Link>
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Ao criar uma conta, você concorda com nossos{' '}
              <Link href="#" className="underline">Termos de Serviço</Link>{' '}
              e{' '}
              <Link href="#" className="underline">Política de Privacidade</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
