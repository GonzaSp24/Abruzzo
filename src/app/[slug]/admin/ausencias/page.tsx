"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminLayout from "@/app/components/admin/AdminLayout";
import AdminTabs from "@/app/components/admin/AdminTabs";
import { format } from "date-fns";
import { X, Loader2, CalendarX2 } from "lucide-react";
import { Input } from "@/app/components/ui/input";

export default function AusenciasPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [business, setBusiness] = useState<any>(null);
    const [barbers, setBarbers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // El "objetivo" puede ser 'ALL' (Local completo) o el ID de un barbero
    const [selectedTarget, setSelectedTarget] = useState<string>("ALL");
    const [currentBlockedDays, setCurrentBlockedDays] = useState<string[]>([]);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const { data: biz } = await supabase.from("businesses").select("*").eq("slug", slug).single();
            if (biz) {
                setBusiness(biz);
                const { data: b } = await supabase.from("barbers").select("*").eq("business_id", biz.id).eq("is_active", true);
                setBarbers(b || []);
                
                // Por defecto cargamos los del local
                setCurrentBlockedDays(biz.blocked_days || []);
            }
            setLoading(false);
        }
        loadData();
    }, [slug]);

    // Cuando cambian el select, cargamos los días de ese objetivo
    useEffect(() => {
        if (!business) return;
        if (selectedTarget === "ALL") {
            setCurrentBlockedDays(business.blocked_days || []);
        } else {
            const barber = barbers.find(b => b.id === selectedTarget);
            setCurrentBlockedDays(barber?.blocked_days || []);
        }
    }, [selectedTarget, business, barbers]);

    const toggleBlockedDay = async (date: string) => {
        if (!business || !business.id) return; 

        let newDays = [...currentBlockedDays];
        if (newDays.includes(date)) {
            newDays = newDays.filter(d => d !== date);
        } else {
            newDays.push(date);
        }

        if (selectedTarget === "ALL") {
            const { error } = await supabase.from("businesses").update({ blocked_days: newDays }).eq("id", business.id);
            if (!error) {
                setCurrentBlockedDays(newDays);
                setBusiness({ ...business, blocked_days: newDays });
            }
        } else {
            const { error } = await supabase.from("barbers").update({ blocked_days: newDays }).eq("id", selectedTarget);
            if (!error) {
                setCurrentBlockedDays(newDays);
                setBarbers(barbers.map(b => b.id === selectedTarget ? { ...b, blocked_days: newDays } : b));
            }
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;

    return (
        <AdminLayout business={business}>
            <h2 className="text-2xl font-bold mb-6">Feriados y Ausencias</h2>
            <AdminTabs />

            <div className="bg-white p-6 border rounded-xl shadow-sm max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-red-100 rounded-lg text-red-600">
                        <CalendarX2 className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Bloquear Fechas</h3>
                        <p className="text-sm text-gray-500">Cerrá el local completo por feriados, o dale el día libre a un barbero específico.</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">¿A quién aplica?</label>
                        <select 
                            className="w-full border rounded-md p-2 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-gray-200"
                            value={selectedTarget}
                            onChange={(e) => setSelectedTarget(e.target.value)}
                        >
                            <option value="ALL">🏢 Todo el Local (Feriado)</option>
                            {barbers.map(b => (
                                <option key={b.id} value={b.id}>✂️ Solo {b.name} (Viaje / Franco)</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Seleccionar Día</label>
                        <Input 
                            type="date" 
                            className="w-full"
                            onChange={(e) => {
                                if(e.target.value) {
                                    toggleBlockedDay(e.target.value);
                                    e.target.value = ''; 
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Fechas bloqueadas para: {selectedTarget === "ALL" ? "Todo el local" : barbers.find(b => b.id === selectedTarget)?.name}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {currentBlockedDays.length === 0 && <span className="text-sm text-gray-400 italic">No hay días bloqueados.</span>}
                        {currentBlockedDays.map(day => (
                            <span key={day} className="bg-red-100 text-red-600 px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2 transition-all hover:bg-red-200">
                                {format(new Date(`${day}T00:00:00`), "dd/MM/yyyy")}
                                <X className="h-4 w-4 cursor-pointer hover:text-red-800" onClick={() => toggleBlockedDay(day)} />
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}