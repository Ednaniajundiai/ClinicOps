import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  Users, 
  Calendar, 
  Shield, 
  BarChart3, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">ClinicOps</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-muted-foreground hover:text-foreground">
              Funcionalidades
            </Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-foreground">
              Preços
            </Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground">
              Entrar
            </Link>
            <Button asChild>
              <Link href="/register">Começar Grátis</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Gestão Inteligente para
            <span className="text-primary"> Clínicas Médicas</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Simplifique a administração da sua clínica com nossa plataforma completa. 
            Pacientes, atendimentos, documentos e muito mais em um só lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/register">
                Começar Gratuitamente
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Conhecer Funcionalidades</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Tudo que sua clínica precisa
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Users className="h-10 w-10" />}
              title="Gestão de Pacientes"
              description="Cadastro completo, histórico de atendimentos e documentos organizados."
            />
            <FeatureCard 
              icon={<Calendar className="h-10 w-10" />}
              title="Atendimentos"
              description="Registre consultas, procedimentos e acompanhe toda a jornada do paciente."
            />
            <FeatureCard 
              icon={<Shield className="h-10 w-10" />}
              title="Segurança LGPD"
              description="Dados criptografados, auditoria completa e conformidade com a legislação."
            />
            <FeatureCard 
              icon={<Building2 className="h-10 w-10" />}
              title="Multi-Clínicas"
              description="Gerencie múltiplas unidades com isolamento total de dados."
            />
            <FeatureCard 
              icon={<BarChart3 className="h-10 w-10" />}
              title="Relatórios"
              description="Métricas e indicadores para tomada de decisões estratégicas."
            />
            <FeatureCard 
              icon={<CheckCircle2 className="h-10 w-10" />}
              title="Fácil de Usar"
              description="Interface intuitiva que sua equipe aprende em minutos."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Planos para cada necessidade
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Escolha o plano ideal para o tamanho da sua clínica. Todos incluem suporte e atualizações.
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard 
              name="Starter"
              price="R$ 97"
              description="Ideal para clínicas pequenas"
              features={[
                "Até 3 usuários",
                "500 pacientes",
                "Suporte por email",
                "Relatórios básicos"
              ]}
            />
            <PricingCard 
              name="Professional"
              price="R$ 197"
              description="Para clínicas em crescimento"
              features={[
                "Até 10 usuários",
                "2.000 pacientes",
                "Suporte prioritário",
                "Relatórios avançados",
                "API de integração"
              ]}
              highlighted
            />
            <PricingCard 
              name="Enterprise"
              price="R$ 397"
              description="Para grandes operações"
              features={[
                "Usuários ilimitados",
                "Pacientes ilimitados",
                "Suporte 24/7",
                "Relatórios customizados",
                "API completa",
                "SLA garantido"
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para transformar sua clínica?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de clínicas que já utilizam o ClinicOps para otimizar suas operações.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/register">
              Criar Conta Gratuita
              <ArrowRight className="ml-2 h-4 w-4" />
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
              © 2024 ClinicOps. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode
  title: string
  description: string 
}) {
  return (
    <div className="bg-background p-6 rounded-lg border">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function PricingCard({ 
  name, 
  price, 
  description, 
  features,
  highlighted = false
}: { 
  name: string
  price: string
  description: string
  features: string[]
  highlighted?: boolean
}) {
  return (
    <div className={`p-6 rounded-lg border ${highlighted ? 'border-primary ring-2 ring-primary' : ''}`}>
      {highlighted && (
        <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
          Mais Popular
        </span>
      )}
      <h3 className="text-xl font-semibold mt-4">{name}</h3>
      <p className="text-muted-foreground text-sm mb-4">{description}</p>
      <div className="mb-6">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-muted-foreground">/mês</span>
      </div>
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      <Button className="w-full" variant={highlighted ? 'default' : 'outline'} asChild>
        <Link href="/register">Começar Agora</Link>
      </Button>
    </div>
  )
}
