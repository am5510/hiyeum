
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

dotenv.config();

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

const S3 = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID || "",
        secretAccessKey: R2_SECRET_ACCESS_KEY || "",
    },
});

async function testUpload() {
    console.log("Testing R2 Upload...");
    console.log("Bucket:", R2_BUCKET_NAME);
    console.log("Account ID:", R2_ACCOUNT_ID);

    try {
        const filename = `test-${Date.now()}.txt`;
        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: filename,
            ContentType: "text/plain",
        });

        console.log("Generating presigned URL...");
        const uploadUrl = await getSignedUrl(S3, command, { expiresIn: 3600 });
        console.log("Upload URL generated.");

        console.log("Attempting to upload data...");
        const res = await fetch(uploadUrl, {
            method: "PUT",
            body: "Hello from server-side test script!",
            headers: {
                "Content-Type": "text/plain",
            },
        });

        if (res.ok) {
            console.log("✅ Upload SUCCESSFUL!");
            console.log("Status:", res.status);
        } else {
            console.error("❌ Upload FAILED.");
            console.error("Status:", res.status);
            console.error("Response:", await res.text());
        }

    } catch (error) {
        console.error("❌ Test failed with error:", error);
    }
}

testUpload();
