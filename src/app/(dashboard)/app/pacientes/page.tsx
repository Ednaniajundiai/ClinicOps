'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, MoreHorizontal, Users, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'
import { useClinica } from '@/hooks/use-clinica'
import { formatDate, formatPhone } from '@/lib/utils'
import type { Paciente } from '@/lib/supabase/database.types'

const ITEMS_PER_PAGE = 10

export default function PacientesPage() {
  const { clinica, plano } = useClinica()
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const { toast } = useToast()
  const supabase = createClient()

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setCurrentPage(1)
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  const fetchPacientes = useCallback(async () => {
    if (!clinica?.id) return

    setIsLoading(true)
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      let query = supabase
        .from('pacientes')
        .select('*', { count: 'exact' })
        .eq('clinica_id', clinica.id)
        .eq('ativo', true)
        .order('nome', { ascending: true })
        .range(from, to)

      if (debouncedSearch) {
        query = query.or(`nome.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%,telefone.ilike.%${debouncedSearch}%`)
      }

      const { data, error, count } = await query

      if (error) throw error

      setPacientes(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error)
      toast({
        title: 'Erro',
        description: 'Nao foi possivel carregar os pacientes.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [clinica?.id, supabase, currentPage, debouncedSearch, toast])

  useEffect(() => {
    if (clinica?.id) {
      fetchPacientes()
    }
  }, [clinica?.id, fetchPacientes])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este paciente?')) {
      return
    }

    try {
      // Soft delete
      const { error } = await supabase
        .from('pacientes')
        // @ts-ignore
        .update({ ativo: false })
        .eq('id', id)

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'Paciente excluido com sucesso.',
      })
      fetchPacientes()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Nao foi possivel excluir o paciente.',
        variant: 'destructive',
      })
    }
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
  const canGoBack = currentPage > 1
  const canGoForward = currentPage < totalPages

  const getSexoLabel = (sexo: Paciente['sexo']) => {
    const labels = {
      M: 'Masculino',
      F: 'Feminino',
      O: 'Outro',
    }
    return sexo ? labels[sexo] : '-'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pacientes</h2>
          <p className="text-muted-foreground">
            {totalCount} pacientes cadastrados
          </p>
        </div>
        <Button asChild>
          <Link href="/app/pacientes/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Paciente
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Pagina {currentPage} de {totalPages || 1}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : pacientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Users className="h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">
                {debouncedSearch ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
              </p>
              {!debouncedSearch && (
                <Button asChild className="mt-4">
                  <Link href="/app/pacientes/novo">
                    <Plus className="mr-2 h-4 w-4" />
                    Cadastrar primeiro paciente
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Data de Nascimento</TableHead>
                    <TableHead>Sexo</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pacientes.map((paciente) => (
                    <TableRow key={paciente.id}>
                      <TableCell>
                        <Link 
                          href={`/app/pacientes/${paciente.id}`}
                          className="font-medium hover:underline"
                        >
                          {paciente.nome}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>
                          {paciente.telefone && (
                            <p className="text-sm">{formatPhone(paciente.telefone)}</p>
                          )}
                          {paciente.email && (
                            <p className="text-sm text-muted-foreground">{paciente.email}</p>
                          )}
                          {!paciente.telefone && !paciente.email && '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {paciente.data_nascimento ? formatDate(paciente.data_nascimento) : '-'}
                      </TableCell>
                      <TableCell>{getSexoLabel(paciente.sexo)}</TableCell>
                      <TableCell>{formatDate(paciente.created_at)}</TableCell>
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
                              <Link href={`/app/pacientes/${paciente.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalhes
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/app/pacientes/${paciente.id}/editar`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(paciente.id)}
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

              {/* Paginacao */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} de {totalCount}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => p - 1)}
                      disabled={!canGoBack}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => p + 1)}
                      disabled={!canGoForward}
                    >
                      Proximo
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
