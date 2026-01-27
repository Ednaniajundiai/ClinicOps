export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      planos: {
        Row: {
          id: string
          nome: string
          descricao: string | null
          preco_mensal: number
          limite_usuarios: number
          limite_pacientes: number
          recursos: Json
          ativo: boolean
          stripe_price_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          descricao?: string | null
          preco_mensal: number
          limite_usuarios: number
          limite_pacientes: number
          recursos?: Json
          ativo?: boolean
          stripe_price_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          descricao?: string | null
          preco_mensal?: number
          limite_usuarios?: number
          limite_pacientes?: number
          recursos?: Json
          ativo?: boolean
          stripe_price_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clinicas: {
        Row: {
          id: string
          plano_id: string
          nome: string
          cnpj: string | null
          telefone: string | null
          email: string | null
          endereco: string | null
          cidade: string | null
          estado: string | null
          cep: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          status: 'ativa' | 'suspensa' | 'cancelada' | 'trial'
          trial_ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          plano_id: string
          nome: string
          cnpj?: string | null
          telefone?: string | null
          email?: string | null
          endereco?: string | null
          cidade?: string | null
          estado?: string | null
          cep?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: 'ativa' | 'suspensa' | 'cancelada' | 'trial'
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          plano_id?: string
          nome?: string
          cnpj?: string | null
          telefone?: string | null
          email?: string | null
          endereco?: string | null
          cidade?: string | null
          estado?: string | null
          cep?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: 'ativa' | 'suspensa' | 'cancelada' | 'trial'
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      usuarios: {
        Row: {
          id: string
          clinica_id: string | null
          auth_user_id: string
          email: string
          nome: string
          perfil: 'master' | 'admin' | 'profissional' | 'recepcionista'
          telefone: string | null
          especialidade: string | null
          registro_profissional: string | null
          avatar_url: string | null
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clinica_id?: string | null
          auth_user_id: string
          email: string
          nome: string
          perfil?: 'master' | 'admin' | 'profissional' | 'recepcionista'
          telefone?: string | null
          especialidade?: string | null
          registro_profissional?: string | null
          avatar_url?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clinica_id?: string | null
          auth_user_id?: string
          email?: string
          nome?: string
          perfil?: 'master' | 'admin' | 'profissional' | 'recepcionista'
          telefone?: string | null
          especialidade?: string | null
          registro_profissional?: string | null
          avatar_url?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      pacientes: {
        Row: {
          id: string
          clinica_id: string
          nome: string
          cpf_encrypted: string | null
          data_nascimento: string | null
          sexo: 'M' | 'F' | 'O' | null
          telefone: string | null
          email: string | null
          endereco: string | null
          cidade: string | null
          estado: string | null
          cep: string | null
          observacoes: string | null
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clinica_id: string
          nome: string
          cpf_encrypted?: string | null
          data_nascimento?: string | null
          sexo?: 'M' | 'F' | 'O' | null
          telefone?: string | null
          email?: string | null
          endereco?: string | null
          cidade?: string | null
          estado?: string | null
          cep?: string | null
          observacoes?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clinica_id?: string
          nome?: string
          cpf_encrypted?: string | null
          data_nascimento?: string | null
          sexo?: 'M' | 'F' | 'O' | null
          telefone?: string | null
          email?: string | null
          endereco?: string | null
          cidade?: string | null
          estado?: string | null
          cep?: string | null
          observacoes?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      atendimentos: {
        Row: {
          id: string
          clinica_id: string
          paciente_id: string
          profissional_id: string
          data_hora: string
          duracao_minutos: number | null
          tipo: string
          descricao: string | null
          observacoes: string | null
          status: 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado' | 'faltou'
          valor: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clinica_id: string
          paciente_id: string
          profissional_id: string
          data_hora: string
          duracao_minutos?: number | null
          tipo: string
          descricao?: string | null
          observacoes?: string | null
          status?: 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado' | 'faltou'
          valor?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clinica_id?: string
          paciente_id?: string
          profissional_id?: string
          data_hora?: string
          duracao_minutos?: number | null
          tipo?: string
          descricao?: string | null
          observacoes?: string | null
          status?: 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado' | 'faltou'
          valor?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      documentos: {
        Row: {
          id: string
          clinica_id: string
          paciente_id: string
          usuario_id: string
          nome: string
          descricao: string | null
          tipo: string
          storage_path: string
          tamanho_bytes: number | null
          created_at: string
        }
        Insert: {
          id?: string
          clinica_id: string
          paciente_id: string
          usuario_id: string
          nome: string
          descricao?: string | null
          tipo: string
          storage_path: string
          tamanho_bytes?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          clinica_id?: string
          paciente_id?: string
          usuario_id?: string
          nome?: string
          descricao?: string | null
          tipo?: string
          storage_path?: string
          tamanho_bytes?: number | null
          created_at?: string
        }
      }
      auditoria: {
        Row: {
          id: string
          clinica_id: string | null
          usuario_id: string | null
          acao: 'INSERT' | 'UPDATE' | 'DELETE'
          tabela: string
          registro_id: string
          dados_anteriores: Json | null
          dados_novos: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          clinica_id?: string | null
          usuario_id?: string | null
          acao: 'INSERT' | 'UPDATE' | 'DELETE'
          tabela: string
          registro_id: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          clinica_id?: string | null
          usuario_id?: string | null
          acao?: 'INSERT' | 'UPDATE' | 'DELETE'
          tabela?: string
          registro_id?: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      uso_recursos: {
        Row: {
          id: string
          clinica_id: string
          mes_referencia: string
          total_usuarios: number
          total_pacientes: number
          total_atendimentos: number
          total_documentos: number
          storage_usado_bytes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clinica_id: string
          mes_referencia: string
          total_usuarios?: number
          total_pacientes?: number
          total_atendimentos?: number
          total_documentos?: number
          storage_usado_bytes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clinica_id?: string
          mes_referencia?: string
          total_usuarios?: number
          total_pacientes?: number
          total_atendimentos?: number
          total_documentos?: number
          storage_usado_bytes?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_clinica_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_perfil: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_master: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      perfil_usuario: 'master' | 'admin' | 'profissional' | 'recepcionista'
      status_clinica: 'ativa' | 'suspensa' | 'cancelada' | 'trial'
      status_atendimento: 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado' | 'faltou'
      sexo_paciente: 'M' | 'F' | 'O'
      acao_auditoria: 'INSERT' | 'UPDATE' | 'DELETE'
    }
  }
}

// Tipos auxiliares para uso no código
export type Plano = Database['public']['Tables']['planos']['Row']
export type PlanoInsert = Database['public']['Tables']['planos']['Insert']
export type PlanoUpdate = Database['public']['Tables']['planos']['Update']

export type Clinica = Database['public']['Tables']['clinicas']['Row']
export type ClinicaInsert = Database['public']['Tables']['clinicas']['Insert']
export type ClinicaUpdate = Database['public']['Tables']['clinicas']['Update']

export type Usuario = Database['public']['Tables']['usuarios']['Row']
export type UsuarioInsert = Database['public']['Tables']['usuarios']['Insert']
export type UsuarioUpdate = Database['public']['Tables']['usuarios']['Update']

export type Paciente = Database['public']['Tables']['pacientes']['Row']
export type PacienteInsert = Database['public']['Tables']['pacientes']['Insert']
export type PacienteUpdate = Database['public']['Tables']['pacientes']['Update']

export type Atendimento = Database['public']['Tables']['atendimentos']['Row']
export type AtendimentoInsert = Database['public']['Tables']['atendimentos']['Insert']
export type AtendimentoUpdate = Database['public']['Tables']['atendimentos']['Update']

export type Documento = Database['public']['Tables']['documentos']['Row']
export type DocumentoInsert = Database['public']['Tables']['documentos']['Insert']
export type DocumentoUpdate = Database['public']['Tables']['documentos']['Update']

export type Auditoria = Database['public']['Tables']['auditoria']['Row']

export type UsoRecursos = Database['public']['Tables']['uso_recursos']['Row']

export type PerfilUsuario = Database['public']['Enums']['perfil_usuario']
export type StatusClinica = Database['public']['Enums']['status_clinica']
export type StatusAtendimento = Database['public']['Enums']['status_atendimento']
