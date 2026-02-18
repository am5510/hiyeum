
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

// GET: List all services
export async function GET() {
    try {
        const services = await prisma.service.findMany({
            orderBy: { order: "asc" },
        });
        return NextResponse.json(services);
    } catch (error) {
        console.error("Failed to fetch services:", error);
        return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
    }
}

// POST: Create a new service
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, name, order, image } = body;

        if (!id || !name) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newService = await prisma.service.create({
            data: {
                id,
                name,
                image,
                order: order || 0,
            },
        });

        return NextResponse.json(newService, { status: 201 });
    } catch (error) {
        console.error("Failed to create service:", error);
        return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
    }
}
