import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  Users, 
  Calendar, 
  Shield, 
  BarChart3, 
  CheckCircle2,
  ArrowRight,
  Star,
  Zap,
  Lock,
  Clock
} from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Header */}
      <header className="fixed top-0 w-full border-b border-white/5 bg-background/60 backdrop-blur-md z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">ClinicOps</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Funcionalidades
            </Link>
            <Link href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
              Depoimentos
            </Link>
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Preços
            </Link>
            <div className="flex items-center gap-4 ml-4">
              <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                Entrar
              </Link>
              <Button asChild size="sm" className="font-semibold">
                <Link href="/register">Começar Grátis</Link>
              </Button>
            </div>
          </nav>
          {/* Mobile menu button */}
          <Button variant="ghost" className="md:hidden" size="icon">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 relative overflow-hidden">
        {/* Grid Background Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-semibold mb-8 border border-primary/20">
            <Zap className="h-3 w-3" />
            Plataforma completa para gestão de clínicas
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent pb-2">
            Gestão Inteligente para<br />
            <span className="text-primary block mt-1">Clínicas Médicas</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Simplifique a administração da sua clínica com nossa plataforma completa. 
            Pacientes, atendimentos, documentos e muito mais em um só lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" asChild className="h-12 px-8 text-base font-semibold shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] transition-all duration-300">
              <Link href="/register">
                Começar Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base bg-transparent border-white/10 hover:bg-white/5">
              <Link href="#features">Conhecer Funcionalidades</Link>
            </Button>
          </div>
          
          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>14 dias grátis</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Cancele quando quiser</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/5">
            <div className="px-4">
              <div className="text-3xl md:text-5xl font-bold text-white tracking-tight">500+</div>
              <div className="text-sm font-medium text-muted-foreground mt-2">Clínicas Ativas</div>
            </div>
            <div className="px-4">
              <div className="text-3xl md:text-5xl font-bold text-white tracking-tight">50k+</div>
              <div className="text-sm font-medium text-muted-foreground mt-2">Pacientes</div>
            </div>
            <div className="px-4">
              <div className="text-3xl md:text-5xl font-bold text-white tracking-tight">99.9%</div>
              <div className="text-sm font-medium text-muted-foreground mt-2">Uptime</div>
            </div>
            <div className="px-4">
              <div className="text-3xl md:text-5xl font-bold text-white tracking-tight">4.9</div>
              <div className="text-sm font-medium text-muted-foreground mt-2">Avaliação</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Tudo que sua clínica precisa
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ferramentas poderosas para otimizar cada aspecto da gestão da sua clínica
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Users className="h-6 w-6" />}
              title="Gestão de Pacientes"
              description="Cadastro completo, histórico de atendimentos e documentos organizados em um só lugar."
            />
            <FeatureCard 
              icon={<Calendar className="h-6 w-6" />}
              title="Agenda Inteligente"
              description="Registre consultas, procedimentos e acompanhe toda a jornada do paciente."
            />
            <FeatureCard 
              icon={<Shield className="h-6 w-6" />}
              title="Segurança LGPD"
              description="Dados criptografados, auditoria completa e conformidade total com a legislação."
            />
            <FeatureCard 
              icon={<Building2 className="h-6 w-6" />}
              title="Multi-Clínicas"
              description="Gerencie múltiplas unidades com isolamento total de dados entre elas."
            />
            <FeatureCard 
              icon={<BarChart3 className="h-6 w-6" />}
              title="Relatórios Completos"
              description="Métricas e indicadores para tomada de decisões estratégicas do seu negócio."
            />
            <FeatureCard 
              icon={<Clock className="h-6 w-6" />}
              title="Economia de Tempo"
              description="Interface intuitiva que sua equipe aprende em minutos, sem treinamento extenso."
            />
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold mb-6">
                <Lock className="h-4 w-4" />
                Segurança em primeiro lugar
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                Seus dados protegidos com<br />tecnologia de ponta
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Utilizamos as melhores práticas de segurança do mercado para garantir que os dados 
                dos seus pacientes estejam sempre protegidos e em conformidade com a LGPD.
              </p>
              <ul className="space-y-4">
                <SecurityItem text="Criptografia AES-256 para dados sensíveis" />
                <SecurityItem text="Row Level Security (RLS) para isolamento" />
                <SecurityItem text="Autenticação de dois fatores disponível" />
                <SecurityItem text="Auditoria completa de todas as ações" />
                <SecurityItem text="Backups automáticos diários" />
              </ul>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/20 blur-3xl opacity-20 rounded-full" />
              <div className="relative bg-card/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background/50 border border-white/5 rounded-lg p-6 hover:border-primary/50 transition-colors">
                    <Shield className="h-8 w-8 text-primary mb-3" />
                    <div className="font-semibold mb-1">LGPD</div>
                    <div className="text-xs text-muted-foreground">Conformidade total</div>
                  </div>
                  <div className="bg-background/50 border border-white/5 rounded-lg p-6 hover:border-primary/50 transition-colors">
                    <Lock className="h-8 w-8 text-primary mb-3" />
                    <div className="font-semibold mb-1">SSL/TLS</div>
                    <div className="text-xs text-muted-foreground">Conexão segura</div>
                  </div>
                  <div className="bg-background/50 border border-white/5 rounded-lg p-6 hover:border-primary/50 transition-colors">
                    <Users className="h-8 w-8 text-primary mb-3" />
                    <div className="font-semibold mb-1">RLS</div>
                    <div className="text-xs text-muted-foreground">Isolamento total</div>
                  </div>
                  <div className="bg-background/50 border border-white/5 rounded-lg p-6 hover:border-primary/50 transition-colors">
                    <BarChart3 className="h-8 w-8 text-primary mb-3" />
                    <div className="font-semibold mb-1">Auditoria</div>
                    <div className="text-xs text-muted-foreground">Logs completos</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              O que nossos clientes dizem
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Veja como o ClinicOps está transformando a gestão de clínicas em todo o Brasil
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TestimonialCard 
              name="Dra. Maria Santos"
              role="Dermatologista"
              clinic="Clínica Derma Care"
              rating={5}
              text="O ClinicOps revolucionou a forma como gerenciamos nossa clínica. A interface é intuitiva e o suporte é excepcional. Recomendo para todos os colegas."
            />
            <TestimonialCard 
              name="Dr. Carlos Oliveira"
              role="Cardiologista"
              clinic="Instituto do Coração"
              rating={5}
              text="Finalmente encontrei uma solução que atende todas as nossas necessidades. A segurança dos dados e a facilidade de uso são impressionantes."
            />
            <TestimonialCard 
              name="Dra. Ana Paula Costa"
              role="Pediatra"
              clinic="Clínica Infantil Alegria"
              rating={5}
              text="Minha equipe adorou o sistema. Economizamos horas de trabalho por semana e nossos pacientes percebem a diferença no atendimento."
            />
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-24 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Planos para cada necessidade
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-16">
            Escolha o plano ideal para o tamanho da sua clínica. Todos incluem suporte e atualizações.
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            <PricingPreviewCard 
              name="Starter"
              price="R$ 97"
              description="Ideal para clínicas pequenas"
              features={["Até 3 usuários", "500 pacientes", "Suporte por email"]}
            />
            <PricingPreviewCard 
              name="Professional"
              price="R$ 197"
              description="Para clínicas em crescimento"
              features={["Até 10 usuários", "2.000 pacientes", "Suporte prioritário"]}
              highlighted
            />
            <PricingPreviewCard 
              name="Enterprise"
              price="R$ 397"
              description="Para grandes operações"
              features={["Usuários ilimitados", "Pacientes ilimitados", "Suporte 24/7"]}
            />
          </div>
          <Button size="lg" asChild className="h-12 px-8">
            <Link href="/pricing">
              Ver todos os detalhes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8">
            Pronto para transformar<br />sua clínica?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Junte-se a centenas de clínicas que já utilizam o ClinicOps para otimizar suas operações.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="h-14 px-8 text-lg font-semibold shadow-lg shadow-primary/20">
              <Link href="/register">
                Criar Conta Gratuita
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-14 px-8 text-lg bg-background/50 border-white/10 hover:bg-background/80">
              <Link href="/login">Já tenho conta</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Building2 className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg tracking-tight">ClinicOps</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Plataforma completa para gestão de clínicas médicas com segurança e eficiência.
                Tecnologia de ponta para sua saúde.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-foreground">Produto</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-primary transition-colors">Funcionalidades</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors">Preços</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Segurança</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Atualizações</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-foreground">Empresa</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">Sobre nós</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Carreiras</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Contato</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-foreground">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">Termos de uso</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Privacidade</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">LGPD</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; 2024 ClinicOps. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6">
              {/* Social Icons would go here */}
            </div>
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
    <div className="bg-card/30 p-8 rounded-2xl border border-white/5 hover:border-primary/20 hover:bg-card/50 transition-all duration-300 group">
      <div className="text-primary mb-6 p-3 bg-primary/10 rounded-xl w-fit group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-xl font-bold mb-3 tracking-tight">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

function SecurityItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3">
      <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
        <CheckCircle2 className="h-3 w-3 text-primary" />
      </div>
      <span className="text-muted-foreground">{text}</span>
    </li>
  )
}

function TestimonialCard({ 
  name, 
  role, 
  clinic,
  rating,
  text 
}: { 
  name: string
  role: string
  clinic: string
  rating: number
  text: string 
}) {
  return (
    <div className="bg-card/30 p-8 rounded-2xl border border-white/5">
      <div className="flex gap-1 mb-6">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
        ))}
      </div>
      <p className="text-muted-foreground mb-6 leading-relaxed">"{text}"</p>
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
          <span className="text-primary font-bold text-sm">
            {name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div>
          <div className="font-semibold text-sm">{name}</div>
          <div className="text-xs text-muted-foreground">{role} • {clinic}</div>
        </div>
      </div>
    </div>
  )
}

function PricingPreviewCard({ 
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
    <div className={`p-8 rounded-2xl border transition-all duration-300 ${highlighted ? 'bg-primary/5 border-primary/50 ring-1 ring-primary/50' : 'bg-card/30 border-white/5 hover:border-white/10'}`}>
      {highlighted && (
        <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block">
          Mais Popular
        </span>
      )}
      <h3 className="text-xl font-bold mt-2">{name}</h3>
      <p className="text-muted-foreground text-sm mb-6">{description}</p>
      <div className="mb-8">
        <span className="text-4xl font-bold tracking-tight">{price}</span>
        <span className="text-muted-foreground">/mês</span>
      </div>
      <ul className="space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            <CheckCircle2 className={`h-4 w-4 ${highlighted ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="text-sm text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
