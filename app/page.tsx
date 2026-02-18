import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

// export const revalidate = 3600;

export default async function Home() {
  const services = await prisma.service.findMany({
    orderBy: { order: "asc" },
  });

  const logoConfig = await prisma.systemConfig.findUnique({
    where: { key: "site_logo" },
  });
  const logoUrl = logoConfig?.value || "/hiyeum-logo.png";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0070f3] via-[#50e3c2] to-[#ffcc00] flex flex-col items-center pt-10 md:pt-20 font-sans p-8">
      {/* Centered Logo */}
      <div className="mb-8 flex flex-col items-center drop-shadow-2xl">
        <Link href="/" className="mb-[5px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <Image
            src={logoUrl}
            alt="Hi YEUM Logo"
            width={300}
            height={160}
            className="h-24 md:h-40 w-auto object-contain hover:scale-105 transition-transform duration-300"
            priority
          />
        </Link>
        <h1 className="text-2xl font-bold text-white tracking-wide text-center">
          บริการทุกระดับ ประทับใจ
        </h1>
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {services.map((service) => (
          <Link
            key={service.id}
            href={`/borrow/${service.id}`}
            className="group block"
          >
            <div className="flex flex-col h-full bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg transition-transform hover:-translate-y-1 duration-300 hover:shadow-2xl">
              {/* Image Placeholder */}
              <div className="aspect-square bg-gray-300/50 relative flex items-center justify-center overflow-hidden">
                {service.image ? (
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                ) : (
                  <span className="text-gray-500 text-5xl font-bold">Pic</span>
                )}
              </div>
              {/* Text Label */}
              <div className="py-3 flex items-center justify-center">
                <h2 className="text-xl font-bold text-center text-gray-800 transition-colors">
                  {service.name}
                </h2>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer - Minimal */}
      <footer className="absolute bottom-4 text-white/50 text-sm">
      </footer>
    </div>
  );
}
