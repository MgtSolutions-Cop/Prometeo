// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Obtenemos la ruta actual a la que el usuario intenta acceder
  const path = request.nextUrl.pathname;

  // Leemos la cookie del refreshToken (usamos este porque el accessToken expira rápido)
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // Definimos qué rutas queremos proteger (todo lo que empiece con /dashboard)
  const isProtectedRoute = path.startsWith('/dashboard');

  // Definimos rutas públicas donde el usuario logueado no debería entrar de nuevo
  const isPublicRoute = path === '/login' || path === '/';

  // Lógica 1: Si intenta ir a un dashboard y NO tiene token, pa' fuera (al login)
  if (isProtectedRoute && !refreshToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Lógica 2: Si intenta ir al login pero YA tiene token, lo mandamos al dashboard
  if (isPublicRoute && refreshToken) {
    return NextResponse.redirect(new URL('/dashboard/metrics', request.url));
  }

  // Si todo está en orden, dejamos que la petición continúe normalmente
  return NextResponse.next();
}

// Configuración de en qué rutas se debe ejecutar este middleware
export const config = {
  // Ignoramos rutas de API, archivos estáticos, imágenes, etc. para no sobrecargar el servidor
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};