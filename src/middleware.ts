// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import { hasPermission } from '@/lib/auth';

// export function middleware(request: NextRequest) {
//   const token = request.cookies.get('authToken')?.value;
  
//   // Public routes
//   if (request.nextUrl.pathname.startsWith('/signin') || 
//       request.nextUrl.pathname.startsWith('/signup') || 
//       request.nextUrl.pathname.startsWith('/reset-password') ||
//       request.nextUrl.pathname.startsWith('/images') || 
//       request.nextUrl.pathname.startsWith('/api/auth')) {
//     return NextResponse.next();
//   }

//   if (!token) {
//     return NextResponse.redirect(new URL('/signin', request.url));
//   }

//   let payload;
//   try {
//     const tokenParts = token.split('.');
//     if (tokenParts.length !== 3) throw new Error('Invalid token');
//     payload = JSON.parse(atob(tokenParts[1]));
//     const now = Date.now();
//     console.log("payload - ", payload);
//     // console.log("DEBUG role:", payload.role);
    
//     if (payload.exp < now) {
//       // return NextResponse.redirect(new URL('/signin', request.url));
//     }
//   } catch(err) {
//     console.log("catch error - ",err);
    
//     return NextResponse.redirect(new URL('/signin', request.url));
//   }

//   // Extract permission from pathname - handle /products/add -> 'products/add'
//   console.log("DEBUG raw pathname:", request.nextUrl.pathname);
//   const pathname = request.nextUrl.pathname;
//   const pathSegments = pathname.split('/').filter(Boolean);
//   const lastSegment = pathSegments[pathSegments.length - 1] || '';
//   const actionWords = ['add', 'edit', 'new', 'create', 'update', 'delete', 'category'];
  
//   let permission;
//   if (pathSegments.length >= 3 && actionWords.includes(lastSegment) && pathSegments[pathSegments.length - 2].match(/^[0-9]+$/)) {
//     // Handle /module/[id]/action -> 'module/action'
//     permission = pathSegments[pathSegments.length - 3] + '/' + lastSegment;
//   } else if (pathSegments.length >= 2 && actionWords.includes(lastSegment)) {
//     permission = pathSegments.slice(-2).join('/');
//   } else {
//     permission = lastSegment || 'dashboard';
//   }
//   console.log("DEBUG pathSegments:", pathSegments);
//   console.log("DEBUG permission extracted:", permission);

//   if (!hasPermission(payload.role, permission)) {
//     console.log("DEBUG hasPermission false for role:", payload.role, "permission:", permission);
//     return NextResponse.redirect(new URL('/not-found', request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     '/admin/:path*',
// '/((?!signin|signup|not-found|api/auth|_next/static|_next/image|favicon.ico).*)',
//   ],
// };



import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { hasPermission, rolePermissions } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;
  const { pathname } = request.nextUrl;

  // 1. ALLOW PUBLIC ROUTES
  // Added common static folders and the not-found page to prevent redirect loops
  if (
    pathname.startsWith('/signin') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/not-found') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.') // matches favicon.ico, etc.
  ) {
    return NextResponse.next();
  }

  // 2. AUTHENTICATION CHECK
  if (!token) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  try {
    // Decode JWT Payload
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) throw new Error('Invalid token structure');
    
    const payload = JSON.parse(atob(tokenParts[1]));
    console.log("\n\npayload - ", payload);
    
    const now = Math.floor(Date.now() / 1000);

    // Check Expiration
    if (payload.exp && payload.exp < now) {
      const response = NextResponse.redirect(new URL('/signin', request.url));
      response.cookies.delete('authToken');
      return response;
    }

    // 3. EXTRACT PERMISSION KEY FROM URL
    // Removes '/admin' if it exists and splits path
    const segments = pathname.split('/').filter(Boolean);
    const cleanSegments = segments.filter(s => s !== 'admin');
    
    // Logic: 
    // /products/add -> 'products'
    // /orders -> 'orders'
    // Default -> 'dashboard'
    const requestedModule = cleanSegments[0] || 'dashboard';

    // 4. FUTURE-PROOF AUTHORIZATION CHECK
    const userRole = payload.role?.toLowerCase();
    const userDirectPermissions: string[] = payload.permissions || [];
    
    // Get permissions for this role from our static fallback
    const staticRolePerms = rolePermissions[userRole] || [];

    // Combine both (Direct from JWT + Static from Role)
    const allUserPermissions = [...userDirectPermissions, ...staticRolePerms];

    // Check if user has access
    // Supports: '*' (Super Admin), exact match ('orders'), or granular ('orders.view')
    const hasAccess = allUserPermissions.some(p => 
      p === '*' || 
      p === requestedModule || 
      p.startsWith(`${requestedModule}.`)
    );

    if (!hasAccess) {
      console.warn(`[Middleware] Denied: ${userRole} attempting to access ${requestedModule}`);
      return NextResponse.rewrite(new URL('/not-found', request.url));
    }

    return NextResponse.next();

  } catch (err) {
    console.error("[Middleware] Token error:", err);
    const response = NextResponse.redirect(new URL('/signin', request.url));
    response.cookies.delete('authToken');
    return response;
  }
}

// 5. MATCHER CONFIGURATION
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/admin/:path',
    '/((?!signin|signup|not-found|api/auth|_next/static|_next/image|favicon.ico).*)',
    // '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};