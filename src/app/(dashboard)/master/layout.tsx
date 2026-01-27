'use client'

import { 
  LayoutDashboard, 
  Building2, 
  CreditCard, 
  Users, 
  Settings,
  BarChart3
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'

const navItems = [
  {
    title: 'Dashboard',
    href: '/master',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: 'Clínicas',
    href: '/master/clinicas',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    title: 'Planos',
    href: '/master/planos',
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    title: 'Usuários',
    href: '/master/usuarios',
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: 'Relatórios',
    href: '/master/relatorios',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: 'Configurações',
    href: '/master/configuracoes',
    icon: <Settings className="h-5 w-5" />,
  },
]

export default function MasterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout navItems={navItems} title="Painel Master">
      {children}
    </DashboardLayout>
  )
}
