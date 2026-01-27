'use client'

import { 
  LayoutDashboard, 
  Users, 
  Calendar,
  FileText,
  Search
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'

const navItems = [
  {
    title: 'Dashboard',
    href: '/app',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: 'Pacientes',
    href: '/app/pacientes',
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: 'Atendimentos',
    href: '/app/atendimentos',
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    title: 'Documentos',
    href: '/app/documentos',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: 'Buscar',
    href: '/app/buscar',
    icon: <Search className="h-5 w-5" />,
  },
]

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout navItems={navItems} title="ClinicOps">
      {children}
    </DashboardLayout>
  )
}
