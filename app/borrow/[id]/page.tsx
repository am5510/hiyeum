
import { notFound } from "next/navigation";
import Link from "next/link";
import BorrowForm from "./BorrowForm";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export async function generateStaticParams() {
    const services = await prisma.service.findMany();
    return services.map((service) => ({
        id: service.id,
    }));
}

export default async function BorrowPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    const service = await prisma.service.findUnique({
        where: { id: params.id },
    });

    if (!service) {
        notFound();
    }

    const serviceName = service.name;

    const logoConfig = await prisma.systemConfig.findUnique({
        where: { key: "site_logo" },
    });
    const logoUrl = logoConfig?.value || "/hiyeum-logo.png";

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            {/* Header */}
            <header className="w-full h-20 md:h-32 bg-gradient-to-br from-[#0070f3] via-[#50e3c2] to-[#ffcc00] flex items-center px-4 md:px-12 relative overflow-hidden">
                {/* Logo Container */}
                <Link href="/" className="absolute top-3 left-3 md:top-4 md:left-12 z-10 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={logoUrl}
                        alt="Hi YEUM Logo"
                        className="h-14 md:h-24 w-auto object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
                    />
                </Link>


            </header>

            {/* Main Content */}
            <main className="flex-grow flex justify-center px-8 pb-8 pt-[10px] md:px-16 md:pb-16 md:pt-[10px]">
                <div className="w-full max-w-2xl">
                    <div className="flex justify-start mb-2">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                            <span>หน้าหลัก</span>
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold mb-2 text-black">{serviceName}</h1>

                    <BorrowForm serviceId={params.id} serviceName={serviceName} />
                </div>
            </main>

            {/* Footer */}
            <footer className="h-16 bg-[#00b050] w-full"></footer>
        </div>
    );
}
