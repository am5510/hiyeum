
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

export default function AdminSettings() {
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await fetch("/api/admin/config");
            const data = await res.json();
            if (data.site_logo) {
                setLogoUrl(data.site_logo);
            }
        } catch (error) {
            console.error("Failed to fetch config:", error);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            // Reuse existing upload API
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            setLogoUrl(data.publicUrl);
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload image.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch("/api/admin/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ site_logo: logoUrl }),
            });

            if (res.ok) {
                alert("Settings saved successfully!");
            } else {
                alert("Failed to save settings.");
            }
        } catch (error) {
            console.error("Save error:", error);
            alert("Error saving settings.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">ตั้งค่าระบบ (System Settings)</h1>
                    <Link
                        href="/admin"
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        กลับสู่แดชบอร์ด
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-700 mb-4">โลโก้เว็บไซต์ (Website Logo)</h2>

                    <div className="flex flex-col items-center gap-4 mb-6">
                        <div className="w-full max-w-sm aspect-video bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 relative">
                            {logoUrl ? (
                                <Image
                                    src={logoUrl}
                                    alt="Current Logo"
                                    fill
                                    className="object-contain p-4"
                                />
                            ) : (
                                <span className="text-gray-400">ยังไม่มีโลโก้</span>
                            )}
                            {isLoading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                                    Updating...
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                disabled={isLoading}
                            >
                                {logoUrl ? "เปลี่ยนรูปภาพ" : "อัปโหลดรูปภาพ"}
                            </button>
                            {logoUrl && (
                                <button
                                    onClick={() => setLogoUrl(null)}
                                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                >
                                    ลบออก
                                </button>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            แนะนำขนาด: 300x160 px หรืออัตราส่วนใกล้เคียง (รองรับ .png, .jpg)
                        </p>
                    </div>

                    <div className="border-t pt-6 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`px-6 py-2 rounded-lg text-white font-bold transition-colors ${isSaving ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                                }`}
                        >
                            {isSaving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
