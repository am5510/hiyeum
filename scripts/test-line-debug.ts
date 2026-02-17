
import dotenv from "dotenv";
import { sendLineNotification } from "../lib/line";

dotenv.config();

async function testLineDebug() {
    console.log("🔍 Starting LINE Debug...");

    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const groupId = process.env.LINE_GROUP_ID;
    const userId = process.env.LINE_USER_ID;

    if (!token) {
        console.error("❌ Token is missing!");
        return;
    }

    console.log(`Token present: ${token.substring(0, 10)}...`);

    // 1. Try sending to User first (to verify token)
    if (userId) {
        console.log(`\n1️⃣ Testing send to User (${userId})...`);
        try {
            const response = await fetch("https://api.line.me/v2/bot/message/push", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    to: userId,
                    messages: [{ type: "text", text: "Test message to User (checking token validity)" }],
                }),
            });

            const data = await response.json();
            if (response.ok) {
                console.log("✅ Send to User: SUCCESS");
            } else {
                console.error("❌ Send to User: FAILED", data);
            }
        } catch (e) {
            console.error("❌ Send to User: ERROR", e);
        }
    } else {
        console.log("⚠️ No User ID found to test token.");
    }

    // 2. Try sending to Group
    if (groupId) {
        console.log(`\n2️⃣ Testing send to Group (${groupId})...`);
        try {
            const response = await fetch("https://api.line.me/v2/bot/message/push", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    to: groupId,
                    messages: [{ type: "text", text: "Test message to Group (checking group membership)" }],
                }),
            });

            const data = await response.json();
            if (response.ok) {
                console.log("✅ Send to Group: SUCCESS");
            } else {
                console.error("❌ Send to Group: FAILED", data);
                console.log("👉 Suggestion: Confirm the bot is invited to this group.");
            }
        } catch (e) {
            console.error("❌ Send to Group: ERROR", e);
        }
    } else {
        console.error("❌ No Group ID found.");
    }
}

testLineDebug();
