'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, MoreHorizontal, Users, Eye, Edit, Trash2, UserCheck, UserX } from 'lucide-react'
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
import { formatDate } from '@/lib/utils'
import type { Usuario, Clinica, PerfilUsuario } from '@/lib/supabase/database.types'

interface UsuarioComClinica extends Usuario {
  clinicas: Pick<Clinica, 'nome'> | null
}

interface FormData {
  nome: string
  email: string
  telefone: string
  perfil: PerfilUsuario
  especialidade: string
  registro_profissional: string
  clinica_id: string
  comAcesso: boolean
  password: string
}

const PERFIL_LABELS: Record<PerfilUsuario, string> = {
  master: 'Master',
  admin: 'Administrador',
  profissional: 'Profissional',
  recepcionista: 'Recepcionista',
}

export default function UsuariosMasterPage() {
  const [usuarios, setUsuarios] = useState<UsuarioComClinica[]>([])
  const [clinicas, setClinicas] = useState<Clinica[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [perfilFilter, setPerfilFilter] = useState<string>('todos')
  const [clinicaFilter, setClinicaFilter] = useState<string>('todos')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    telefone: '',
    perfil: 'admin',
    especialidade: '',
    registro_profissional: '',
    clinica_id: '',
    comAcesso: true,
    password: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  const { toast } = useToast()
  const supabase = createClient()

  const fetchUsuarios = useCallback(async () => {
    try {
      let query = supabase
        .from('usuarios')
        .select('*, clinicas(nome)')
        .order('created_at', { ascending: false })

      if (perfilFilter !== 'todos') {
        query = query.eq('perfil', perfilFilter)
      }

      if (clinicaFilter !== 'todos') {
        query = query.eq('clinica_id', clinicaFilter)
      }

      if (statusFilter !== 'todos') {
        query = query.eq('ativo', statusFilter === 'ativo')
      }

      const { data, error } = await query

      if (error) throw error
      setUsuarios((data as UsuarioComClinica[]) || [])
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
  }, [supabase, perfilFilter, clinicaFilter, statusFilter, toast])

  const fetchClinicas = useCallback(async () => {
    const { data } = await supabase
      .from('clinicas')
      .select('*')
      .order('nome', { ascending: true })

    setClinicas(data || [])
  }, [supabase])

  useEffect(() => {
    fetchUsuarios()
    fetchClinicas()
  }, [fetchUsuarios, fetchClinicas])

  const filteredUsuarios = usuarios.filter((usuario) =>
    usuario.nome.toLowerCase().includes(search.toLowerCase()) ||
    usuario.email?.toLowerCase().includes(search.toLowerCase())
  )

  const handleOpenDialog = (usuario?: Usuario) => {
    if (usuario) {
      setEditingUsuario(usuario)
      setFormData({
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone || '',
        perfil: usuario.perfil,
        especialidade: usuario.especialidade || '',
        registro_profissional: usuario.registro_profissional || '',
        clinica_id: usuario.clinica_id || '',
        comAcesso: true,
        password: '',
      })
    } else {
      setEditingUsuario(null)
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        perfil: 'admin',
        especialidade: '',
        registro_profissional: '',
        clinica_id: clinicas[0]?.id || '',
        comAcesso: true,
        password: '',
      })
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.nome || !formData.email) {
      toast({
        title: 'Erro',
        description: 'Nome e e-mail sao obrigatorios.',
        variant: 'destructive',
      })
      return
    }

    if (formData.perfil !== 'master' && !formData.clinica_id) {
      toast({
        title: 'Erro',
        description: 'Selecione uma clinica para o usuario.',
        variant: 'destructive',
      })
      return
    }

    if (!editingUsuario && formData.comAcesso && !formData.password) {
      toast({
        title: 'Erro',
        description: 'Senha e obrigatoria para usuarios com acesso ao sistema.',
        variant: 'destructive',
      })
      return
    }

    if (formData.comAcesso && formData.password && formData.password.length < 6) {
      toast({
        title: 'Erro',
        description: 'A senha deve ter no minimo 6 caracteres.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      if (editingUsuario) {
        // Atualizar usuario existente
        const { error } = await supabase
          .from('usuarios')
          // @ts-ignore
          .update({
            nome: formData.nome,
            email: formData.email,
            telefone: formData.telefone || null,
            perfil: formData.perfil,
            especialidade: formData.especialidade || null,
            registro_profissional: formData.registro_profissional || null,
            clinica_id: formData.perfil === 'master' ? null : formData.clinica_id,
          })
          .eq('id', editingUsuario.id)

        if (error) throw error

        toast({
          title: 'Sucesso',
          description: 'Usuario atualizado com sucesso.',
        })
      } else {
        // Criar novo usuario via API
        const response = await fetch('/api/usuarios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nome: formData.nome,
            email: formData.email,
            telefone: formData.telefone || null,
            perfil: formData.perfil,
            especialidade: formData.especialidade || null,
            registro_profissional: formData.registro_profissional || null,
            clinica_id: formData.perfil === 'master' ? null : formData.clinica_id,
            comAcesso: formData.comAcesso,
            password: formData.comAcesso ? formData.password : null,
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
            : 'Usuario criado sem acesso ao sistema.',
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

  const handleToggleStatus = async (usuario: Usuario) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        // @ts-ignore
        .update({ ativo: !usuario.ativo })
        .eq('id', usuario.id)

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: usuario.ativo ? 'Usuario desativado.' : 'Usuario ativado.',
      })
      fetchUsuarios()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Nao foi possivel alterar o status.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuario? Esta acao nao pode ser desfeita.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('usuarios')
        // @ts-ignore
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'Usuario excluido com sucesso.',
      })
      fetchUsuarios()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Nao foi possivel excluir o usuario.',
        variant: 'destructive',
      })
    }
  }

  const getPerfilBadge = (perfil: PerfilUsuario) => {
    const config: Record<PerfilUsuario, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
      master: { variant: 'destructive', label: 'Master' },
      admin: { variant: 'default', label: 'Admin' },
      profissional: { variant: 'secondary', label: 'Profissional' },
      recepcionista: { variant: 'outline', label: 'Recepcionista' },
    }
    const { variant, label } = config[perfil]
    return <Badge variant={variant}>{label}</Badge>
  }

  const getStatusBadge = (ativo: boolean) => {
    return ativo ? (
      <Badge variant="success">Ativo</Badge>
    ) : (
      <Badge variant="destructive">Inativo</Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Usuarios</h2>
          <p className="text-muted-foreground">
            Gerencie os usuarios de todas as clinicas da plataforma
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuario
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usuarios.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usuarios.filter(u => u.perfil === 'admin').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Profissionais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usuarios.filter(u => u.perfil === 'profissional').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usuarios.filter(u => u.ativo).length}
            </div>
          </CardContent>
        </Card>
      </div>

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
            <div className="flex flex-wrap gap-2">
              <Select value={clinicaFilter} onValueChange={setClinicaFilter}>
                <SelectTrigger className="w-full md:w-44">
                  <SelectValue placeholder="Clinica" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as Clinicas</SelectItem>
                  {clinicas.map((clinica) => (
                    <SelectItem key={clinica.id} value={clinica.id}>
                      {clinica.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={perfilFilter} onValueChange={setPerfilFilter}>
                <SelectTrigger className="w-full md:w-36">
                  <SelectValue placeholder="Perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Perfis</SelectItem>
                  <SelectItem value="master">Master</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="profissional">Profissional</SelectItem>
                  <SelectItem value="recepcionista">Recepcionista</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativo">Ativos</SelectItem>
                  <SelectItem value="inativo">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                  <TableHead>Clinica</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{usuario.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {usuario.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {usuario.clinicas?.nome || (usuario.perfil === 'master' ? 'Plataforma' : '-')}
                      </p>
                    </TableCell>
                    <TableCell>{getPerfilBadge(usuario.perfil)}</TableCell>
                    <TableCell>{getStatusBadge(usuario.ativo)}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleToggleStatus(usuario)}>
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
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(usuario.id)}
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
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {editingUsuario ? 'Editar Usuario' : 'Novo Usuario'}
            </DialogTitle>
            <DialogDescription>
              {editingUsuario
                ? 'Altere os dados do usuario abaixo.'
                : 'Preencha os dados para criar um novo usuario administrador para uma clinica.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                  disabled={!!editingUsuario}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="perfil">Perfil *</Label>
                <Select
                  value={formData.perfil}
                  onValueChange={(value: PerfilUsuario) => setFormData({ ...formData, perfil: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="master">Master</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="profissional">Profissional</SelectItem>
                    <SelectItem value="recepcionista">Recepcionista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.perfil !== 'master' && (
                <div className="grid gap-2">
                  <Label htmlFor="clinica">Clinica *</Label>
                  <Select
                    value={formData.clinica_id}
                    onValueChange={(value) => setFormData({ ...formData, clinica_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma clinica" />
                    </SelectTrigger>
                    <SelectContent>
                      {clinicas.map((clinica) => (
                        <SelectItem key={clinica.id} value={clinica.id}>
                          {clinica.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {(formData.perfil === 'profissional') && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="especialidade">Especialidade</Label>
                  <Input
                    id="especialidade"
                    value={formData.especialidade}
                    onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                    placeholder="Ex: Fisioterapeuta"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="registro">Registro Profissional</Label>
                  <Input
                    id="registro"
                    value={formData.registro_profissional}
                    onChange={(e) => setFormData({ ...formData, registro_profissional: e.target.value })}
                    placeholder="Ex: CREFITO-123456"
                  />
                </div>
              </div>
            )}

            {!editingUsuario && (
              <>
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="comAcesso"
                    checked={formData.comAcesso}
                    onChange={(e) => setFormData({ ...formData, comAcesso: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="comAcesso" className="text-sm font-normal">
                    Usuario com acesso ao sistema (podera fazer login)
                  </Label>
                </div>

                {formData.comAcesso && (
                  <div className="grid gap-2">
                    <Label htmlFor="password">Senha *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Minimo 6 caracteres"
                    />
                    <p className="text-xs text-muted-foreground">
                      O usuario recebera essas credenciais para acessar o sistema.
                    </p>
                  </div>
                )}
              </>
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
