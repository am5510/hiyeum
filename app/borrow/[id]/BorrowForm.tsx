
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type BorrowFormProps = {
    serviceId: string;
    serviceName: string;
};

export default function BorrowForm({ serviceId, serviceName }: BorrowFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        equipment: "",
        project: "",
        username: "",
        department: "",
        contact: "",
        usageDate: "",
        endDate: "",
        usageTime: "",
        location: "",
        details: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/borrow", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    service: serviceName,
                    ...formData,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to submit request");
            }

            setIsSubmitted(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error(error);
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        } finally {
            setLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg border border-gray-100 animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">บันทึกข้อมูลสำเร็จ</h2>
                <p className="text-green-600 font-medium text-lg mb-8 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    คำขอของท่านได้ส่งให้ผู้บริการแล้ว
                </p>

                <div className="w-full bg-gray-50 rounded-lg p-6 mb-8 text-left space-y-3">
                    <h3 className="font-semibold text-gray-700 border-b pb-2 mb-3">รายละเอียดคำขอ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div><span className="text-gray-500 block">บริการ:</span> <span className="font-medium">{serviceName}</span></div>
                        <div><span className="text-gray-500 block">รูปแบบ/อุปกรณ์:</span> <span className="font-medium">{formData.equipment}</span></div>
                        <div><span className="text-gray-500 block">งาน/โครงการ:</span> <span className="font-medium">{formData.project || "-"}</span></div>
                        <div><span className="text-gray-500 block">ผู้ขอใช้:</span> <span className="font-medium">{formData.username}</span></div>
                        <div><span className="text-gray-500 block">สำนัก:</span> <span className="font-medium">{formData.department}</span></div>
                        <div><span className="text-gray-500 block">เบอร์ติดต่อ:</span> <span className="font-medium">{formData.contact}</span></div>

                        <div><span className="text-gray-500 block">วันที่เริ่มใช้งาน:</span> <span className="font-medium">{formData.usageDate}</span></div>
                        <div><span className="text-gray-500 block">ถึงวันที่:</span> <span className="font-medium">{formData.endDate || "-"}</span></div>
                        <div><span className="text-gray-500 block">เวลา:</span> <span className="font-medium">{formData.usageTime || "-"}</span></div>
                        <div><span className="text-gray-500 block">สถานที่:</span> <span className="font-medium">{formData.location}</span></div>
                        {formData.details && (
                            <div className="col-span-1 md:col-span-2"><span className="text-gray-500 block">รายละเอียดเพิ่มเติม:</span> <span className="font-medium">{formData.details}</span></div>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => router.push('/')}
                    className="bg-[#00b050] hover:bg-[#009040] text-white font-bold py-3 px-8 rounded-xl transition-colors"
                >
                    กลับสู่หน้าหลัก
                </button>

                <div className="w-full text-right mt-4 text-sm text-gray-400">
                    รายละเอียดเพิ่มเติม โทร.1711
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-2 md:space-y-4">
            {/* Equipment - Full Width */}
            <div>
                <label htmlFor="equipment" className="block text-base font-medium text-black mb-1">
                    รูปแบบ/อุปกรณ์
                </label>
                <input
                    type="text"
                    id="equipment"
                    value={formData.equipment}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Project - Full Width */}
            <div>
                <label htmlFor="project" className="block text-base font-medium text-black mb-1">
                    งาน/โครงการ
                </label>
                <input
                    type="text"
                    id="project"
                    value={formData.project}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-4">
                {/* User Name */}
                <div>
                    <label htmlFor="username" className="block text-base font-medium text-black mb-1">
                        ชื่อผู้ใช้งาน
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Department */}
                <div>
                    <label htmlFor="department" className="block text-base font-medium text-black mb-1">
                        สำนัก
                    </label>
                    <input
                        type="text"
                        id="department"
                        value={formData.department}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Location - Full Width */}
            <div>
                <label htmlFor="location" className="block text-base font-medium text-black mb-1">
                    สถานที่
                </label>
                <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-4">
                {/* Start Date */}
                <div>
                    <label htmlFor="usageDate" className="block text-base font-medium text-black mb-1">
                        วันที่เริ่มใช้งาน
                    </label>
                    <input
                        type="date"
                        id="usageDate"
                        value={formData.usageDate}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* End Date */}
                <div>
                    <label htmlFor="endDate" className="block text-base font-medium text-black mb-1">
                        ถึงวันที่
                    </label>
                    <input
                        type="date"
                        id="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-4">
                {/* Time */}
                <div>
                    <label htmlFor="usageTime" className="block text-base font-medium text-black mb-1">
                        เวลา
                    </label>
                    <input
                        type="text"
                        id="usageTime"
                        value={formData.usageTime}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Contact */}
                <div>
                    <label htmlFor="contact" className="block text-base font-medium text-black mb-1">
                        เบอร์ติดต่อ
                    </label>
                    <input
                        type="text"
                        id="contact"
                        value={formData.contact}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>



            {/* Additional Details - Full Width */}
            <div>
                <label htmlFor="details" className="block text-base font-medium text-black mb-1">
                    รายละเอียดเพิ่มเติม
                </label>
                <textarea
                    id="details"
                    rows={4}
                    value={formData.details}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mt-8">
                <button
                    type="submit"
                    disabled={loading}
                    className={`bg-[#00b050] hover:bg-[#009040] text-white font-bold py-3 px-12 rounded-xl text-lg transition-colors ${loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                >
                    {loading ? "กำลังบันทึก..." : "ยืนยัน"}
                </button>
            </div>
        </form>
    );
}
