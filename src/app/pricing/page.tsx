'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  CheckCircle2,
  X,
  ArrowRight,
  HelpCircle
} from 'lucide-react'

/**
 * Definicao dos planos disponiveis
 */
const PLANS = [
  {
    key: 'starter',
    name: 'Starter',
    description: 'Ideal para clinicas pequenas que estao comecando',
    price: 97,
    priceYearly: 970, // ~17% desconto
    features: {
      usuarios: '3',
      pacientes: '500',
      atendimentos: 'Ilimitados',
      documentos: '1 GB',
      relatorios: 'Basicos',
      suporte: 'Email',
      api: false,
      multiClinica: false,
      auditoria: 'Basica',
      exportacao: 'CSV',
      backup: 'Diario',
      sla: false,
    },
  },
  {
    key: 'professional',
    name: 'Professional',
    description: 'Para clinicas em crescimento que precisam de mais recursos',
    price: 197,
    priceYearly: 1970, // ~17% desconto
    highlighted: true,
    features: {
      usuarios: '10',
      pacientes: '2.000',
      atendimentos: 'Ilimitados',
      documentos: '10 GB',
      relatorios: 'Avancados',
      suporte: 'Prioritario',
      api: true,
      multiClinica: false,
      auditoria: 'Completa',
      exportacao: 'CSV, PDF, Excel',
      backup: 'Diario',
      sla: false,
    },
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    description: 'Para grandes operacoes com necessidades especificas',
    price: 397,
    priceYearly: 3970, // ~17% desconto
    features: {
      usuarios: 'Ilimitados',
      pacientes: 'Ilimitados',
      atendimentos: 'Ilimitados',
      documentos: '100 GB',
      relatorios: 'Customizados',
      suporte: '24/7',
      api: true,
      multiClinica: true,
      auditoria: 'Completa + Exportacao',
      exportacao: 'Todos os formatos',
      backup: 'Tempo real',
      sla: true,
    },
  },
]

/**
 * Linhas da tabela comparativa
 */
