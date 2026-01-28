'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, MoreHorizontal, CreditCard, Edit, Trash2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import type { Plano } from '@/lib/supabase/database.types'

export default function PlanosPage() {
  const [planos, setPlanos] = useState<Plano[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPlano, setEditingPlano] = useState<Plano | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco_mensal: '',
    limite_usuarios: '',
    limite_pacientes: '',
    ativo: true,
    stripe_price_id: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  const { toast } = useToast()
  const supabase = createClient()

  const fetchPlanos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('planos')
        .select('*')
        .order('preco_mensal', { ascending: true })

      if (error) throw error
      setPlanos(data || [])
    } catch (error) {
      console.error('Erro ao buscar planos:', error)
      toast({
        title: 'Erro',
        description: 'Nao foi possivel carregar os planos.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [supabase, toast])

  useEffect(() => {
    fetchPlanos()
  }, [fetchPlanos])

  const handleOpenDialog = (plano?: Plano) => {
    if (plano) {
      setEditingPlano(plano)
      setFormData({
        nome: plano.nome,
        descricao: plano.descricao || '',
        preco_mensal: plano.preco_mensal.toString(),
        limite_usuarios: plano.limite_usuarios.toString(),
        limite_pacientes: plano.limite_pacientes.toString(),
        ativo: plano.ativo,
        stripe_price_id: plano.stripe_price_id || '',
      })
    } else {
      setEditingPlano(null)
      setFormData({
        nome: '',
        descricao: '',
        preco_mensal: '',
        limite_usuarios: '3',
        limite_pacientes: '500',
        ativo: true,
        stripe_price_id: '',
      })
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.nome || !formData.preco_mensal) {
      toast({
        title: 'Erro',
        description: 'Preencha os campos obrigatorios.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      const planoData = {
        nome: formData.nome,
        descricao: formData.descricao || null,
        preco_mensal: parseFloat(formData.preco_mensal),
        limite_usuarios: parseInt(formData.limite_usuarios) || -1,
        limite_pacientes: parseInt(formData.limite_pacientes) || -1,
        ativo: formData.ativo,
        stripe_price_id: formData.stripe_price_id || null,
      }

      if (editingPlano) {
        const { error } = await supabase
          .from('planos')
          // @ts-ignore
          .update(planoData)
          .eq('id', editingPlano.id)

        if (error) throw error

        toast({
          title: 'Sucesso',
          description: 'Plano atualizado com sucesso.',
        })
      } else {
        const { error } = await supabase
          .from('planos')
          // @ts-ignore
          .insert(planoData)

        if (error) throw error

        toast({
          title: 'Sucesso',
          description: 'Plano criado com sucesso.',
        })
      }

      setDialogOpen(false)
      fetchPlanos()
    } catch (error: any) {
      console.error('Erro ao salvar plano:', error)
      toast({
        title: 'Erro',
        description: error.message || 'Nao foi possivel salvar o plano.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este plano?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('planos')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'Plano excluido com sucesso.',
      })
      fetchPlanos()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Nao foi possivel excluir o plano. Verifique se nao ha clinicas usando-o.',
        variant: 'destructive',
      })
    }
  }

  const toggleAtivo = async (plano: Plano) => {
    try {
      const { error } = await supabase
        .from('planos')
        // @ts-ignore
        .update({ ativo: !plano.ativo })
        .eq('id', plano.id)

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: `Plano ${plano.ativo ? 'desativado' : 'ativado'} com sucesso.`,
      })
      fetchPlanos()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Nao foi possivel atualizar o plano.',
        variant: 'destructive',
      })
    }
  }

  const formatLimite = (limite: number) => {
    return limite === -1 ? 'Ilimitado' : limite.toLocaleString('pt-BR')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Planos</h2>
          <p className="text-muted-foreground">
            Gerencie os planos de assinatura disponiveis
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Plano
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        {planos.filter(p => p.ativo).slice(0, 3).map((plano) => (
          <Card key={plano.id} className="relative overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plano.nome}</CardTitle>
                <Badge variant={plano.ativo ? 'success' : 'secondary'}>
                  {plano.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <CardDescription>{plano.descricao}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatCurrency(plano.preco_mensal)}
                <span className="text-sm font-normal text-muted-foreground">/mes</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  {formatLimite(plano.limite_usuarios)} usuarios
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  {formatLimite(plano.limite_pacientes)} pacientes
                </li>
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabela completa */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Planos</CardTitle>
          <CardDescription>
            Lista completa de todos os planos cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : planos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Nenhum plano cadastrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Preco Mensal</TableHead>
                  <TableHead>Limite Usuarios</TableHead>
                  <TableHead>Limite Pacientes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stripe ID</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planos.map((plano) => (
                  <TableRow key={plano.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{plano.nome}</p>
                        {plano.descricao && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {plano.descricao}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(plano.preco_mensal)}
                    </TableCell>
                    <TableCell>{formatLimite(plano.limite_usuarios)}</TableCell>
                    <TableCell>{formatLimite(plano.limite_pacientes)}</TableCell>
                    <TableCell>
                      <Badge variant={plano.ativo ? 'success' : 'secondary'}>
                        {plano.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {plano.stripe_price_id || '-'}
                      </span>
                    </TableCell>
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
                          <DropdownMenuItem onClick={() => handleOpenDialog(plano)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleAtivo(plano)}>
                            {plano.ativo ? (
                              <>
                                <X className="mr-2 h-4 w-4" />
                                Desativar
                              </>
                            ) : (
                              <>
                                <Check className="mr-2 h-4 w-4" />
                                Ativar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(plano.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingPlano ? 'Editar Plano' : 'Novo Plano'}
            </DialogTitle>
            <DialogDescription>
              {editingPlano
                ? 'Altere os dados do plano abaixo.'
                : 'Preencha os dados para criar um novo plano.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Professional"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="descricao">Descricao</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descricao do plano..."
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="preco_mensal">Preco Mensal (R$) *</Label>
              <Input
                id="preco_mensal"
                type="number"
                step="0.01"
                min="0"
                value={formData.preco_mensal}
                onChange={(e) => setFormData({ ...formData, preco_mensal: e.target.value })}
                placeholder="197.00"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="limite_usuarios">Limite de Usuarios</Label>
                <Input
                  id="limite_usuarios"
                  type="number"
                  min="-1"
                  value={formData.limite_usuarios}
                  onChange={(e) => setFormData({ ...formData, limite_usuarios: e.target.value })}
                  placeholder="-1 para ilimitado"
                />
                <p className="text-xs text-muted-foreground">Use -1 para ilimitado</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="limite_pacientes">Limite de Pacientes</Label>
                <Input
                  id="limite_pacientes"
                  type="number"
                  min="-1"
                  value={formData.limite_pacientes}
                  onChange={(e) => setFormData({ ...formData, limite_pacientes: e.target.value })}
                  placeholder="-1 para ilimitado"
                />
                <p className="text-xs text-muted-foreground">Use -1 para ilimitado</p>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stripe_price_id">Stripe Price ID</Label>
              <Input
                id="stripe_price_id"
                value={formData.stripe_price_id}
                onChange={(e) => setFormData({ ...formData, stripe_price_id: e.target.value })}
                placeholder="price_xxxx"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
