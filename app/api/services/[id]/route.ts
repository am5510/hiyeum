
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Get a single service
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const service = await prisma.service.findUnique({
            where: { id: params.id },
        });

        if (!service) {
            return NextResponse.json({ error: "Service not found" }, { status: 404 });
        }

        return NextResponse.json(service);
    } catch (error) {
        console.error("Failed to fetch service:", error);
        return NextResponse.json({ error: "Failed to fetch service" }, { status: 500 });
    }
}

// PUT: Update a service
export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const body = await request.json();
        const { name, order, image } = body;

        const updatedService = await prisma.service.update({
            where: { id: params.id },
            data: {
                name,
                image,
                order,
            },
        });

        return NextResponse.json(updatedService);
    } catch (error) {
        console.error("Failed to update service:", error);
        return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
    }
}

// DELETE: Delete a service
export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await prisma.service.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: "Service deleted successfully" });
    } catch (error) {
        console.error("Failed to delete service:", error);
        return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
    }
}
