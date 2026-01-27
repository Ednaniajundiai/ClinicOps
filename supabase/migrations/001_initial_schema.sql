-- =============================================
-- CLINICOPS - Schema Inicial com RLS
-- =============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- TIPOS ENUMERADOS
-- =============================================

CREATE TYPE perfil_usuario AS ENUM ('master', 'admin', 'profissional', 'recepcionista');
CREATE TYPE status_clinica AS ENUM ('ativa', 'suspensa', 'cancelada', 'trial');
CREATE TYPE status_atendimento AS ENUM ('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'faltou');
CREATE TYPE sexo_paciente AS ENUM ('M', 'F', 'O');
CREATE TYPE acao_auditoria AS ENUM ('INSERT', 'UPDATE', 'DELETE');

-- =============================================
-- TABELA: PLANOS
-- =============================================

CREATE TABLE planos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco_mensal DECIMAL(10, 2) NOT NULL,
    limite_usuarios INTEGER NOT NULL DEFAULT 3,
    limite_pacientes INTEGER NOT NULL DEFAULT 500,
    recursos JSONB DEFAULT '{}',
    ativo BOOLEAN DEFAULT true,
    stripe_price_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: CLÍNICAS
-- =============================================

CREATE TABLE clinicas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plano_id UUID NOT NULL REFERENCES planos(id),
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18),
    telefone VARCHAR(20),
    email VARCHAR(255),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    status status_clinica DEFAULT 'trial',
    trial_ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clinicas_plano ON clinicas(plano_id);
CREATE INDEX idx_clinicas_status ON clinicas(status);

-- =============================================
-- TABELA: USUÁRIOS
-- =============================================

CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE,
    auth_user_id UUID NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    perfil perfil_usuario DEFAULT 'recepcionista',
    telefone VARCHAR(20),
    especialidade VARCHAR(100),
    registro_profissional VARCHAR(50),
    avatar_url TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usuarios_clinica ON usuarios(clinica_id);
CREATE INDEX idx_usuarios_auth ON usuarios(auth_user_id);
CREATE INDEX idx_usuarios_perfil ON usuarios(perfil);

-- =============================================
-- TABELA: PACIENTES
-- =============================================

CREATE TABLE pacientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    cpf_encrypted TEXT,
    data_nascimento DATE,
    sexo sexo_paciente,
    telefone VARCHAR(20),
    email VARCHAR(255),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pacientes_clinica ON pacientes(clinica_id);
CREATE INDEX idx_pacientes_nome ON pacientes(nome);

-- =============================================
-- TABELA: ATENDIMENTOS
-- =============================================

CREATE TABLE atendimentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    profissional_id UUID NOT NULL REFERENCES usuarios(id),
    data_hora TIMESTAMPTZ NOT NULL,
    duracao_minutos INTEGER DEFAULT 30,
    tipo VARCHAR(100) NOT NULL,
    descricao TEXT,
    observacoes TEXT,
    status status_atendimento DEFAULT 'agendado',
    valor DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_atendimentos_clinica ON atendimentos(clinica_id);
CREATE INDEX idx_atendimentos_paciente ON atendimentos(paciente_id);
CREATE INDEX idx_atendimentos_profissional ON atendimentos(profissional_id);
CREATE INDEX idx_atendimentos_data ON atendimentos(data_hora);
CREATE INDEX idx_atendimentos_status ON atendimentos(status);

-- =============================================
-- TABELA: DOCUMENTOS
-- =============================================

CREATE TABLE documentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50) NOT NULL,
    storage_path TEXT NOT NULL,
    tamanho_bytes BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documentos_clinica ON documentos(clinica_id);
CREATE INDEX idx_documentos_paciente ON documentos(paciente_id);

-- =============================================
-- TABELA: AUDITORIA
-- =============================================

CREATE TABLE auditoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id UUID REFERENCES clinicas(id) ON DELETE SET NULL,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    acao acao_auditoria NOT NULL,
    tabela VARCHAR(100) NOT NULL,
    registro_id UUID NOT NULL,
    dados_anteriores JSONB,
    dados_novos JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_auditoria_clinica ON auditoria(clinica_id);
CREATE INDEX idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX idx_auditoria_tabela ON auditoria(tabela);
CREATE INDEX idx_auditoria_created ON auditoria(created_at);

-- =============================================
-- TABELA: USO DE RECURSOS
-- =============================================

CREATE TABLE uso_recursos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
    mes_referencia DATE NOT NULL,
    total_usuarios INTEGER DEFAULT 0,
    total_pacientes INTEGER DEFAULT 0,
    total_atendimentos INTEGER DEFAULT 0,
    total_documentos INTEGER DEFAULT 0,
    storage_usado_bytes BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(clinica_id, mes_referencia)
);

