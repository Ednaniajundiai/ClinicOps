'use client'

import { 
  LayoutDashboard, 
  Users, 
  Settings,
  BarChart3,
  CreditCard,
  FileText,
  Shield
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'

const navItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: 'Equipe',
    href: '/admin/equipe',
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: 'Relatórios',
    href: '/admin/relatorios',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: 'Auditoria',
    href: '/admin/auditoria',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: 'Privacidade (LGPD)',
    href: '/admin/lgpd',
    icon: <Shield className="h-5 w-5" />,
  },
  {
    title: 'Assinatura',
    href: '/admin/assinatura',
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    title: 'Configurações',
    href: '/admin/configuracoes',
    icon: <Settings className="h-5 w-5" />,
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout navItems={navItems} title="Administração">
      {children}
    </DashboardLayout>
  )
}
