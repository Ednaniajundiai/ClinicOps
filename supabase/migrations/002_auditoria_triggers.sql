-- =============================================
-- CLINICOPS - Sistema de Auditoria e Compliance LGPD
-- Migration 002 - Triggers de Auditoria Automatica
-- =============================================

-- =============================================
-- FUNCAO: REGISTRAR AUDITORIA
-- Funcao generica para log automatico de alteracoes
-- =============================================

CREATE OR REPLACE FUNCTION registrar_auditoria()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario_id UUID;
    v_clinica_id UUID;
    v_dados_anteriores JSONB;
    v_dados_novos JSONB;
    v_acao acao_auditoria;
BEGIN
    -- Obter ID do usuario atual
    SELECT id INTO v_usuario_id
    FROM usuarios
    WHERE auth_user_id = auth.uid();

    -- Determinar a acao
    v_acao := TG_OP::acao_auditoria;

    -- Determinar clinica_id e dados baseado na operacao
    IF TG_OP = 'INSERT' THEN
        v_dados_novos := to_jsonb(NEW);
        v_dados_anteriores := NULL;
        -- Tentar obter clinica_id do registro novo
        IF TG_TABLE_NAME IN ('clinicas') THEN
            v_clinica_id := NEW.id;
        ELSE
            v_clinica_id := NEW.clinica_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        v_dados_anteriores := to_jsonb(OLD);
        v_dados_novos := to_jsonb(NEW);
        IF TG_TABLE_NAME IN ('clinicas') THEN
            v_clinica_id := NEW.id;
        ELSE
            v_clinica_id := NEW.clinica_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        v_dados_anteriores := to_jsonb(OLD);
        v_dados_novos := NULL;
        IF TG_TABLE_NAME IN ('clinicas') THEN
            v_clinica_id := OLD.id;
        ELSE
            v_clinica_id := OLD.clinica_id;
        END IF;
    END IF;

    -- Remover campos sensiveis dos logs
    IF v_dados_anteriores IS NOT NULL THEN
        v_dados_anteriores := v_dados_anteriores - ARRAY['cpf_encrypted', 'stripe_customer_id'];
    END IF;
    IF v_dados_novos IS NOT NULL THEN
        v_dados_novos := v_dados_novos - ARRAY['cpf_encrypted', 'stripe_customer_id'];
    END IF;

    -- Inserir registro de auditoria
    INSERT INTO auditoria (
        clinica_id,
        usuario_id,
        acao,
        tabela,
        registro_id,
        dados_anteriores,
        dados_novos,
        created_at
    ) VALUES (
        v_clinica_id,
        v_usuario_id,
        v_acao,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        v_dados_anteriores,
        v_dados_novos,
        NOW()
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- TRIGGERS DE AUDITORIA NAS TABELAS PRINCIPAIS
-- =============================================

-- Trigger para pacientes
DROP TRIGGER IF EXISTS audit_pacientes ON pacientes;
CREATE TRIGGER audit_pacientes
    AFTER INSERT OR UPDATE OR DELETE ON pacientes
    FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- Trigger para atendimentos
DROP TRIGGER IF EXISTS audit_atendimentos ON atendimentos;
CREATE TRIGGER audit_atendimentos
    AFTER INSERT OR UPDATE OR DELETE ON atendimentos
    FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- Trigger para documentos
DROP TRIGGER IF EXISTS audit_documentos ON documentos;
CREATE TRIGGER audit_documentos
    AFTER INSERT OR UPDATE OR DELETE ON documentos
    FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- Trigger para usuarios
DROP TRIGGER IF EXISTS audit_usuarios ON usuarios;
CREATE TRIGGER audit_usuarios
    AFTER INSERT OR UPDATE OR DELETE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- Trigger para clinicas
DROP TRIGGER IF EXISTS audit_clinicas ON clinicas;
CREATE TRIGGER audit_clinicas
    AFTER INSERT OR UPDATE OR DELETE ON clinicas
    FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- =============================================
-- FUNCOES DE CRIPTOGRAFIA PARA CPF (LGPD)
-- =============================================

-- Chave de criptografia deve ser definida como variavel de ambiente
-- No Supabase, usar: ALTER DATABASE postgres SET app.encryption_key = 'sua-chave-segura';

-- Funcao para criptografar CPF
CREATE OR REPLACE FUNCTION criptografar_cpf(p_cpf TEXT)
RETURNS TEXT AS $$
DECLARE
    v_key TEXT;
BEGIN
    -- Obter chave de criptografia
    v_key := current_setting('app.encryption_key', true);
    IF v_key IS NULL OR v_key = '' THEN
        v_key := 'clinicops-default-key-change-in-production';
    END IF;
    
    -- Limpar CPF (remover pontuacao)
    p_cpf := regexp_replace(p_cpf, '[^0-9]', '', 'g');
    
    IF p_cpf IS NULL OR p_cpf = '' THEN
        RETURN NULL;
    END IF;
    
    -- Criptografar usando pgcrypto
    RETURN encode(
        pgp_sym_encrypt(p_cpf, v_key),
        'base64'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funcao para descriptografar CPF
CREATE OR REPLACE FUNCTION descriptografar_cpf(p_cpf_encrypted TEXT)
RETURNS TEXT AS $$
DECLARE
    v_key TEXT;
    v_cpf TEXT;
BEGIN
    IF p_cpf_encrypted IS NULL OR p_cpf_encrypted = '' THEN
        RETURN NULL;
    END IF;
    
    -- Obter chave de criptografia
    v_key := current_setting('app.encryption_key', true);
    IF v_key IS NULL OR v_key = '' THEN
        v_key := 'clinicops-default-key-change-in-production';
    END IF;
    
    -- Descriptografar
    v_cpf := pgp_sym_decrypt(
        decode(p_cpf_encrypted, 'base64'),
        v_key
    );
    
    -- Formatar CPF
    IF LENGTH(v_cpf) = 11 THEN
        RETURN SUBSTRING(v_cpf, 1, 3) || '.' || 
               SUBSTRING(v_cpf, 4, 3) || '.' || 
               SUBSTRING(v_cpf, 7, 3) || '-' || 
               SUBSTRING(v_cpf, 10, 2);
    END IF;
    
    RETURN v_cpf;
EXCEPTION
    WHEN OTHERS THEN
        RETURN '***.***.***-**';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funcao para obter CPF mascarado (para exibicao)
CREATE OR REPLACE FUNCTION cpf_mascarado(p_cpf_encrypted TEXT)
RETURNS TEXT AS $$
DECLARE
    v_cpf TEXT;
BEGIN
    v_cpf := descriptografar_cpf(p_cpf_encrypted);
    IF v_cpf IS NULL THEN
        RETURN NULL;
    END IF;
    -- Retorna apenas ultimos 4 digitos
    RETURN '***.***.***-' || SUBSTRING(v_cpf, LENGTH(v_cpf) - 1, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- TRIGGER PARA CRIPTOGRAFAR CPF AUTOMATICAMENTE
-- =============================================

CREATE OR REPLACE FUNCTION criptografar_cpf_automatico()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o CPF foi fornecido e nao parece estar criptografado
    IF NEW.cpf_encrypted IS NOT NULL 
       AND LENGTH(NEW.cpf_encrypted) <= 14 
       AND NEW.cpf_encrypted ~ '^[0-9.-]+$' THEN
        NEW.cpf_encrypted := criptografar_cpf(NEW.cpf_encrypted);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS encrypt_cpf_pacientes ON pacientes;
CREATE TRIGGER encrypt_cpf_pacientes
    BEFORE INSERT OR UPDATE ON pacientes
    FOR EACH ROW EXECUTE FUNCTION criptografar_cpf_automatico();

-- =============================================
-- VIEW PARA AUDITORIA COM INFORMACOES LEGIBLES
-- =============================================

CREATE OR REPLACE VIEW v_auditoria_detalhada AS
SELECT 
    a.id,
    a.clinica_id,
    c.nome AS clinica_nome,
    a.usuario_id,
    u.nome AS usuario_nome,
    u.email AS usuario_email,
    a.acao,
    a.tabela,
    a.registro_id,
    a.dados_anteriores,
    a.dados_novos,
    a.ip_address,
    a.user_agent,
    a.created_at,
    -- Resumo da alteracao
    CASE a.acao
        WHEN 'INSERT' THEN 'Criou registro em ' || a.tabela
        WHEN 'UPDATE' THEN 'Atualizou registro em ' || a.tabela
        WHEN 'DELETE' THEN 'Removeu registro de ' || a.tabela
    END AS descricao_acao
FROM auditoria a
LEFT JOIN clinicas c ON a.clinica_id = c.id
LEFT JOIN usuarios u ON a.usuario_id = u.id
ORDER BY a.created_at DESC;

-- =============================================
-- FUNCAO PARA EXPORTAR DADOS DO PACIENTE (LGPD)
-- =============================================

CREATE OR REPLACE FUNCTION exportar_dados_paciente(p_paciente_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_resultado JSONB;
    v_paciente JSONB;
    v_atendimentos JSONB;
    v_documentos JSONB;
BEGIN
    -- Verificar se usuario tem acesso ao paciente
    IF NOT EXISTS (
        SELECT 1 FROM pacientes 
        WHERE id = p_paciente_id 
        AND clinica_id = get_user_clinica_id()
    ) THEN
        RAISE EXCEPTION 'Acesso negado ao paciente';
    END IF;

    -- Dados do paciente
    SELECT jsonb_build_object(
        'nome', nome,
        'cpf', descriptografar_cpf(cpf_encrypted),
        'data_nascimento', data_nascimento,
        'sexo', sexo,
        'telefone', telefone,
        'email', email,
        'endereco', endereco,
        'cidade', cidade,
        'estado', estado,
        'cep', cep,
        'data_cadastro', created_at
    ) INTO v_paciente
    FROM pacientes
    WHERE id = p_paciente_id;

    -- Atendimentos do paciente
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'data_hora', data_hora,
            'tipo', tipo,
            'status', status,
            'descricao', descricao
        ) ORDER BY data_hora DESC
    ), '[]'::jsonb) INTO v_atendimentos
    FROM atendimentos
    WHERE paciente_id = p_paciente_id;

    -- Documentos do paciente
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'nome', nome,
            'tipo', tipo,
            'data_upload', created_at
        ) ORDER BY created_at DESC
    ), '[]'::jsonb) INTO v_documentos
    FROM documentos
    WHERE paciente_id = p_paciente_id;

    -- Montar resultado final
    v_resultado := jsonb_build_object(
        'dados_pessoais', v_paciente,
        'atendimentos', v_atendimentos,
        'documentos', v_documentos,
        'data_exportacao', NOW(),
        'versao_formato', '1.0'
    );

    RETURN v_resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- FUNCAO PARA ANONIMIZAR PACIENTE (LGPD - Direito ao Esquecimento)
