"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function EditServiceForm({ id }: { id: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        image: "",
        order: 0,
    });

    useEffect(() => {
        fetchService();
    }, []);

    const fetchService = async () => {
        try {
            const res = await fetch(`/api/services/${id}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setFormData({
                name: data.name,
                image: data.image || "",
                order: data.order,
            });
        } catch (error) {
            console.error(error);
            alert("Failed to load service");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: id === "order" ? parseInt(value) || 0 : value,
        }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const { publicUrl } = await res.json();
            setFormData((prev) => ({ ...prev, image: publicUrl }));
        } catch (error) {
            console.error("Upload failed:", error);
            alert(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/services/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to update service");

            router.push("/admin/services");
        } catch (error) {
            console.error(error);
            alert("Failed to update service");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100 font-sans p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Service: {id}</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Service ID</label>
                        <input
                            type="text"
                            value={id}
                            disabled
                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 p-2 border text-gray-500 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Display Name</label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Cover Image</label>

                        <div className="mt-1 flex items-center gap-4">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={uploading}
                                className="block w-full text-sm text-gray-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-full file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-blue-50 file:text-blue-700
                                  hover:file:bg-blue-100"
                            />
                            {uploading && <span className="text-sm text-blue-500">Uploading...</span>}
                        </div>

                        {/* Fallback URL Input */}
                        <input
                            type="url"
                            id="image"
                            value={formData.image}
                            onChange={handleChange}
                            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-sm"
                            placeholder="Or paste image URL directly..."
                        />

                        {formData.image && (
                            <div className="mt-2 text-center">
                                <p className="text-sm text-gray-500 mb-1">Preview (1:1)</p>
                                <img
                                    src={formData.image}
                                    alt="Preview"
                                    className="w-32 h-32 object-cover rounded-lg border mx-auto"
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                            </div>
                        )}
                    </div>

                    <div className="hidden">
                        <label htmlFor="order" className="block text-sm font-medium text-gray-700">Order</label>
                        <input
                            type="number"
                            id="order"
                            value={formData.order}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        />
                    </div>

                    <div className="flex justify-end space-x-4 mt-6">
                        <Link
                            href="/admin/services"
                            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={saving || uploading}
                            className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded ${saving || uploading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {saving ? "Saving..." : "Update Service"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
