import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database, Usuario } from './database.types'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database, 'public'>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Define rotas públicas
  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password']
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith('/api/webhooks')
  )

  // Redireciona usuário não autenticado tentando acessar rotas protegidas
  if (!user && !isPublicRoute && !request.nextUrl.pathname.startsWith('/_next')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Redireciona usuário autenticado tentando acessar páginas de auth
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
    const url = request.nextUrl.clone()
    
    // Busca perfil do usuário para redirecionar corretamente
    const { data: usuarioData } = await supabase
      .from('usuarios')
      .select('perfil')
      .eq('auth_user_id', user.id)
      .single()
    
    const usuario = usuarioData as unknown as Usuario | null

    if (usuario?.perfil === 'master') {
      url.pathname = '/master'
    } else if (usuario?.perfil === 'admin') {
      url.pathname = '/admin'
    } else {
      url.pathname = '/app'
    }
    
    return NextResponse.redirect(url)
  }

  return response
}
