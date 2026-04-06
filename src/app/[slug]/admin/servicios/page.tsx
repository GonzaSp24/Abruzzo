"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminLayout from "@/app/components/admin/AdminLayout";
import AdminTabs from "@/app/components/admin/AdminTabs";
import { Trash2, Plus, Edit2, Loader2, Check, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import Link from "next/link";

export default function GestionServicios() {
    const { slug } = useParams();
    const [services, setServices] = useState<any[]>([]);
    const [business, setBusiness] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Estados para la edición rápida
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ name: "", price: 0, duration_minutes: 0 });

    useEffect(() => {
        async function fetchData() {
            const { data: biz } = await supabase.from("businesses").select("*").eq("slug", slug).single();
            if (biz) {
                setBusiness(biz);
                const { data: srv } = await supabase
                    .from("services")
                    .select("*")
                    .eq("business_id", biz.id)
                    .order("name", { ascending: true });
                setServices(srv || []);
            }
            setLoading(false);
        }
        fetchData();
    }, [slug]);

    const deleteService = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este servicio?")) return;
        const { error } = await supabase.from("services").delete().eq("id", id);
        if (error) alert("Error al eliminar");
        else setServices(services.filter(s => s.id !== id));
    };

    const startEditing = (service: any) => {
        setEditingId(service.id);
        setEditForm({
            name: service.name,
            price: service.price,
            duration_minutes: service.duration_minutes
        });
    };

    const saveEdit = async (id: string) => {
        const { error } = await supabase
            .from("services")
            .update({
                name: editForm.name.trim(),
                price: editForm.price,
                duration_minutes: editForm.duration_minutes
            })
            .eq("id", id);

        if (error) {
            alert("Error al actualizar");
        } else {
            setServices(services.map(s => s.id === id ? { ...s, ...editForm } : s));
            setEditingId(null);
        }
    };

    if (loading || !business) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <AdminLayout business={business}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Servicios</h2>
                <Link href={`/${slug}/admin/servicios/nuevo`}>
                    <Button className="gap-2 bg-black text-white hover:bg-gray-800">
                        <Plus className="h-4 w-4" /> AGREGAR SERVICIO
                    </Button>
                </Link>
            </div>

            <AdminTabs />

            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b text-gray-500 uppercase text-[10px] tracking-wider">
                        <tr>
                            <th className="p-4 font-medium">Servicio</th>
                            <th className="p-4 font-medium">Precio</th>
                            <th className="p-4 font-medium">Duración</th>
                            <th className="p-4 font-medium text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {services.map((s) => (
                            <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                {editingId === s.id ? (
                                    // VISTA DE EDICIÓN
                                    <>
                                        <td className="p-2">
                                            <Input 
                                                value={editForm.name} 
                                                onChange={e => setEditForm({...editForm, name: e.target.value})}
                                                className="h-8 text-sm"
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Input 
                                                type="number"
                                                value={editForm.price} 
                                                onChange={e => setEditForm({...editForm, price: parseInt(e.target.value)})}
                                                className="h-8 text-sm w-24"
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Input 
                                                type="number"
                                                value={editForm.duration_minutes} 
                                                onChange={e => setEditForm({...editForm, duration_minutes: parseInt(e.target.value)})}
                                                className="h-8 text-sm w-20"
                                            />
                                        </td>
                                        <td className="p-2 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => saveEdit(s.id)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                                                    <Check className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:bg-gray-50 rounded">
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    // VISTA NORMAL
                                    <>
                                        <td className="p-4 font-semibold text-gray-900">{s.name}</td>
                                        <td className="p-4 text-gray-600">${s.price?.toLocaleString('es-AR')}</td>
                                        <td className="p-4 text-gray-600">{s.duration_minutes} min</td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button 
                                                    onClick={() => startEditing(s)}
                                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button 
                                                    onClick={() => deleteService(s.id)}
                                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}