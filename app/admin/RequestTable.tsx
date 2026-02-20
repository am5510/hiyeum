
"use client";

import { useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { useSearchParams } from "next/navigation";

type BorrowRequest = {
    id: number;
    // ... other fields
    service: string;
    equipment: string;
    project: string | null;
    username: string;
    department: string;
    contact: string;
    lineId: string | null;
    usageDate: Date;
    endDate: Date | null;
    usageTime: string | null;
    location: string;
    details: string | null;
    status: string;
    attachFile: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export default function RequestTable({ requests }: { requests: BorrowRequest[] }) {
    const searchParams = useSearchParams();
    const [requestList, setRequestList] = useState(requests);
    const [selectedRequest, setSelectedRequest] = useState<BorrowRequest | null>(null);

    useEffect(() => {
        const idParam = searchParams.get("id");
        if (idParam) {
            const requestId = parseInt(idParam, 10);
            const foundRequest = requests.find(r => r.id === requestId);
            if (foundRequest) {
                setSelectedRequest(foundRequest);
            }
        }
    }, [searchParams, requests]);
    const [uploadingId, setUploadingId] = useState<number | null>(null);
    const [uploadModalId, setUploadModalId] = useState<number | null>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            setStream(mediaStream);
            setCameraActive(true);
            // Wait for state update and ref to be available
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            }, 100);
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตให้เข้าถึงกล้อง");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setCameraActive(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current && uploadModalId) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            // Limit resolution to FHD or HD to reduce file size
            const MAX_WIDTH = 1280;
            const scale = video.videoWidth > MAX_WIDTH ? MAX_WIDTH / video.videoWidth : 1;

            canvas.width = video.videoWidth * scale;
            canvas.height = video.videoHeight * scale;

            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], `camera-photo-${Date.now()}.jpg`, { type: "image/jpeg" });
                        handleFileUpload(uploadModalId, file);
                        stopCamera();
                        setUploadModalId(null);
                    }
                }, 'image/jpeg', 0.8);
            }
        }
    };

    const handleFileUpload = async (id: number, file: File) => {
        try {
            setUploadingId(id);
            const formData = new FormData();
            formData.append("file", file);

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) {
                const errorData = await uploadRes.json();
                throw new Error(errorData.error || "Upload failed");
            }

            const { publicUrl } = await uploadRes.json();

            // Update request with file URL
            const updateRes = await fetch("/api/borrow", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, attachFile: publicUrl }),
            });

            if (!updateRes.ok) {
                const errorData = await updateRes.json();
                throw new Error(errorData.error || "Failed to update request with file");
            }

            const updatedRequest = await updateRes.json();

            setRequestList((prev) =>
                prev.map((req) => (req.id === id ? { ...req, attachFile: publicUrl } : req))
            );

            if (selectedRequest && selectedRequest.id === id) {
                setSelectedRequest({ ...selectedRequest, attachFile: publicUrl });
            }

            alert("อัพโหลดไฟล์เรียบร้อยแล้ว");
        } catch (error) {

            console.error("Error uploading file:", error);
            alert(error instanceof Error ? error.message : "Failed to upload file");
        } finally {
            setUploadingId(null);
        }
    };

    const handleStatusChange = async (id: number, newStatus: string) => {
        try {
            const res = await fetch("/api/borrow", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: newStatus }),
            });

            if (!res.ok) throw new Error("Failed to update status");

            const updatedRequest = await res.json();

            setRequestList((prev) =>
                prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
            );

            if (selectedRequest && selectedRequest.id === id) {
                setSelectedRequest({ ...selectedRequest, status: newStatus });
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) return;

        try {
            const res = await fetch(`/api/borrow?id=${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to delete request");
            }

            setRequestList((prev) => prev.filter((req) => req.id !== id));
            if (selectedRequest?.id === id) setSelectedRequest(null);

            alert("ลบรายการเรียบร้อยแล้ว");
        } catch (error) {
            console.error("Error deleting request:", error);
            alert(error instanceof Error ? error.message : "Failed to delete request");
        }
    };

    const handleDownloadPDF = async () => {
        const input = document.getElementById("request-detail-modal");
        if (!input) return;

        try {
            // Pre-process image: Convert to Base64
            const img = input.querySelector("img");
            let originalSrc = "";
            let originalCrossOrigin = null;

            if (img && img.src) {
                try {
                    originalSrc = img.src;
                    originalCrossOrigin = img.getAttribute("crossOrigin");

                    const response = await fetch(img.src);
                    if (!response.ok) throw new Error("Failed to fetch image");
                    const blob = await response.blob();
                    const base64 = await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.readAsDataURL(blob);
                    });

                    img.src = base64;
                    // Remove crossOrigin for base64
                    img.removeAttribute("crossOrigin");
                } catch (imgError) {
                    console.error("Error processing image for PDF:", imgError);
                    // Hide image if it fails to load
                    img.style.display = "none";
                }
            }

            const dataUrl = await toPng(input, { backgroundColor: "#ffffff" });

            // Restore original src and style
            if (img) {
                if (originalSrc) img.src = originalSrc;
                if (originalCrossOrigin) img.setAttribute("crossOrigin", originalCrossOrigin);
                img.style.display = "";
            }

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`request-${selectedRequest?.id}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert(`เกิดข้อผิดพลาดในการสร้าง PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    };

    const STATUS_OPTIONS = [
        { value: "pending", label: "รออนุมัติ", className: "bg-yellow-100 text-yellow-800" },
        { value: "approved", label: "อนุมัติแล้ว", className: "bg-green-100 text-green-800" },
        { value: "return_pending", label: "รอคืนสินค้า", className: "bg-orange-100 text-orange-800" },
        { value: "returned", label: "คืนแล้ว", className: "bg-pink-100 text-pink-800" },
    ];

    const [searchTerm, setSearchTerm] = useState("");

    const filteredRequests = requestList.filter((req) => {
        const term = searchTerm.toLowerCase();
        return (
            req.equipment.toLowerCase().includes(term) ||
            req.username.toLowerCase().includes(term)
        );
    });

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200">
                <div className="relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="ค้นหาด้วยชื่ออุปกรณ์ หรือ ผู้ขอใช้..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="p-4 font-semibold text-gray-600">ID</th>
                            <th className="p-4 font-semibold text-gray-600">บริการ</th>
                            <th className="p-4 font-semibold text-gray-600">รูปแบบ/อุปกรณ์</th>
                            <th className="p-4 font-semibold text-gray-600">ผู้ขอใช้</th>
                            <th className="p-4 font-semibold text-gray-600">วันที่ใช้งาน</th>
                            <th className="p-4 font-semibold text-gray-600">สถานะ</th>
                            <th className="p-4 font-semibold text-gray-600">วันที่ทำรายการ</th>
                            <th className="p-4 font-semibold text-gray-600 text-center">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRequests.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="p-8 text-center text-gray-500">
                                    ไม่มีข้อมูลการยืม
                                </td>
                            </tr>
                        ) : (
                            filteredRequests.map((req) => (
                                <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50 text-black transition-colors">
                                    <td className="p-4 text-gray-500">#{req.id}</td>
                                    <td className="p-4">{req.service}</td>
                                    <td className="p-4">{req.equipment}</td>
                                    <td className="p-4">
                                        <div>{req.username}</div>
                                    </td>
                                    <td className="p-4">
                                        {new Date(req.usageDate).toLocaleDateString("th-TH")}
                                    </td>
                                    <td className="p-4">
                                        <select
                                            value={req.status}
                                            onChange={(e) => handleStatusChange(req.id, e.target.value)}
                                            className={`px-2 py-1 rounded text-xs font-semibold border-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${STATUS_OPTIONS.find((o) => o.value === req.status)?.className || "bg-gray-100 text-gray-800"
                                                }`}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {STATUS_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {new Date(req.createdAt).toLocaleString("th-TH")}
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => setSelectedRequest(req)}
                                                className="text-orange-500 hover:text-orange-600 transition-colors bg-orange-50 hover:bg-orange-100 p-2 rounded-full"
                                                title="ดูรายละเอียด"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </button>
                                            {req.attachFile ? (
                                                <a
                                                    href={req.attachFile}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-green-600 hover:text-green-800 transition-colors bg-green-50 hover:bg-green-100 p-2 rounded-full"
                                                    title="ดูไฟล์แนบ"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </a>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setUploadModalId(req.id);
                                                    }}
                                                    className="text-gray-500 hover:text-green-600 transition-colors bg-gray-100 hover:bg-green-50 p-2 rounded-full"
                                                    title="อัพโหลดรูปภาพ"
                                                    disabled={uploadingId === req.id}
                                                >
                                                    {uploadingId === req.id ? (
                                                        <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(req.id);
                                                }}
                                                className="text-red-500 hover:text-red-700 transition-colors bg-red-50 hover:bg-red-100 p-2 rounded-full"
                                                title="ลบรายการ"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Upload Option Modal */}
            {uploadModalId && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 p-6">
                        {cameraActive ? (
                            <div className="flex flex-col gap-4">
                                <h3 className="text-lg font-bold text-gray-800 text-center">ถ่ายภาพ</h3>
                                <div className="relative aspect-[3/4] bg-black rounded-lg overflow-hidden">
                                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                    <canvas ref={canvasRef} className="hidden" />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={stopCamera}
                                        className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        onClick={capturePhoto}
                                        className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        ถ่ายเลย
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">เลือกวิธีการอัพโหลด</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={startCamera}
                                        className="flex flex-col items-center justify-center gap-2 p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-all"
                                    >
                                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <span className="font-medium text-gray-700">ถ่ายภาพ</span>
                                    </button>

                                    <label className="flex flex-col items-center justify-center gap-2 p-4 border rounded-lg hover:bg-green-50 hover:border-green-200 cursor-pointer transition-all">
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    handleFileUpload(uploadModalId, file);
                                                    setUploadModalId(null);
                                                }
                                            }}
                                        />
                                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <span className="font-medium text-gray-700">เลือกรูปภาพ</span>
                                    </label>
                                </div>
                                <button
                                    onClick={() => setUploadModalId(null)}
                                    className="w-full mt-4 py-2 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    ยกเลิก
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">รายละเอียดคำขอ #{selectedRequest.id}</h3>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Body */}
                        <div id="request-detail-modal" className="p-6 md:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                            {/* Status Banner */}
                            <div className={`flex items-center gap-3 p-4 rounded-lg border ${selectedRequest.status === "pending" ? "bg-yellow-50 border-yellow-100 text-yellow-800" :
                                selectedRequest.status === "approved" ? "bg-green-50 border-green-100 text-green-800" :
                                    "bg-gray-50 border-gray-100 text-gray-800"
                                }`}>
                                <div className={`w-2 h-2 rounded-full ${selectedRequest.status === "pending" ? "bg-yellow-500" :
                                    selectedRequest.status === "approved" ? "bg-green-500" :
                                        "bg-gray-500"
                                    }`}></div>
                                <span className="font-semibold text-lg">
                                    สถานะ: {selectedRequest.status === "pending" ? "รออนุมัติ" : selectedRequest.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {/* Service Info */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-500 uppercase text-xs tracking-wider border-b pb-2">ข้อมูลกการให้บริการ</h4>
                                    <div>
                                        <label className="text-sm text-gray-500 block mb-1">ประเภทบริการ</label>
                                        <div className="font-medium text-gray-900">{selectedRequest.service}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 block mb-1">รูปแบบ/อุปกรณ์</label>
                                        <div className="font-medium text-gray-900">{selectedRequest.equipment}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 block mb-1">งาน/โครงการ</label>
                                        <div className="font-medium text-gray-900">{selectedRequest.project || "-"}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 block mb-1">วันที่ใช้งาน</label>
                                        <div className="font-medium text-gray-900">
                                            {new Date(selectedRequest.usageDate).toLocaleDateString("th-TH", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            {selectedRequest.endDate && ` - ${new Date(selectedRequest.endDate).toLocaleDateString("th-TH", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 block mb-1">เวลา</label>
                                        <div className="font-medium text-gray-900">{selectedRequest.usageTime || "-"}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 block mb-1">สถานที่</label>
                                        <div className="font-medium text-gray-900">{selectedRequest.location}</div>
                                    </div>
                                </div>

                                {/* User Info */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-500 uppercase text-xs tracking-wider border-b pb-2">ข้อมูลผู้ขอใช้</h4>
                                    <div>
                                        <label className="text-sm text-gray-500 block mb-1">ชื่อ-นามสกุล</label>
                                        <div className="font-medium text-gray-900">{selectedRequest.username}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 block mb-1">หน่วยงาน/สำนัก</label>
                                        <div className="font-medium text-gray-900">{selectedRequest.department}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 block mb-1">เบอร์ติดต่อ</label>
                                        <div className="font-medium text-gray-900">{selectedRequest.contact}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 block mb-1">Line ID</label>
                                        <div className="font-medium text-gray-900">{selectedRequest.lineId || "-"}</div>
                                    </div>
                                </div>

                                {/* Additional details */}
                                {selectedRequest.details && (
                                    <div className="col-span-1 md:col-span-2 space-y-2 mt-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <label className="text-sm text-gray-500 block font-medium">รายละเอียดเพิ่มเติม</label>
                                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedRequest.details}</p>
                                    </div>
                                )}

                                {/* Attached File */}
                                {selectedRequest.attachFile && (
                                    <div className="col-span-1 md:col-span-2 space-y-2 mt-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <label className="text-sm text-gray-500 block font-medium">ไฟล์แนบ</label>
                                        <div className="relative aspect-video w-full max-w-md mx-auto rounded-lg overflow-hidden border border-gray-200">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={`/api/image-proxy?url=${encodeURIComponent(selectedRequest.attachFile)}`}
                                                alt="Attached file"
                                                crossOrigin="anonymous"
                                                className="object-contain w-full h-full bg-black/5"
                                            />
                                        </div>
                                        <a
                                            href={selectedRequest.attachFile}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 text-sm hover:underline block text-center mt-2"
                                        >
                                            เปิดดูไฟล์ต้นฉบับ
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Metadata */}
                            <div className="border-t pt-6 flex flex-col sm:flex-row justify-between text-xs text-gray-400 gap-2">
                                <div>Created: {new Date(selectedRequest.createdAt).toLocaleString("th-TH")}</div>
                                <div>Last Updated: {new Date(selectedRequest.updatedAt).toLocaleString("th-TH")}</div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                            <button
                                onClick={handleDownloadPDF}
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                บันทึก PDF
                            </button>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                ปิดหน้าต่าง
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
