import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendLineNotification, sendLineFlexMessage } from "@/lib/line";

export const revalidate = 60;

// GET: Fetch all borrow requests
export async function GET() {
    try {
        const requests = await prisma.borrowRequest.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(requests);
    } catch (error) {
        console.error("Failed to fetch requests:", error);
        return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
    }
}

// POST: Create a new borrow request
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            service,
            equipment,
            project,
            username,
            department,
            contact,
            lineId,
            usageDate,
            endDate,
            usageTime,
            location,
            details,
            attachFile,
        } = body;

        // Basic validation
        if (!service || !equipment || !username || !department || !contact || !usageDate || !location) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newRequest = await prisma.borrowRequest.create({
            data: {
                service,
                equipment,
                project: project || null,
                username,
                department,
                contact,
                lineId: lineId || null,
                usageDate: new Date(usageDate),
                endDate: endDate ? new Date(endDate) : null,
                usageTime: usageTime || null,
                location,
                details: details || null,
                attachFile: attachFile || null,
            },
        });

        // Send LINE Notification
        try {
            await sendLineFlexMessage({
                ...newRequest,
                username,
                department,
                service,
                location,
                usageTime: usageTime || "-",
                contact
            });
        } catch (notifyError) {
            console.error("Notification failed but request created:", notifyError);
        }

        return NextResponse.json(newRequest, { status: 201 });
    } catch (error) {
        console.error("Failed to create request:", error);
        return NextResponse.json({ error: `Failed to create request: ${(error as Error).message}` }, { status: 500 });
    }
}

// PATCH: Update borrow request status
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, status, attachFile } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const updateData: any = {};
        if (status) updateData.status = status;
        if (attachFile) updateData.attachFile = attachFile;

        const updatedRequest = await prisma.borrowRequest.update({
            where: { id: Number(id) },
            data: updateData,
        });

        return NextResponse.json(updatedRequest);
    } catch (error) {
        console.error("Failed to update status:", error);
        return NextResponse.json({ error: `Failed to update status: ${(error as Error).message}` }, { status: 500 });
    }
}


// DELETE: Delete a borrow request
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
        }

        await prisma.borrowRequest.delete({
            where: { id: Number(id) },
        });

        return NextResponse.json({ message: "Request deleted successfully" });
    } catch (error) {
        console.error("Failed to delete request:", error);
        return NextResponse.json({ error: `Failed to delete request: ${(error as Error).message}` }, { status: 500 });
    }
}
