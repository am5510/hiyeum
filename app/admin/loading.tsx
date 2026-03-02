import React from 'react';

export default function AdminLoading() {
    return (
        <div className="min-h-screen bg-gray-100 font-sans flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-24 h-24">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-[#0070f3] border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute top-2 left-2 w-20 h-20 border-4 border-[#50e3c2] border-t-transparent rounded-full animate-spin animate-reverse"></div>
                </div>
                <h2 className="text-xl font-semibold text-gray-700 mt-4 tracking-wider animate-pulse">กำลังโหลดข้อมูล...</h2>
                <p className="text-gray-500 text-sm">กรุณารอสักครู่</p>
            </div>
        </div>
    );
}
