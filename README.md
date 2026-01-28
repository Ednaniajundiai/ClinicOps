# ClinicOps - Plataforma SaaS para Gestão de Clínicas

> Case Técnico para Vaga de Desenvolvedor Full-Stack

![ClinicOps Hero](https://via.placeholder.com/1200x600/09090b/F97316?text=ClinicOps+Dashboard)

O **ClinicOps** é uma plataforma SaaS multi-tenant desenvolvida para modernizar a gestão de clínicas médicas. Focada em segurança, performance e experiência do usuário, a aplicação oferece segregação total de dados e conformidade com a LGPD.

## 🚀 Stack Tecnológica

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui.
- **Backend/BaaS:** Supabase (Auth, Database, Storage, Edge Functions).
- **Segurança:** Row Level Security (RLS) avançado, Criptografia de dados sensíveis (AES-256 via pgcrypto).
- **Pagamentos:** Stripe (Assinaturas, Portal do Cliente, Webhooks).
- **Email:** Integração transacional (Brevo/Resend).

## 🛡️ Destaques de Segurança & Arquitetura

1.  **Multi-tenancy Nativo:**
    - Segregação lógica de dados via `clinica_id`.
    - Políticas RLS (Row Level Security) garantem que usuários acessem *apenas* dados de sua própria clínica, direto na camada do banco de dados.

2.  **Proteção LGPD:**
    - Dados sensíveis (como CPF) são criptografados em repouso usando `pgcrypto` no PostgreSQL.
    - Auditoria imutável: Todas as ações críticas (INSERT, UPDATE, DELETE) são logadas na tabela `auditoria`.

3.  **Performance:**
    - Frontend otimizado com Server Components.
    - Estilização minimalista e leve com Tailwind CSS.

## 🛠️ Configuração do Projeto

### Pré-requisitos
- Node.js 18+
- Conta no Supabase
- Conta no Stripe

### 1. Clonar e Instalar
```bash
git clone https://github.com/seu-usuario/clinicops.git
cd clinicops
npm install
```

### 2. Configurar Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env.local` e preencha as chaves:

```bash
cp .env.example .env.local
```

### 3. Configurar Banco de Dados (Supabase)
Execute o script de migração localizado em `supabase/migrations/001_initial_schema.sql` no SQL Editor do seu projeto Supabase.

> **Importante:** Configure a chave de criptografia no banco antes de usar:
> ```sql
> ALTER DATABASE postgres SET app.encryption_key = 'sua-chave-secreta-aqui';
> ```

### 4. Rodar Localmente
```bash
npm run dev
```
Acesse `http://localhost:3000`.

## 📂 Estrutura do Projeto

```
src/
├── app/
│   ├── (dashboard)/      # Rotas protegidas (Admin/App)
│   ├── api/              # Rotas de API (Stripe, Webhooks)
│   └── page.tsx          # Landing Page (Pública)
├── components/           # Componentes UI (shadcn)
├── lib/                  # Utilitários e configurações (Stripe, Email)
└── supabase/             # Migrations e Types
```

## ✅ Checklist de Entrega (Case Técnico)

- [x] Landing Page e Página de Pricing
- [x] Autenticação (Login, Cadastro, Recuperação)
- [x] Dashboard Master (Gestão de Planos)
- [x] Dashboard da Clínica (Pacientes, Atendimentos)
- [x] Multi-tenancy com RLS
- [x] Tabela de Auditoria
- [x] Integração Stripe

---
Desenvolvido por Ednan Ferreira da Silva