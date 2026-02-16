import { NextResponse } from "next/server";
import { sendLineFlexMessage } from "@/lib/line";

export async function GET() {
    try {
        const mockRequest = {
            id: 1004,
            service: "เครื่องเสียง/ไมโครโฟน",
            equipment: "ไมโครโฟน 2 ตัว",
            username: "Somchai Clean",
            department: "มัก..มาก",
            project: "จริยธรรม ข้าราชการใหม่",
            details: "ติดตั้งไมค์พร้อมเครื่องเสียง ระบบ Dolby 5.1 Surround",
            location: "Silicon Valley",
            usageDate: new Date("2026-02-20"),
            endDate: new Date("2026-02-20"),
            usageTime: "04:00 - 09:00 a.m",
            contact: "081-333-3333"
        };

        await sendLineFlexMessage(mockRequest);
        return NextResponse.json({ success: true, message: "Flex Message with full fields sent" });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
