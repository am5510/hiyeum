
import dotenv from "dotenv";
import { sendLineNotification } from "../lib/line";

dotenv.config();

async function testLineRevert() {
    console.log("Testing LINE Notification (Reverted State)...");
    console.log("LINE_USER_ID:", process.env.LINE_USER_ID);

    if (!process.env.LINE_USER_ID) {
        console.error("❌ LINE_USER_ID is missing in .env");
        return;
    }

    await sendLineNotification("Hello! This is a test message after reverting to User ID only.");
}

testLineRevert();