const COMPARISON_ROWS = [
  { key: 'usuarios', label: 'Usuarios', tooltip: 'Numero de contas de usuario' },
  { key: 'pacientes', label: 'Pacientes', tooltip: 'Limite de cadastros de pacientes' },
  { key: 'atendimentos', label: 'Atendimentos', tooltip: 'Registros de consultas e procedimentos' },
  { key: 'documentos', label: 'Armazenamento', tooltip: 'Espaco para documentos e arquivos' },
  { key: 'relatorios', label: 'Relatorios', tooltip: 'Tipos de relatorios disponiveis' },
  { key: 'suporte', label: 'Suporte', tooltip: 'Canais de atendimento' },
  { key: 'api', label: 'API de Integracao', tooltip: 'Acesso programatico ao sistema' },
  { key: 'multiClinica', label: 'Multi-Clinica', tooltip: 'Gerenciar varias unidades' },
  { key: 'auditoria', label: 'Auditoria', tooltip: 'Rastreamento de acoes' },
  { key: 'exportacao', label: 'Exportacao', tooltip: 'Formatos de exportacao de dados' },
  { key: 'backup', label: 'Backup', tooltip: 'Frequencia de backup dos dados' },
  { key: 'sla', label: 'SLA Garantido', tooltip: 'Acordo de nivel de servico' },
]

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">ClinicOps</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Funcionalidades
            </Link>
            <Link href="/#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
              Depoimentos
            </Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
              Entrar
            </Link>
            <Button asChild>
              <Link href="/register">Comecar Gratis</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Planos e Precos
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Escolha o plano ideal para sua clinica. Todos incluem 14 dias de teste gratuito.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm ${!isYearly ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Mensal
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isYearly ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isYearly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${isYearly ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Anual
              <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                -17%
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-8 -mt-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {PLANS.map((plan) => (
              <PricingCard 
                key={plan.key}
                plan={plan}
                isYearly={isYearly}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Comparativo Detalhado
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full max-w-5xl mx-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-medium">Recurso</th>
                  {PLANS.map((plan) => (
                    <th key={plan.key} className={`text-center py-4 px-4 font-medium ${plan.highlighted ? 'text-primary' : ''}`}>
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.key} className="border-b">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2" title={row.tooltip}>
                        <span>{row.label}</span>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </td>
                    {PLANS.map((plan) => {
                      const value = plan.features[row.key as keyof typeof plan.features]
                      return (
                        <td key={plan.key} className="text-center py-4 px-4">
                          {typeof value === 'boolean' ? (
                            value ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground mx-auto" />
                            )
                          ) : (
                            <span className={plan.highlighted ? 'font-medium' : ''}>{value}</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Perguntas Frequentes
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <FaqItem 
              question="Posso trocar de plano a qualquer momento?"
              answer="Sim! Voce pode fazer upgrade ou downgrade do seu plano a qualquer momento. O valor sera ajustado proporcionalmente no proximo ciclo de cobranca."
            />
            <FaqItem 
              question="Como funciona o periodo de teste?"
              answer="Todos os planos incluem 14 dias de teste gratuito com acesso completo a todas as funcionalidades. Nao pedimos cartao de credito para comecar."
            />
            <FaqItem 
              question="Meus dados estao seguros?"
              answer="Absolutamente. Utilizamos criptografia de ponta, Row Level Security para isolamento de dados, e seguimos todas as diretrizes da LGPD. Seus dados sao seus."
            />
            <FaqItem 
              question="Como funciona o suporte?"
              answer="O plano Starter tem suporte por email. O Professional tem suporte prioritario com resposta em ate 4 horas. O Enterprise tem suporte 24/7 com linha direta."
            />
            <FaqItem 
              question="Posso cancelar a qualquer momento?"
              answer="Sim, voce pode cancelar sua assinatura a qualquer momento sem multas ou taxas. Voce tera acesso ate o final do periodo ja pago."
            />
            <FaqItem 
              question="Existe desconto para pagamento anual?"
              answer="Sim! Ao optar pelo pagamento anual, voce economiza aproximadamente 17% em relacao ao pagamento mensal."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Comece sua transformacao digital hoje
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            14 dias gratis, sem necessidade de cartao de credito.
          </p>
          <Button size="lg" variant="secondary" asChild className="text-lg px-8">
            <Link href="/register">
              Comecar Gratuitamente
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="font-bold">ClinicOps</span>
            </div>
            <p className="text-sm text-muted-foreground">
              2024 ClinicOps. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

interface PricingCardProps {
  plan: typeof PLANS[0]
  isYearly: boolean
}

function PricingCard({ plan, isYearly }: PricingCardProps) {
  const price = isYearly ? plan.priceYearly : plan.price
  const period = isYearly ? 'ano' : 'mes'

  return (
    <div className={`p-8 rounded-2xl border bg-background ${plan.highlighted ? 'border-primary ring-2 ring-primary relative' : ''}`}>
      {plan.highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-primary-foreground text-sm font-medium px-4 py-1 rounded-full">
            Mais Popular
          </span>
        </div>
      )}
      
      <h3 className="text-2xl font-bold">{plan.name}</h3>
      <p className="text-muted-foreground text-sm mt-2 mb-6">{plan.description}</p>
      
      <div className="mb-6">
        <span className="text-5xl font-bold">R$ {price}</span>
        <span className="text-muted-foreground">/{period}</span>
        {isYearly && (
          <div className="text-sm text-green-600 mt-1">
            Economia de R$ {(plan.price * 12 - plan.priceYearly).toFixed(0)}/ano
          </div>
        )}
      </div>

      <Button 
        className="w-full mb-6" 
        variant={plan.highlighted ? 'default' : 'outline'} 
        size="lg"
        asChild
      >
        <Link href={`/register?plan=${plan.key}`}>
          Comecar Agora
        </Link>
      </Button>

      <ul className="space-y-3">
        <FeatureItem text={`${plan.features.usuarios} usuarios`} />
        <FeatureItem text={`${plan.features.pacientes} pacientes`} />
        <FeatureItem text={`${plan.features.documentos} de armazenamento`} />
        <FeatureItem text={`Relatorios ${plan.features.relatorios.toLowerCase()}`} />
        <FeatureItem text={`Suporte ${plan.features.suporte.toLowerCase()}`} />
        {plan.features.api && <FeatureItem text="API de integracao" />}
        {plan.features.multiClinica && <FeatureItem text="Multi-clinica" />}
        {plan.features.sla && <FeatureItem text="SLA garantido" />}
      </ul>
    </div>
  )
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2">
      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
      <span className="text-sm">{text}</span>
    </li>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border rounded-lg">
      <button
        className="w-full flex items-center justify-between p-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium">{question}</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 text-muted-foreground">
          {answer}
        </div>
      )}
    </div>
  )
}
