
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Service = {
    id: string;
    name: string;
    order: number;
};

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await fetch("/api/services");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setServices(data);
        } catch (error) {
            console.error(error);
            alert("Failed to load services");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this service?")) return;

        try {
            const res = await fetch(`/api/services/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete");

            fetchServices(); // Refresh list
        } catch (error) {
            console.error(error);
            alert("Failed to delete service");
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100 font-sans p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">จัดการเมนู (Services)</h1>
                    <div className="space-x-4">
                        <Link
                            href="/admin"
                            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                        >
                            กลับ Dashboard
                        </Link>
                        <Link
                            href="/admin/services/new"
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                        >
                            เพิ่มเมนูใหม่
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="p-4 font-semibold text-gray-600">Order</th>
                                <th className="p-4 font-semibold text-gray-600">ID</th>
                                <th className="p-4 font-semibold text-gray-600">Name</th>
                                <th className="p-4 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-500">
                                        No services found.
                                    </td>
                                </tr>
                            ) : (
                                services.map((service) => (
                                    <tr key={service.id} className="border-b border-gray-100 hover:bg-gray-50 text-black">
                                        <td className="p-4">{service.order}</td>
                                        <td className="p-4 font-mono text-sm">{service.id}</td>
                                        <td className="p-4 font-bold">{service.name}</td>
                                        <td className="p-4 space-x-2">
                                            <Link
                                                href={`/admin/services/${service.id}/edit`}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(service.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
