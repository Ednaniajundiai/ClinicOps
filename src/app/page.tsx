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
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">ClinicOps</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Funcionalidades
            </Link>
            <Link href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
              Depoimentos
            </Link>
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Precos
            </Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
              Entrar
            </Link>
            <Button asChild>
              <Link href="/register">Comecar Gratis</Link>
            </Button>
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
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="container mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Plataforma completa para gestao de clinicas
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Gestao Inteligente para
            <span className="text-primary block mt-2">Clinicas Medicas</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Simplifique a administracao da sua clinica com nossa plataforma completa. 
            Pacientes, atendimentos, documentos e muito mais em um so lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8">
              <Link href="/register">
                Comecar Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8">
              <Link href="#features">Conhecer Funcionalidades</Link>
            </Button>
          </div>
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>14 dias gratis</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Sem cartao de credito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Cancele quando quiser</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground mt-1">Clinicas Ativas</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary">50k+</div>
              <div className="text-sm text-muted-foreground mt-1">Pacientes Gerenciados</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-muted-foreground mt-1">Uptime Garantido</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary">4.9</div>
              <div className="text-sm text-muted-foreground mt-1">Avaliacao Media</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que sua clinica precisa
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ferramentas poderosas para otimizar cada aspecto da gestao da sua clinica
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Users className="h-10 w-10" />}
              title="Gestao de Pacientes"
              description="Cadastro completo, historico de atendimentos e documentos organizados em um so lugar."
            />
            <FeatureCard 
              icon={<Calendar className="h-10 w-10" />}
              title="Agenda Inteligente"
              description="Registre consultas, procedimentos e acompanhe toda a jornada do paciente."
            />
            <FeatureCard 
              icon={<Shield className="h-10 w-10" />}
              title="Seguranca LGPD"
              description="Dados criptografados, auditoria completa e conformidade total com a legislacao."
            />
            <FeatureCard 
              icon={<Building2 className="h-10 w-10" />}
              title="Multi-Clinicas"
              description="Gerencie multiplas unidades com isolamento total de dados entre elas."
            />
            <FeatureCard 
              icon={<BarChart3 className="h-10 w-10" />}
              title="Relatorios Completos"
              description="Metricas e indicadores para tomada de decisoes estrategicas do seu negocio."
            />
            <FeatureCard 
              icon={<Clock className="h-10 w-10" />}
              title="Economia de Tempo"
              description="Interface intuitiva que sua equipe aprende em minutos, sem treinamento extenso."
            />
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Lock className="h-4 w-4" />
                Seguranca em primeiro lugar
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Seus dados protegidos com tecnologia de ponta
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Utilizamos as melhores praticas de seguranca do mercado para garantir que os dados 
                dos seus pacientes estejam sempre protegidos e em conformidade com a LGPD.
              </p>
              <ul className="space-y-4">
                <SecurityItem text="Criptografia AES-256 para dados sensiveis" />
                <SecurityItem text="Row Level Security (RLS) para isolamento de dados" />
                <SecurityItem text="Autenticacao de dois fatores disponivel" />
                <SecurityItem text="Auditoria completa de todas as acoes" />
                <SecurityItem text="Backups automaticos diarios" />
              </ul>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-8 md:p-12">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background rounded-lg p-4 shadow-sm">
                    <Shield className="h-8 w-8 text-primary mb-2" />
                    <div className="font-semibold">LGPD</div>
                    <div className="text-sm text-muted-foreground">Conformidade total</div>
                  </div>
                  <div className="bg-background rounded-lg p-4 shadow-sm">
                    <Lock className="h-8 w-8 text-primary mb-2" />
                    <div className="font-semibold">SSL/TLS</div>
                    <div className="text-sm text-muted-foreground">Conexao segura</div>
                  </div>
                  <div className="bg-background rounded-lg p-4 shadow-sm">
                    <Users className="h-8 w-8 text-primary mb-2" />
                    <div className="font-semibold">RLS</div>
                    <div className="text-sm text-muted-foreground">Isolamento total</div>
                  </div>
                  <div className="bg-background rounded-lg p-4 shadow-sm">
                    <BarChart3 className="h-8 w-8 text-primary mb-2" />
                    <div className="font-semibold">Auditoria</div>
                    <div className="text-sm text-muted-foreground">Logs completos</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Veja como o ClinicOps esta transformando a gestao de clinicas em todo o Brasil
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard 
              name="Dra. Maria Santos"
              role="Dermatologista"
              clinic="Clinica Derma Care"
              image="/avatars/maria.jpg"
              rating={5}
              text="O ClinicOps revolucionou a forma como gerenciamos nossa clinica. A interface e intuitiva e o suporte e excepcional. Recomendo para todos os colegas."
            />
            <TestimonialCard 
              name="Dr. Carlos Oliveira"
              role="Cardiologista"
              clinic="Instituto do Coracao"
              image="/avatars/carlos.jpg"
              rating={5}
              text="Finalmente encontrei uma solucao que atende todas as nossas necessidades. A seguranca dos dados e a facilidade de uso sao impressionantes."
            />
            <TestimonialCard 
              name="Dra. Ana Paula Costa"
              role="Pediatra"
              clinic="Clinica Infantil Alegria"
              image="/avatars/ana.jpg"
              rating={5}
              text="Minha equipe adorou o sistema. Economizamos horas de trabalho por semana e nossos pacientes percebem a diferenca no atendimento."
            />
            <TestimonialCard 
              name="Dr. Roberto Lima"
              role="Ortopedista"
              clinic="Ortho Center"
              image="/avatars/roberto.jpg"
              rating={5}
              text="A integracao com diferentes funcionalidades em uma unica plataforma foi o diferencial. Nao precisamos mais de varios sistemas separados."
            />
            <TestimonialCard 
              name="Dra. Fernanda Alves"
              role="Ginecologista"
              clinic="Clinica Feminina"
              image="/avatars/fernanda.jpg"
              rating={5}
              text="O sistema de auditoria e compliance me da tranquilidade quanto a LGPD. E fundamental para clinicas que lidam com dados sensiveis."
            />
            <TestimonialCard 
              name="Dr. Marcos Souza"
              role="Clinico Geral"
              clinic="Clinica Saude Total"
              image="/avatars/marcos.jpg"
              rating={5}
              text="Migramos de outro sistema e a transicao foi suave. O suporte nos ajudou em cada passo. Estamos muito satisfeitos com a escolha."
            />
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Planos para cada necessidade
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Escolha o plano ideal para o tamanho da sua clinica. Todos incluem suporte e atualizacoes.
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
            <PricingPreviewCard 
              name="Starter"
              price="R$ 97"
              description="Ideal para clinicas pequenas"
              features={["Ate 3 usuarios", "500 pacientes", "Suporte por email"]}
            />
            <PricingPreviewCard 
              name="Professional"
              price="R$ 197"
              description="Para clinicas em crescimento"
              features={["Ate 10 usuarios", "2.000 pacientes", "Suporte prioritario"]}
              highlighted
            />
            <PricingPreviewCard 
              name="Enterprise"
              price="R$ 397"
              description="Para grandes operacoes"
              features={["Usuarios ilimitados", "Pacientes ilimitados", "Suporte 24/7"]}
            />
          </div>
          <Button size="lg" asChild>
            <Link href="/pricing">
              Ver todos os detalhes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para transformar sua clinica?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de clinicas que ja utilizam o ClinicOps para otimizar suas operacoes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="text-lg px-8">
              <Link href="/register">
                Criar Conta Gratuita
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 bg-transparent border-primary-foreground/20 hover:bg-primary-foreground/10">
              <Link href="/login">Ja tenho conta</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">ClinicOps</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Plataforma completa para gestao de clinicas medicas com seguranca e eficiencia.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground">Funcionalidades</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground">Precos</Link></li>
                <li><Link href="#" className="hover:text-foreground">Seguranca</Link></li>
                <li><Link href="#" className="hover:text-foreground">Atualizacoes</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Sobre nos</Link></li>
                <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground">Carreiras</Link></li>
                <li><Link href="#" className="hover:text-foreground">Contato</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Termos de uso</Link></li>
                <li><Link href="#" className="hover:text-foreground">Privacidade</Link></li>
                <li><Link href="#" className="hover:text-foreground">LGPD</Link></li>
                <li><Link href="#" className="hover:text-foreground">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              2024 ClinicOps. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </Link>
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
    <div className="bg-background p-6 rounded-xl border hover:shadow-lg transition-shadow">
      <div className="text-primary mb-4 p-3 bg-primary/10 rounded-lg w-fit">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function SecurityItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3">
      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
      <span>{text}</span>
    </li>
  )
}

function TestimonialCard({ 
  name, 
  role, 
  clinic,
  image,
  rating,
  text 
}: { 
  name: string
  role: string
  clinic: string
  image: string
  rating: number
  text: string 
}) {
  return (
    <div className="bg-background p-6 rounded-xl border">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-muted-foreground mb-6">{text}</p>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-semibold text-sm">
            {name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div>
          <div className="font-semibold text-sm">{name}</div>
          <div className="text-xs text-muted-foreground">{role} - {clinic}</div>
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
    <div className={`p-6 rounded-xl border bg-background ${highlighted ? 'border-primary ring-2 ring-primary' : ''}`}>
      {highlighted && (
        <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
          Mais Popular
        </span>
      )}
      <h3 className="text-xl font-semibold mt-4">{name}</h3>
      <p className="text-muted-foreground text-sm mb-4">{description}</p>
      <div className="mb-6">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-muted-foreground">/mes</span>
      </div>
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
