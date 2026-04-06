"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminLayout from "@/app/components/admin/AdminLayout";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function NuevoServicio() {
    const { slug } = useParams();
    const router = useRouter();
    const [business, setBusiness] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [duration, setDuration] = useState("30");

    useEffect(() => {
        async function getBiz() {
            const { data } = await supabase.from("businesses").select("*").eq("slug", slug).single();
            if (data) setBusiness(data);
        }
        getBiz();
    }, [slug]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!business?.id) return;
        setLoading(true);

        const { error } = await supabase.from("services").insert({
            business_id: business.id,
            name: name.trim(),
            price: parseInt(price),
            duration_minutes: parseInt(duration),
        });

        setLoading(false);
        if (error) alert("Error al guardar");
        else router.push(`/${slug}/admin/servicios`);
    };

    return (
        <AdminLayout business={business}>
            <div className="max-w-2xl mx-auto">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <ArrowLeft className="h-4 w-4" /> Volver
                </button>
                <h2 className="text-3xl font-bold mb-8">Nuevo Servicio</h2>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 border rounded-xl">
                    <div>
                        <label className="block text-sm font-medium mb-2">Nombre del Servicio</label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Corte + Barba" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Precio ($)</label>
                            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="7500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Duración (min)</label>
                            <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="30" required />
                        </div>
                    </div>
                    <Button type="submit" className="w-full bg-black text-white" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "CREAR SERVICIO"}
                    </Button>
                </form>
            </div>
        </AdminLayout>
    );
}