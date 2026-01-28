'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, MoreHorizontal, Building2, Eye, Edit, Trash2 } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Clinica, Plano } from '@/lib/supabase/database.types'

interface ClinicaComPlano extends Clinica {
  planos: Pick<Plano, 'nome' | 'preco_mensal'> | null
  _count?: {
    usuarios: number
    pacientes: number
  }
}

export default function ClinicasPage() {
  const [clinicas, setClinicas] = useState<ClinicaComPlano[]>([])
  const [planos, setPlanos] = useState<Plano[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingClinica, setEditingClinica] = useState<Clinica | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cnpj: '',
    plano_id: '',
    status: 'trial' as Clinica['status'],
  })
  const [isSaving, setIsSaving] = useState(false)

  const { toast } = useToast()
  const supabase = createClient()

  const fetchClinicas = useCallback(async () => {
    try {
      let query = supabase
        .from('clinicas')
        .select('*, planos(nome, preco_mensal)')
        .order('created_at', { ascending: false })

      if (statusFilter !== 'todos') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setClinicas((data as ClinicaComPlano[]) || [])
    } catch (error) {
      console.error('Erro ao buscar clinicas:', error)
      toast({
        title: 'Erro',
        description: 'Nao foi possivel carregar as clinicas.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [supabase, statusFilter, toast])

  const fetchPlanos = useCallback(async () => {
    const { data } = await supabase
      .from('planos')
      .select('*')
      .eq('ativo', true)
      .order('preco_mensal', { ascending: true })

    setPlanos(data || [])
  }, [supabase])

  useEffect(() => {
    fetchClinicas()
    fetchPlanos()
  }, [fetchClinicas, fetchPlanos])

  const filteredClinicas = clinicas.filter((clinica) =>
    clinica.nome.toLowerCase().includes(search.toLowerCase()) ||
    clinica.email?.toLowerCase().includes(search.toLowerCase()) ||
    clinica.cnpj?.includes(search)
  )

  const handleOpenDialog = (clinica?: Clinica) => {
    if (clinica) {
      setEditingClinica(clinica)
      setFormData({
        nome: clinica.nome,
        email: clinica.email || '',
        telefone: clinica.telefone || '',
        cnpj: clinica.cnpj || '',
        plano_id: clinica.plano_id,
        status: clinica.status,
      })
    } else {
      setEditingClinica(null)
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        cnpj: '',
        plano_id: planos[0]?.id || '',
        status: 'trial',
      })
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.nome || !formData.plano_id) {
      toast({
        title: 'Erro',
        description: 'Preencha os campos obrigatorios.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      if (editingClinica) {
        const { error } = await supabase
          .from('clinicas')
          // @ts-ignore
          .update({
            nome: formData.nome,
            email: formData.email || null,
            telefone: formData.telefone || null,
            cnpj: formData.cnpj || null,
            plano_id: formData.plano_id,
            status: formData.status,
          })
          .eq('id', editingClinica.id)

        if (error) throw error

        toast({
          title: 'Sucesso',
          description: 'Clinica atualizada com sucesso.',
        })
      } else {
        const { error } = await supabase
          .from('clinicas')
          // @ts-ignore
          .insert({
            nome: formData.nome,
            email: formData.email || null,
            telefone: formData.telefone || null,
            cnpj: formData.cnpj || null,
            plano_id: formData.plano_id,
            status: formData.status,
            trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          })

        if (error) throw error

        toast({
          title: 'Sucesso',
          description: 'Clinica criada com sucesso.',
        })
      }

      setDialogOpen(false)
      fetchClinicas()
    } catch (error: any) {
      console.error('Erro ao salvar clinica:', error)
      toast({
        title: 'Erro',
        description: error.message || 'Nao foi possivel salvar a clinica.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta clinica? Esta acao nao pode ser desfeita.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('clinicas')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'Clinica excluida com sucesso.',
      })
      fetchClinicas()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Nao foi possivel excluir a clinica.',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = (status: Clinica['status']) => {
    const config = {
      ativa: { variant: 'success' as const, label: 'Ativa' },
      trial: { variant: 'warning' as const, label: 'Trial' },
      suspensa: { variant: 'destructive' as const, label: 'Suspensa' },
      cancelada: { variant: 'destructive' as const, label: 'Cancelada' },
    }
    const { variant, label } = config[status]
    return <Badge variant={variant}>{label}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clinicas</h2>
          <p className="text-muted-foreground">
            Gerencie todas as clinicas cadastradas na plataforma
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Clinica
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar clinicas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativa">Ativas</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="suspensa">Suspensas</SelectItem>
                <SelectItem value="cancelada">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : filteredClinicas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Nenhuma clinica encontrada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clinica</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criada em</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClinicas.map((clinica) => (
                  <TableRow key={clinica.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{clinica.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {clinica.email || clinica.cnpj || '-'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{clinica.planos?.nome || '-'}</p>
                        <p className="text-sm text-muted-foreground">
                          {clinica.planos?.preco_mensal
                            ? formatCurrency(clinica.planos.preco_mensal)
                            : '-'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(clinica.status)}</TableCell>
                    <TableCell>{formatDate(clinica.created_at)}</TableCell>
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
                            <Link href={`/master/clinicas/${clinica.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalhes
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenDialog(clinica)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(clinica.id)}
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
              {editingClinica ? 'Editar Clinica' : 'Nova Clinica'}
            </DialogTitle>
            <DialogDescription>
              {editingClinica
                ? 'Altere os dados da clinica abaixo.'
                : 'Preencha os dados para criar uma nova clinica.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome da clinica"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@clinica.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="plano">Plano *</Label>
                <Select
                  value={formData.plano_id}
                  onValueChange={(value) => setFormData({ ...formData, plano_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {planos.map((plano) => (
                      <SelectItem key={plano.id} value={plano.id}>
                        {plano.nome} - {formatCurrency(plano.preco_mensal)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: Clinica['status']) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="ativa">Ativa</SelectItem>
                    <SelectItem value="suspensa">Suspensa</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
