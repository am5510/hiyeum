
import dotenv from "dotenv";
import { sendLineNotification } from "../lib/line";

dotenv.config();

async function testLineGroup() {
    console.log("Testing LINE Group Notification...");
    console.log("LINE_GROUP_ID:", process.env.LINE_GROUP_ID);

    if (!process.env.LINE_GROUP_ID) {
        console.warn("⚠️ LINE_GROUP_ID is missing in .env.");
        console.log("ℹ️ Please obtain the Group ID via the Webhook logs and add it to .env");
        return;
    }

    console.log(`Sending to Group ID: ${process.env.LINE_GROUP_ID}`);
    await sendLineNotification("Hello LINE Group! This is a test message from Hi Yeum system. (Group Test)");
}

testLineGroup();