CREATE INDEX idx_uso_recursos_clinica ON uso_recursos(clinica_id);

-- =============================================
-- FUNÇÕES AUXILIARES PARA RLS
-- =============================================

-- Função para obter o clinica_id do usuário autenticado
CREATE OR REPLACE FUNCTION get_user_clinica_id()
RETURNS UUID AS $$
DECLARE
    clinica UUID;
BEGIN
    SELECT clinica_id INTO clinica
    FROM usuarios
    WHERE auth_user_id = auth.uid();
    
    RETURN clinica;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter o perfil do usuário autenticado
CREATE OR REPLACE FUNCTION get_user_perfil()
RETURNS perfil_usuario AS $$
DECLARE
    user_perfil perfil_usuario;
BEGIN
    SELECT perfil INTO user_perfil
    FROM usuarios
    WHERE auth_user_id = auth.uid();
    
    RETURN user_perfil;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se o usuário é master
CREATE OR REPLACE FUNCTION is_master()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (get_user_perfil() = 'master');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- =============================================

ALTER TABLE planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE atendimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE uso_recursos ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLÍTICAS RLS: PLANOS
-- =============================================

-- Planos são públicos para leitura (landing page)
CREATE POLICY "Planos são visíveis publicamente"
    ON planos FOR SELECT
    USING (ativo = true);

-- Apenas master pode gerenciar planos
CREATE POLICY "Master pode gerenciar planos"
    ON planos FOR ALL
    USING (is_master())
    WITH CHECK (is_master());

-- =============================================
-- POLÍTICAS RLS: CLÍNICAS
-- =============================================

-- Master vê todas as clínicas
CREATE POLICY "Master vê todas clínicas"
    ON clinicas FOR SELECT
    USING (is_master());

-- Usuários veem apenas sua clínica
CREATE POLICY "Usuários veem sua clínica"
    ON clinicas FOR SELECT
    USING (id = get_user_clinica_id());

-- Master pode criar clínicas
CREATE POLICY "Master pode criar clínicas"
    ON clinicas FOR INSERT
    WITH CHECK (is_master() OR auth.uid() IS NOT NULL);

-- Admin pode atualizar sua clínica
CREATE POLICY "Admin pode atualizar sua clínica"
    ON clinicas FOR UPDATE
    USING (id = get_user_clinica_id() AND get_user_perfil() IN ('admin', 'master'))
    WITH CHECK (id = get_user_clinica_id() AND get_user_perfil() IN ('admin', 'master'));

-- Master pode atualizar qualquer clínica
CREATE POLICY "Master pode atualizar clínicas"
    ON clinicas FOR UPDATE
    USING (is_master())
    WITH CHECK (is_master());

-- =============================================
-- POLÍTICAS RLS: USUÁRIOS
-- =============================================

-- Master vê todos os usuários
CREATE POLICY "Master vê todos usuários"
    ON usuarios FOR SELECT
    USING (is_master());

-- Usuários da mesma clínica podem se ver
CREATE POLICY "Usuários da clínica podem se ver"
    ON usuarios FOR SELECT
    USING (clinica_id = get_user_clinica_id() OR auth_user_id = auth.uid());

-- Admin pode gerenciar usuários da clínica
CREATE POLICY "Admin pode criar usuários"
    ON usuarios FOR INSERT
    WITH CHECK (
        is_master() OR 
        (get_user_perfil() = 'admin' AND clinica_id = get_user_clinica_id()) OR
        auth_user_id = auth.uid()
    );

CREATE POLICY "Admin pode atualizar usuários"
    ON usuarios FOR UPDATE
    USING (
        is_master() OR 
        (get_user_perfil() = 'admin' AND clinica_id = get_user_clinica_id()) OR
        auth_user_id = auth.uid()
    )
    WITH CHECK (
        is_master() OR 
        (get_user_perfil() = 'admin' AND clinica_id = get_user_clinica_id()) OR
        auth_user_id = auth.uid()
    );

-- =============================================
-- POLÍTICAS RLS: PACIENTES
-- =============================================

-- Usuários só veem pacientes da sua clínica
CREATE POLICY "Usuários veem pacientes da clínica"
    ON pacientes FOR SELECT
    USING (clinica_id = get_user_clinica_id() OR is_master());

-- Usuários podem criar pacientes na sua clínica
CREATE POLICY "Usuários podem criar pacientes"
    ON pacientes FOR INSERT
    WITH CHECK (clinica_id = get_user_clinica_id());

