import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Check if the request is for the admin section
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // allow access to login page
        if (request.nextUrl.pathname === '/admin/login') {
            return NextResponse.next();
        }

        // Check for the admin_session cookie
        const adminSession = request.cookies.get('admin_session');

        if (!adminSession) {
            // Redirect to login page if no session cookie
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};
