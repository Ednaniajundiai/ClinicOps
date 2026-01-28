'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, MoreHorizontal, Users, Edit, Trash2, UserCheck, UserX, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { useClinica } from '@/hooks/use-clinica'
import { formatDate } from '@/lib/utils'
import type { Usuario, PerfilUsuario } from '@/lib/supabase/database.types'

export default function EquipePage() {
  const { clinica, plano } = useClinica()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [perfilFilter, setPerfilFilter] = useState<string>('todos')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    perfil: 'recepcionista' as PerfilUsuario,
    telefone: '',
    especialidade: '',
    registro_profissional: '',
    ativo: true,
  })
  const [isSaving, setIsSaving] = useState(false)

  const { toast } = useToast()
  const supabase = createClient()

  const fetchUsuarios = useCallback(async () => {
    if (!clinica?.id) return

    try {
      let query = supabase
        .from('usuarios')
        .select('*')
        .eq('clinica_id', clinica.id)
        .neq('perfil', 'master')
        .order('nome', { ascending: true })

      if (perfilFilter !== 'todos') {
        query = query.eq('perfil', perfilFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setUsuarios(data || [])
    } catch (error) {
      console.error('Erro ao buscar usuarios:', error)
      toast({
        title: 'Erro',
        description: 'Nao foi possivel carregar os usuarios.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [clinica?.id, supabase, perfilFilter, toast])

  useEffect(() => {
    if (clinica?.id) {
      fetchUsuarios()
    }
  }, [clinica?.id, fetchUsuarios])

  const filteredUsuarios = usuarios.filter((usuario) =>
    usuario.nome.toLowerCase().includes(search.toLowerCase()) ||
    (usuario.email && usuario.email.toLowerCase().includes(search.toLowerCase()))
  )

  const handleOpenDialog = (usuario?: Usuario) => {
    if (usuario) {
      setEditingUsuario(usuario)
      setFormData({
        nome: usuario.nome,
        email: usuario.email,
        password: '',
        perfil: usuario.perfil,
        telefone: usuario.telefone || '',
        especialidade: usuario.especialidade || '',
        registro_profissional: usuario.registro_profissional || '',
        ativo: usuario.ativo,
      })
    } else {
      setEditingUsuario(null)
      setFormData({
        nome: '',
        email: '',
        password: '',
        perfil: 'recepcionista',
        telefone: '',
        especialidade: '',
        registro_profissional: '',
        ativo: true,
      })
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.nome) {
      toast({
        title: 'Erro',
        description: 'Preencha o nome do usuario.',
        variant: 'destructive',
      })
      return
    }

    // Se informou email, precisa informar senha para novos usuarios
    if (!editingUsuario && formData.email && !formData.password) {
      toast({
        title: 'Erro',
        description: 'Informe uma senha para o usuario com email.',
        variant: 'destructive',
      })
      return
    }

    // Verificar limite de usuarios
    if (!editingUsuario && plano && plano.limite_usuarios !== -1) {
      const usuariosAtivos = usuarios.filter(u => u.ativo).length
      if (usuariosAtivos >= plano.limite_usuarios) {
        toast({
          title: 'Limite atingido',
          description: `Seu plano permite apenas ${plano.limite_usuarios} usuarios. Faca upgrade para adicionar mais.`,
          variant: 'destructive',
        })
        return
      }
    }

    setIsSaving(true)
    try {
      if (editingUsuario) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('usuarios')
          .update({
            nome: formData.nome,
            email: formData.email || editingUsuario.email,
            perfil: formData.perfil,
            telefone: formData.telefone || null,
            especialidade: formData.especialidade || null,
            registro_profissional: formData.registro_profissional || null,
            ativo: formData.ativo,
          })
          .eq('id', editingUsuario.id)

        if (error) throw error

        toast({
          title: 'Sucesso',
          description: 'Usuario atualizado com sucesso.',
        })
      } else {
        // Usar API route para criar usuario (bypass RLS com service_role)
        const response = await fetch('/api/usuarios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nome: formData.nome,
            email: formData.email || null,
            perfil: formData.perfil,
            telefone: formData.telefone || null,
            especialidade: formData.especialidade || null,
            registro_profissional: formData.registro_profissional || null,
            clinica_id: clinica!.id,
            comAcesso: !!(formData.email && formData.password),
            password: formData.password || null,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Erro ao criar usuario')
        }

        toast({
          title: 'Sucesso',
          description: result.comAcesso 
            ? 'Usuario criado com acesso ao sistema.'
            : 'Usuario cadastrado com sucesso (sem acesso ao sistema).',
        })
      }

      setDialogOpen(false)
      fetchUsuarios()
    } catch (error: any) {
      console.error('Erro ao salvar usuario:', error)
      toast({
        title: 'Erro',
        description: error.message || 'Nao foi possivel salvar o usuario.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const toggleAtivo = async (usuario: Usuario) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('usuarios')
        .update({ ativo: !usuario.ativo })
        .eq('id', usuario.id)

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: `Usuario ${usuario.ativo ? 'desativado' : 'ativado'} com sucesso.`,
      })
      fetchUsuarios()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Nao foi possivel atualizar o usuario.',
        variant: 'destructive',
      })
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getPerfilBadge = (perfil: PerfilUsuario) => {
    const config = {
      admin: { variant: 'default' as const, label: 'Admin' },
      profissional: { variant: 'secondary' as const, label: 'Profissional' },
      recepcionista: { variant: 'outline' as const, label: 'Recepcionista' },
      master: { variant: 'destructive' as const, label: 'Master' },
    }
    const { variant, label } = config[perfil]
    return <Badge variant={variant}>{label}</Badge>
  }

  const usuariosAtivos = usuarios.filter(u => u.ativo).length
  const limiteUsuarios = plano?.limite_usuarios === -1 ? 'Ilimitado' : plano?.limite_usuarios || 0
  const percentualUso = plano?.limite_usuarios === -1 
    ? 0 
    : (usuariosAtivos / (plano?.limite_usuarios || 1)) * 100

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Equipe</h2>
          <p className="text-muted-foreground">
            Gerencie os usuarios da sua clinica
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuario
        </Button>
      </div>

      {/* Card de uso */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Uso do Plano</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {usuariosAtivos} de {limiteUsuarios} usuarios
            </span>
            {plano?.limite_usuarios !== -1 && (
              <span className="text-sm font-medium">
                {percentualUso.toFixed(0)}%
              </span>
            )}
          </div>
          {plano?.limite_usuarios !== -1 && (
            <div className="mt-2 h-2 w-full rounded-full bg-muted">
              <div 
                className="h-2 rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(percentualUso, 100)}%` }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={perfilFilter} onValueChange={setPerfilFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="profissional">Profissional</SelectItem>
                <SelectItem value="recepcionista">Recepcionista</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Users className="h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Nenhum usuario encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Especialidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={usuario.avatar_url || ''} />
                          <AvatarFallback>{getInitials(usuario.nome)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{usuario.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {usuario.email?.includes('@interno.local') ? 'Sem acesso ao sistema' : usuario.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getPerfilBadge(usuario.perfil)}</TableCell>
                    <TableCell>
                      {usuario.especialidade || '-'}
                      {usuario.registro_profissional && (
                        <p className="text-xs text-muted-foreground">
                          {usuario.registro_profissional}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={usuario.ativo ? 'success' : 'secondary'}>
                        {usuario.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(usuario.created_at)}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleOpenDialog(usuario)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleAtivo(usuario)}>
                            {usuario.ativo ? (
                              <>
                                <UserX className="mr-2 h-4 w-4" />
                                Desativar
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Ativar
                              </>
                            )}
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
              {editingUsuario ? 'Editar Usuario' : 'Novo Usuario'}
            </DialogTitle>
            <DialogDescription>
              {editingUsuario
                ? 'Altere os dados do usuario abaixo.'
                : 'Preencha os dados para criar um novo usuario.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome do usuario"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail (opcional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
                disabled={!!editingUsuario}
              />
              <p className="text-xs text-muted-foreground">
                Deixe em branco se o usuario nao precisar acessar o sistema
              </p>
            </div>
            {!editingUsuario && formData.email && (
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimo 6 caracteres"
                />
                <p className="text-xs text-muted-foreground">
                  Obrigatoria para usuarios com acesso ao sistema
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="perfil">Perfil *</Label>
                <Select
                  value={formData.perfil}
                  onValueChange={(value: PerfilUsuario) =>
                    setFormData({ ...formData, perfil: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="profissional">Profissional</SelectItem>
                    <SelectItem value="recepcionista">Recepcionista</SelectItem>
                  </SelectContent>
                </Select>
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
            {formData.perfil === 'profissional' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="especialidade">Especialidade</Label>
                  <Input
                    id="especialidade"
                    value={formData.especialidade}
                    onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                    placeholder="Ex: Fisioterapia"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="registro_profissional">Registro</Label>
                  <Input
                    id="registro_profissional"
                    value={formData.registro_profissional}
                    onChange={(e) => setFormData({ ...formData, registro_profissional: e.target.value })}
                    placeholder="Ex: CREFITO-12345"
                  />
                </div>
              </div>
            )}
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
