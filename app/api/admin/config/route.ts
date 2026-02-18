
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export async function GET(req: NextRequest) {
    try {
        const configs = await prisma.systemConfig.findMany();
        const configMap: Record<string, string> = {};
        configs.forEach((config: { key: string; value: string }) => {
            configMap[config.key] = config.value;
        });
        return NextResponse.json(configMap);
    } catch (error) {
        console.error("Error fetching system config:", error);
        return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const updates = [];

        for (const [key, value] of Object.entries(body)) {
            if (typeof value === "string") {
                updates.push(
                    prisma.systemConfig.upsert({
                        where: { key },
                        update: { value },
                        create: { key, value },
                    })
                );
            }
        }

        await Promise.all(updates);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating system config:", error);
        return NextResponse.json({ error: "Failed to update config" }, { status: 500 });
    }
}
