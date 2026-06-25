import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response = NextResponse.next({
              request: { headers: request.headers },
            })
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Recupera o usuário atual do Supabase de forma segura
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Define quais caminhos não exigem login
  const isPublicRoute = path.startsWith('/login') || path.startsWith('/auth')

  // CASO 1: Não está logado e tenta acessar uma página interna (ex: Home)
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // CASO 2: Já está logado e tenta voltar para a página de login
  if (user && path.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return response
}