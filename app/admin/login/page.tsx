'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                router.push('/admin');
                router.refresh();
            } else {
                setError('รหัสผ่านไม่ถูกต้อง');
            }
        } catch (err) {
            setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0070f3] via-[#50e3c2] to-[#ffcc00]">
            <div className="w-96 flex flex-col items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/hiyeum-logo.png"
                    alt="Hi YEUM Logo"
                    className="h-32 w-auto object-contain mb-4 drop-shadow-md"
                />
                <h1 className="text-3xl font-bold mb-6 text-center text-white drop-shadow-md">Admin Login</h1>
                <form onSubmit={handleSubmit} className="space-y-4 w-full">
                    <div>
                        <label className="block text-sm font-medium text-white mb-1 drop-shadow-md">
                            กรุณาระบุรหัสผ่าน
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border-none rounded-xl focus:outline-none focus:ring-4 focus:ring-white/30 text-gray-900 bg-white/90 shadow-lg placeholder:text-gray-400"
                            placeholder="Enter password"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm font-bold bg-white/90 p-2 rounded text-center shadow-sm">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-xl transition-all font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95"
                    >
                        เข้าสู่ระบบ
                    </button>
                </form>
            </div>
        </div>
    );
}
