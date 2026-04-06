"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminLayout from "@/app/components/admin/AdminLayout";
import AdminTabs from "@/app/components/admin/AdminTabs";
// Agregamos Trash2 para el tachito de basura
import { Plus, Loader2, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";

export default function GestionBarberos() {
    const { slug } = useParams();
    const [barbers, setBarbers] = useState<any[]>([]);
    const [business, setBusiness] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const { data: biz } = await supabase.from("businesses").select("*").eq("slug", slug).single();
            if (biz) {
                setBusiness(biz);
                const { data: barbs } = await supabase
                    .from("barbers")
                    .select("*")
                    .eq("business_id", biz.id)
                    // MAGIA ACÁ: Solo traemos a los que están activos
                    .eq("is_active", true)
                    .order("name", { ascending: true });
                setBarbers(barbs || []);
            }
            setLoading(false);
        }
        fetchData();
    }, [slug]);

    // Cambiamos la función a "Eliminar" (aunque por atrás solo lo desactiva)
    const deleteBarber = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar a este barbero? Sus turnos en el historial se mantendrán guardados.")) return;

        const { error } = await supabase
            .from("barbers")
            .update({ is_active: false })
            .eq("id", id);

        if (error) {
            alert("Error al eliminar: " + error.message);
        } else {
            // Lo sacamos de la lista visualmente al instante
            setBarbers(barbers.filter(b => b.id !== id));
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
                <h2 className="text-2xl font-bold">Barberos</h2>
                <Link href={`/${slug}/admin/barberos/nuevo`}>
                    <Button className="gap-2 bg-black text-white hover:bg-gray-800">
                        <Plus className="h-4 w-4" /> AGREGAR BARBERO
                    </Button>
                </Link>
            </div>

            <AdminTabs />

            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b text-gray-500 uppercase text-[10px] tracking-wider">
                        <tr>
                            <th className="p-4 font-medium">Nombre</th>
                            <th className="p-4 font-medium">Rol</th>
                            {/* Chau columna Estado */}
                            <th className="p-4 font-medium text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {barbers.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-gray-400">
                                    No hay barberos registrados.
                                </td>
                            </tr>
                        ) : (
                            barbers.map((b) => (
                                <tr key={b.id} className="transition-colors hover:bg-gray-50">
                                    <td className="p-4 font-semibold text-gray-900 flex items-center gap-3">
                                        {b.photo_url ? (
                                            <img src={b.photo_url} alt={b.name} className="w-8 h-8 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-200" />
                                        )}
                                        {b.name}
                                    </td>
                                    <td className="p-4 text-gray-600">{b.role}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 items-center">
                                            <Link 
                                                href={`/${slug}/admin/barberos/${b.id}`} 
                                                className="p-2 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                title="Editar barbero"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Link>
                                            
                                            {/* Botón de Borrar */}
                                            <button 
                                                onClick={() => deleteBarber(b.id)}
                                                className="p-2 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                title="Eliminar barbero"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}