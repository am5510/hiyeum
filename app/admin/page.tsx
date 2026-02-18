import { prisma } from "@/lib/prisma";
import Link from "next/link";
import RequestTable from "./RequestTable";
import AdminMenu from "./AdminMenu";
import { Suspense } from "react";

// export const revalidate = 60;

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

    // Fetch Logo
    const logoConfig = await prisma.systemConfig.findUnique({
        where: { key: 'site_logo' },
    });
    const logoUrl = logoConfig?.value || "/hiyeum-logo.png";

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <header className="w-full h-20 md:h-32 bg-gradient-to-br from-[#0070f3] via-[#50e3c2] to-[#ffcc00] flex items-center justify-between px-4 md:px-12 relative shadow-lg">
                <Link href="/" className="flex items-center z-10 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={logoUrl}
                        alt="Hi YEUM Logo"
                        className="h-14 md:h-24 w-auto object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
                    />

                </Link>

                <AdminMenu />
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
