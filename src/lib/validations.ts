import { z } from 'zod'

// =============================================
// VALIDACAO DE PLANOS
// =============================================

export const planoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  descricao: z.string().optional(),
  preco_mensal: z.coerce.number().min(0, 'Preco deve ser maior ou igual a 0'),
  limite_usuarios: z.coerce.number().int().min(-1, 'Limite invalido'),
  limite_pacientes: z.coerce.number().int().min(-1, 'Limite invalido'),
  ativo: z.boolean().default(true),
  stripe_price_id: z.string().optional(),
})

export type PlanoFormData = z.infer<typeof planoSchema>

// =============================================
// VALIDACAO DE CLINICAS
// =============================================

export const clinicaSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  plano_id: z.string().uuid('Selecione um plano valido'),
  cnpj: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email('Email invalido').optional().or(z.literal('')),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().max(2).optional(),
  cep: z.string().optional(),
  status: z.enum(['ativa', 'suspensa', 'cancelada', 'trial']).default('trial'),
})

export type ClinicaFormData = z.infer<typeof clinicaSchema>

// =============================================
// VALIDACAO DE USUARIOS
// =============================================

export const usuarioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email invalido').optional().or(z.literal('')),
  perfil: z.enum(['admin', 'profissional', 'recepcionista']),
  telefone: z.string().optional(),
  especialidade: z.string().optional(),
  registro_profissional: z.string().optional(),
  ativo: z.boolean().default(true),
})

export const usuarioCreateSchema = usuarioSchema.extend({
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional().or(z.literal('')),
})

export type UsuarioFormData = z.infer<typeof usuarioSchema>
export type UsuarioCreateFormData = z.infer<typeof usuarioCreateSchema>

// =============================================
// VALIDACAO DE PACIENTES
// =============================================

export const pacienteSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf_encrypted: z.string().optional(),
  data_nascimento: z.string().optional(),
  sexo: z.enum(['M', 'F', 'O']).optional().nullable(),
  telefone: z.string().optional(),
  email: z.string().email('Email invalido').optional().or(z.literal('')),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().max(2).optional(),
  cep: z.string().optional(),
  observacoes: z.string().optional(),
  ativo: z.boolean().default(true),
})

export type PacienteFormData = z.infer<typeof pacienteSchema>

// =============================================
// VALIDACAO DE ATENDIMENTOS
// =============================================

export const atendimentoSchema = z.object({
  paciente_id: z.string().uuid('Selecione um paciente'),
  profissional_id: z.string().uuid('Selecione um profissional'),
  data_hora: z.string().min(1, 'Data e hora sao obrigatorios'),
  duracao_minutos: z.coerce.number().int().min(5, 'Duracao minima de 5 minutos').default(30),
  tipo: z.string().min(1, 'Tipo de atendimento e obrigatorio'),
  descricao: z.string().optional(),
  observacoes: z.string().optional(),
  status: z.enum(['agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'faltou']).default('agendado'),
  valor: z.coerce.number().min(0).optional(),
})

export type AtendimentoFormData = z.infer<typeof atendimentoSchema>

// =============================================
// VALIDACAO DE DOCUMENTOS
// =============================================

export const documentoSchema = z.object({
  paciente_id: z.string().uuid('Selecione um paciente'),
  nome: z.string().min(1, 'Nome do documento e obrigatorio'),
  descricao: z.string().optional(),
  tipo: z.string().min(1, 'Tipo e obrigatorio'),
})

export type DocumentoFormData = z.infer<typeof documentoSchema>
