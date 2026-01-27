# ClinicOps - Plataforma SaaS para Gestão de Clínicas

Sistema de gestão multi-tenant para clínicas médicas, desenvolvido com Next.js 14, Supabase e React Native.

## Stack Tecnológico

- **Frontend Web**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Mobile**: React Native + Expo (em desenvolvimento)
- **Pagamentos**: Stripe
- **Email**: Brevo (SendinBlue)

## Funcionalidades

- Multi-tenancy com Row Level Security (RLS)
- Três perfis de usuário: Master, Admin, Operacional
- Gestão de pacientes e atendimentos
- Upload de documentos
- Sistema de auditoria (LGPD)
- Integração com Stripe para assinaturas

## Requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase
- Conta no Stripe (para pagamentos)

## Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd clinicops
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o script SQL em `supabase/migrations/001_initial_schema.sql` no SQL Editor
3. Copie as credenciais do projeto

### 4. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

### 5. Execute o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Estrutura do Projeto

```
clinicops/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # Rotas protegidas dos dashboards
│   │   │   ├── master/         # Dashboard do admin da plataforma
│   │   │   ├── admin/          # Dashboard do admin da clínica
│   │   │   └── app/            # Dashboard do usuário operacional
│   │   ├── login/              # Página de login
│   │   ├── register/           # Página de registro
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── ui/                 # Componentes shadcn/ui
│   │   └── layouts/            # Layouts compartilhados
│   ├── hooks/                  # Custom hooks
│   │   ├── use-auth.ts         # Hook de autenticação
│   │   └── use-clinica.ts      # Hook de contexto da clínica
│   └── lib/
│       ├── supabase/           # Configuração do Supabase
│       │   ├── client.ts       # Cliente para componentes client
│       │   ├── server.ts       # Cliente para Server Components
│       │   └── database.types.ts # Tipos do banco de dados
│       └── utils.ts            # Utilitários
├── supabase/
│   └── migrations/             # Scripts SQL
└── middleware.ts               # Middleware de autenticação
```

## Criando o Usuário Master

Após criar o primeiro usuário via interface:

1. Acesse o Supabase Dashboard
2. Vá em Authentication > Users
3. Copie o `id` do usuário
4. Execute no SQL Editor:

```sql
INSERT INTO usuarios (auth_user_id, email, nome, perfil)
VALUES ('uuid-do-auth-user', 'seu@email.com', 'Seu Nome', 'master');
```

## Perfis de Usuário

| Perfil | Acesso | Descrição |
|--------|--------|-----------|
| Master | `/master` | Administrador da plataforma, vê todas as clínicas |
| Admin | `/admin` | Administrador da clínica, gerencia equipe e configurações |
| Profissional | `/app` | Profissional de saúde, registra atendimentos |
| Recepcionista | `/app` | Recepção, cadastra pacientes e agenda |

## Row Level Security (RLS)

Todas as tabelas possuem políticas RLS que garantem:

- **Isolamento de dados**: Cada clínica só vê seus próprios dados
- **Controle de acesso**: Cada perfil tem permissões específicas
- **Auditoria**: Todas as operações são registradas

## Próximos Passos

- [ ] Implementar CRUD completo de pacientes
- [ ] Implementar CRUD de atendimentos
- [ ] Integrar Stripe para pagamentos
- [ ] Implementar sistema de auditoria
- [ ] Desenvolver app mobile com Expo
- [ ] Deploy na Vercel

## Licença

Projeto desenvolvido para fins de avaliação técnica.