-- Usuários podem atualizar pacientes da sua clínica
CREATE POLICY "Usuários podem atualizar pacientes"
    ON pacientes FOR UPDATE
    USING (clinica_id = get_user_clinica_id())
    WITH CHECK (clinica_id = get_user_clinica_id());

-- Admin pode deletar pacientes (soft delete recomendado)
CREATE POLICY "Admin pode deletar pacientes"
    ON pacientes FOR DELETE
    USING (clinica_id = get_user_clinica_id() AND get_user_perfil() IN ('admin', 'master'));

-- =============================================
-- POLÍTICAS RLS: ATENDIMENTOS
-- =============================================

-- Usuários veem atendimentos da sua clínica
CREATE POLICY "Usuários veem atendimentos da clínica"
    ON atendimentos FOR SELECT
    USING (clinica_id = get_user_clinica_id() OR is_master());

-- Usuários podem criar atendimentos
CREATE POLICY "Usuários podem criar atendimentos"
    ON atendimentos FOR INSERT
    WITH CHECK (clinica_id = get_user_clinica_id());

-- Usuários podem atualizar atendimentos da sua clínica
CREATE POLICY "Usuários podem atualizar atendimentos"
    ON atendimentos FOR UPDATE
    USING (clinica_id = get_user_clinica_id())
    WITH CHECK (clinica_id = get_user_clinica_id());

-- =============================================
-- POLÍTICAS RLS: DOCUMENTOS
-- =============================================

-- Usuários veem documentos da sua clínica
CREATE POLICY "Usuários veem documentos da clínica"
    ON documentos FOR SELECT
    USING (clinica_id = get_user_clinica_id() OR is_master());

-- Usuários podem criar documentos
CREATE POLICY "Usuários podem criar documentos"
    ON documentos FOR INSERT
    WITH CHECK (clinica_id = get_user_clinica_id());

-- Documentos não podem ser atualizados (imutáveis)
-- Admin pode deletar documentos
CREATE POLICY "Admin pode deletar documentos"
    ON documentos FOR DELETE
    USING (clinica_id = get_user_clinica_id() AND get_user_perfil() IN ('admin', 'master'));

-- =============================================
-- POLÍTICAS RLS: AUDITORIA
-- =============================================

-- Apenas admin e master podem ver auditoria
CREATE POLICY "Admin vê auditoria da clínica"
    ON auditoria FOR SELECT
    USING (
        is_master() OR 
        (clinica_id = get_user_clinica_id() AND get_user_perfil() = 'admin')
    );

-- Sistema pode inserir auditoria
CREATE POLICY "Sistema pode inserir auditoria"
    ON auditoria FOR INSERT
    WITH CHECK (true);

-- =============================================
-- POLÍTICAS RLS: USO DE RECURSOS
-- =============================================

-- Admin pode ver uso de recursos
CREATE POLICY "Admin vê uso de recursos"
    ON uso_recursos FOR SELECT
    USING (clinica_id = get_user_clinica_id() OR is_master());

-- =============================================
-- TRIGGERS PARA UPDATED_AT
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_planos_updated_at
    BEFORE UPDATE ON planos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinicas_updated_at
    BEFORE UPDATE ON clinicas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pacientes_updated_at
    BEFORE UPDATE ON pacientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_atendimentos_updated_at
    BEFORE UPDATE ON atendimentos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_uso_recursos_updated_at
    BEFORE UPDATE ON uso_recursos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- DADOS INICIAIS: PLANOS
-- =============================================

INSERT INTO planos (nome, descricao, preco_mensal, limite_usuarios, limite_pacientes, recursos) VALUES
('Starter', 'Ideal para clínicas pequenas', 97.00, 3, 500, '{"relatorios_basicos": true, "suporte_email": true}'),
('Professional', 'Para clínicas em crescimento', 197.00, 10, 2000, '{"relatorios_basicos": true, "relatorios_avancados": true, "suporte_prioritario": true, "api_integracao": true}'),
('Enterprise', 'Para grandes operações', 397.00, -1, -1, '{"relatorios_basicos": true, "relatorios_avancados": true, "relatorios_customizados": true, "suporte_24_7": true, "api_completa": true, "sla_garantido": true}');

-- =============================================
-- FUNÇÃO PARA CRIAÇÃO DE USUÁRIO MASTER INICIAL
-- (Executar manualmente após criar o primeiro usuário no Auth)
-- =============================================

-- Para criar o master, execute:
-- INSERT INTO usuarios (auth_user_id, email, nome, perfil)
-- VALUES ('uuid-do-auth-user', 'admin@clinicops.com', 'Administrador Master', 'master');
