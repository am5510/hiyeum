'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

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
                setIsLoading(false);
            }
        } catch (err) {
            setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0070f3] via-[#50e3c2] to-[#ffcc00] px-4">
            <div className="w-full max-w-sm flex flex-col items-center">
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
                            disabled={isLoading}
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm font-bold bg-white/90 p-2 rounded text-center shadow-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-xl transition-all font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                กำลังเข้าสู่ระบบ...
                            </>
                        ) : 'เข้าสู่ระบบ'}
                    </button>
                </form>
            </div>
        </div>
    );
}
