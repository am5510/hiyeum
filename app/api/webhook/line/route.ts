
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const events = body.events;

        if (events && events.length > 0) {
            events.forEach((event: any) => {
                console.log("📨 LINE Webhook Event Received:");
                console.log(JSON.stringify(event, null, 2));

                if (event.source) {
                    if (event.source.type === "group") {
                        console.log("✅ Group ID Found:", event.source.groupId);
                    } else if (event.source.type === "room") {
                        console.log("✅ Room ID Found:", event.source.roomId);
                    } else if (event.source.type === "user") {
                        console.log("👤 User ID Found:", event.source.userId);
                    }
                }
            });
        }

        return NextResponse.json({ status: "ok" });
    } catch (error) {
        console.error("❌ Error processing LINE webhook:", error);
        return NextResponse.json({ status: "error" }, { status: 500 });
    }
}
