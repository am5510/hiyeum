import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { password } = body;

        // Direct string comparison for simplicity as per requirements
        // In a real production app with multiple users, we'd use a database and hashed passwords
        if (password === process.env.ADMIN_PASSWORD) {
            const response = NextResponse.json({ success: true }, { status: 200 });

            // Set a cookie to indicate the user is logged in
            // Secure: true in production, HttpOnly: true to prevent JS access
            response.cookies.set('admin_session', 'true', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 60 * 24 // 1 day
            });

            return response;
        }

        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
