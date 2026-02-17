
import dotenv from "dotenv";
import { sendLineFlexMessage } from "../lib/line";

dotenv.config();

async function testLineFlexGroup() {
    console.log("Testing LINE Flex Message to Group...");

    if (!process.env.LINE_GROUP_ID) {
        console.error("❌ LINE_GROUP_ID is missing in .env");
        return;
    }

    const mockRequest = {
        service: "ยืมอุปกรณ์ (ทดสอบ Group)",
        username: "Tester User",
        department: "IT Department",
        project: "System Test",
        location: "Meeting Room 1",
        usageDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        usageTime: "13:00 - 15:00",
        contact: "081-999-9999",
        details: "Testing Flex Message Header Update."
    };

    console.log(`Sending to Group ID: ${process.env.LINE_GROUP_ID}`);
    await sendLineFlexMessage(mockRequest);
}

testLineFlexGroup();
