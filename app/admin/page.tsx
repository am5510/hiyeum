import { prisma } from "@/lib/prisma";
import Link from "next/link";
import RequestTable from "./RequestTable";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
    const requests = await prisma.borrowRequest.findMany({
        orderBy: { createdAt: "desc" },
    });

    const services = await prisma.service.findMany({
        orderBy: { order: "asc" },
    });

    // Count requests per service
    const requestsByService = await prisma.borrowRequest.groupBy({
        by: ['service'],
        _count: {
            service: true,
        },
    });

    // Create a map for easy lookup
    const countsMap = new Map();
    requestsByService.forEach((item) => {
        if (item.service) { // Ensure service is not null
            countsMap.set(item.service, item._count.service);
        }
    });

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <header className="w-full h-32 bg-gradient-to-br from-[#0070f3] via-[#50e3c2] to-[#ffcc00] flex items-center justify-between px-4 md:px-12 relative overflow-hidden shadow-lg">
                <Link href="/" className="flex items-center z-10 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/hiyeum-logo.png"
                        alt="Hi YEUM Logo"
                        className="h-24 w-auto object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="ml-4 text-white text-xl font-bold drop-shadow-md hidden sm:inline-block group-hover:text-yellow-200 transition-colors">Admin Dashboard</span>
                </Link>

                <div className="z-10 flex gap-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-white font-bold hover:text-gray-200 transition-all drop-shadow-md"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        <span>หน้าหลัก</span>
                    </Link>
                    <Link
                        href="/admin/services"
                        className="flex items-center gap-2 text-white font-bold hover:text-gray-200 transition-all drop-shadow-md"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span>จัดการเมนู</span>
                    </Link>
                    <form action="/api/auth/logout" method="POST">
                        <button
                            type="submit"
                            className="flex items-center gap-2 text-white font-bold hover:text-red-200 transition-all drop-shadow-md cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            <span>ออกจากระบบ</span>
                        </button>
                    </form>
                </div>
            </header>

            <main className="p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {services.map((service, index) => {
                            const count = countsMap.get(service.name) || 0;
                            const borderColors = [
                                "border-blue-400",
                                "border-teal-400",
                                "border-indigo-400",
                                "border-orange-400",
                                "border-pink-400",
                            ];
                            const borderColor = borderColors[index % borderColors.length];

                            return (
                                <div key={service.id} className={`bg-white rounded-xl p-4 flex flex-col items-center border-2 ${borderColor} transition-transform hover:-translate-y-1`}>
                                    <h3 className="text-gray-600 font-medium mb-1 text-center text-xs lg:text-sm">{service.name}</h3>
                                    <p className="text-2xl lg:text-3xl font-bold text-gray-800">{count}</p>
                                    <p className="text-gray-600 text-[10px] lg:text-xs mt-1">รายการ</p>
                                </div>
                            );
                        })}
                    </div>

                    <h2 className="text-2xl font-bold mb-6 text-gray-800">รายการขอใช้อุปกรณ์</h2>

                    <Suspense fallback={<div>Loading...</div>}>
                        <RequestTable requests={requests} />
                    </Suspense>
                </div>
            </main>
        </div>
    );
}