-- =============================================

CREATE OR REPLACE FUNCTION anonimizar_paciente(p_paciente_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_clinica_id UUID;
BEGIN
    -- Verificar permissao (apenas admin)
    IF get_user_perfil() NOT IN ('admin', 'master') THEN
        RAISE EXCEPTION 'Apenas administradores podem anonimizar pacientes';
    END IF;

    -- Verificar se paciente pertence a clinica
    SELECT clinica_id INTO v_clinica_id
    FROM pacientes
    WHERE id = p_paciente_id;

    IF v_clinica_id IS NULL THEN
        RAISE EXCEPTION 'Paciente nao encontrado';
    END IF;

    IF v_clinica_id != get_user_clinica_id() AND NOT is_master() THEN
        RAISE EXCEPTION 'Acesso negado';
    END IF;

    -- Anonimizar dados pessoais
    UPDATE pacientes SET
        nome = 'Paciente Anonimizado',
        cpf_encrypted = NULL,
        telefone = NULL,
        email = NULL,
        endereco = NULL,
        cidade = NULL,
        estado = NULL,
        cep = NULL,
        observacoes = NULL,
        ativo = false,
        updated_at = NOW()
    WHERE id = p_paciente_id;

    -- Registrar na auditoria
    INSERT INTO auditoria (
        clinica_id,
        usuario_id,
        acao,
        tabela,
        registro_id,
        dados_anteriores,
        dados_novos,
        created_at
    ) VALUES (
        v_clinica_id,
        (SELECT id FROM usuarios WHERE auth_user_id = auth.uid()),
        'UPDATE',
        'pacientes',
        p_paciente_id,
        jsonb_build_object('acao', 'anonimizacao_lgpd'),
        jsonb_build_object('motivo', 'Direito ao esquecimento - LGPD'),
        NOW()
    );

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- INDICES ADICIONAIS PARA PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_auditoria_registro ON auditoria(registro_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_acao ON auditoria(acao);
CREATE INDEX IF NOT EXISTS idx_auditoria_data ON auditoria(created_at DESC);

-- =============================================
-- GRANTS PARA FUNCOES
-- =============================================

GRANT EXECUTE ON FUNCTION criptografar_cpf(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION descriptografar_cpf(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cpf_mascarado(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION exportar_dados_paciente(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION anonimizar_paciente(UUID) TO authenticated;
GRANT SELECT ON v_auditoria_detalhada TO authenticated;
