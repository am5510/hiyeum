import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const response = NextResponse.redirect(new URL('/', request.url), { status: 303 });

    // Clear the cookie
    response.cookies.set('admin_session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0 // Expire immediately
    });

    return response;
}
