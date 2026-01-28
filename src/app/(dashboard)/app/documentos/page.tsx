'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  FileText, 
  Eye, 
  Trash2, 
  Download,
  Upload,
  File,
  Image,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
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
import { useClinica } from '@/hooks/use-clinica'
import { useAuth } from '@/hooks/use-auth'
import { formatDate } from '@/lib/utils'
import type { Documento, Paciente } from '@/lib/supabase/database.types'

interface DocumentoComPaciente extends Documento {
  paciente: Pick<Paciente, 'nome'> | null
}

const ITEMS_PER_PAGE = 10

const TIPOS_DOCUMENTO = [
  'Receita',
  'Atestado',
  'Laudo',
  'Exame',
  'Contrato',
  'Termo de Consentimento',
  'Outros',
]

export default function DocumentosPage() {
  const { clinica } = useClinica()
  const { usuario } = useAuth()
  const [documentos, setDocumentos] = useState<DocumentoComPaciente[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    paciente_id: '',
    nome: '',
    tipo: '',
    descricao: '',
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const fetchDocumentos = useCallback(async () => {
    if (!clinica?.id) return

    setIsLoading(true)
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      let query = supabase
        .from('documentos')
        .select('*, paciente:pacientes(nome)', { count: 'exact' })
        .eq('clinica_id', clinica.id)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (debouncedSearch) {
        query = query.or(`nome.ilike.%${debouncedSearch}%,tipo.ilike.%${debouncedSearch}%`)
      }

      const { data, error, count } = await query

      if (error) throw error

      setDocumentos((data as DocumentoComPaciente[]) || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Erro ao buscar documentos:', error)
      toast({
        title: 'Erro',
        description: 'Nao foi possivel carregar os documentos.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [clinica?.id, supabase, currentPage, debouncedSearch, toast])

  const fetchPacientes = useCallback(async () => {
    if (!clinica?.id) return

    const { data } = await supabase
      .from('pacientes')
      .select('id, nome')
      .eq('clinica_id', clinica.id)
      .eq('ativo', true)
      .order('nome', { ascending: true })

    setPacientes(data || [])
  }, [clinica?.id, supabase])

  useEffect(() => {
    if (clinica?.id) {
      fetchDocumentos()
      fetchPacientes()
    }
  }, [clinica?.id, fetchDocumentos, fetchPacientes])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (!formData.nome) {
        setFormData({ ...formData, nome: file.name.replace(/\.[^/.]+$/, '') })
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !formData.paciente_id || !formData.nome || !formData.tipo) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatorios.',
        variant: 'destructive',
      })
      return
    }

    if (!clinica?.id || !usuario?.id) {
      toast({
        title: 'Erro',
        description: 'Erro ao identificar clinica ou usuario.',
        variant: 'destructive',
      })
      return
    }

    setIsUploading(true)
    try {
      // Upload do arquivo para o storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${clinica.id}/${formData.paciente_id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('documentos-Dizevolv')
        .upload(fileName, selectedFile)

      if (uploadError) throw uploadError

      // Criar registro no banco
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: dbError } = await (supabase as any)
        .from('documentos')
        .insert({
          clinica_id: clinica.id,
          paciente_id: formData.paciente_id,
          usuario_id: usuario.id,
          nome: formData.nome,
          descricao: formData.descricao || null,
          tipo: formData.tipo,
          storage_path: fileName,
          tamanho_bytes: selectedFile.size,
        })

      if (dbError) throw dbError

      toast({
        title: 'Sucesso',
        description: 'Documento enviado com sucesso.',
      })

      setDialogOpen(false)
      setSelectedFile(null)
      setFormData({ paciente_id: '', nome: '', tipo: '', descricao: '' })
      if (fileInputRef.current) fileInputRef.current.value = ''
      fetchDocumentos()
    } catch (error: any) {
      console.error('Erro ao enviar documento:', error)
      toast({
        title: 'Erro',
        description: error.message || 'Nao foi possivel enviar o documento.',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownload = async (documento: Documento) => {
    try {
      const { data, error } = await supabase.storage
        .from('documentos-Dizevolv')
        .download(documento.storage_path)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = documento.nome
      a.click()
      URL.revokeObjectURL(url)
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Nao foi possivel baixar o documento.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (documento: Documento) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) {
      return
    }

    try {
      // Deletar do storage
      await supabase.storage
        .from('documentos-Dizevolv')
        .remove([documento.storage_path])

      // Deletar do banco
      const { error } = await supabase
        .from('documentos')
        .delete()
        .eq('id', documento.id)

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'Documento excluido com sucesso.',
      })
      fetchDocumentos()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Nao foi possivel excluir o documento.',
        variant: 'destructive',
      })
    }
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
  const canGoBack = currentPage > 1
  const canGoForward = currentPage < totalPages

  const getFileIcon = (tipo: string) => {
    if (tipo.includes('Imagem') || tipo.includes('Exame')) {
      return <Image className="h-4 w-4" />
    }
    if (tipo.includes('Planilha')) {
      return <FileSpreadsheet className="h-4 w-4" />
    }
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Documentos</h2>
          <p className="text-muted-foreground">
            {totalCount} documentos armazenados
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Enviar Documento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou tipo..."
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
          ) : documentos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">
                {debouncedSearch ? 'Nenhum documento encontrado' : 'Nenhum documento armazenado'}
              </p>
              {!debouncedSearch && (
                <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Enviar primeiro documento
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Documento</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentos.map((documento) => (
                    <TableRow key={documento.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getFileIcon(documento.tipo)}
                          <span className="font-medium">{documento.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link 
                          href={`/app/pacientes/${documento.paciente_id}`}
                          className="hover:underline"
                        >
                          {documento.paciente?.nome || '-'}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{documento.tipo}</Badge>
                      </TableCell>
                      <TableCell>{formatFileSize(documento.tamanho_bytes)}</TableCell>
                      <TableCell>{formatDate(documento.created_at)}</TableCell>
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
                            <DropdownMenuItem onClick={() => handleDownload(documento)}>
                              <Download className="mr-2 h-4 w-4" />
                              Baixar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(documento)}
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

      {/* Dialog de Upload */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Enviar Documento</DialogTitle>
            <DialogDescription>
              Faca upload de um documento para um paciente
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="paciente_id">Paciente *</Label>
              <Select
                value={formData.paciente_id}
                onValueChange={(value) => setFormData({ ...formData, paciente_id: value })}
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
            </div>

            <div className="grid gap-2">
              <Label htmlFor="file">Arquivo *</Label>
              <Input
                id="file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.xls,.xlsx"
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nome">Nome do Documento *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome do documento"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_DOCUMENTO.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="descricao">Descricao</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descricao opcional"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? 'Enviando...' : 'Enviar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
