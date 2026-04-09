"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import AdminLayout from "@/app/components/admin/AdminLayout";
import AdminTabs from "@/app/components/admin/AdminTabs";
import StatCard from "@/app/components/admin/StatCard";
import { format } from "date-fns";
import { Check, X, Loader2, History, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = use(params);
    const [business, setBusiness] = useState<any>(null);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // ESTADO: Para alternar entre historial y próximos
    const [verHistorial, setVerHistorial] = useState(false);

    const fetchDashboardData = async () => {
        const { data: biz } = await supabase
            .from("businesses")
            .select("*")
            .eq("slug", slug)
            .single();

        if (biz) {
            setBusiness(biz);
            const { data: apts } = await supabase
                .from("appointments")
                .select(`*, barbers (name), services (name)`)
                .eq("business_id", biz.id)
                .order("appointment_date", { ascending: true })
                .order("appointment_time", { ascending: true });

            setAppointments(apts || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDashboardData();
    }, [slug]);

    const updateStatus = async (id: string, newStatus: string) => {
        const statusValue = newStatus.toUpperCase();
        
        const { error } = await supabase
            .from("appointments")
            .update({ status: statusValue })
            .eq("id", id);

        if (error) {
            alert("Error al actualizar");
        } else {
            setAppointments(appointments.map(apt => 
                apt.id === id ? { ...apt, status: statusValue } : apt
            ));
        }
    };

    const hoyStr = format(new Date(), "yyyy-MM-dd");
    const cleanStatus = (status: string) => status?.replace(/'/g, "").trim().toLowerCase() || "";

    // SEPARAMOS LOS TURNOS
    const turnosFuturos = appointments.filter(apt => apt.appointment_date >= hoyStr);
    const turnosPasados = appointments.filter(apt => apt.appointment_date < hoyStr);
    
    // Lo que se muestra en la tabla depende del botón
    const turnosAMostrar = verHistorial ? turnosPasados : turnosFuturos;

    // CONTADORES ARREGLADOS
    const stats = {
        proximos: turnosFuturos.filter(a => cleanStatus(a.status) !== "cancelado").length,
        hoy: appointments.filter(a => a.appointment_date === hoyStr && cleanStatus(a.status) !== "cancelado").length,
        pendientes: turnosFuturos.filter(a => cleanStatus(a.status) === "pendiente").length
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
    );

    return (
        <AdminLayout business={business}>
            <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
            <AdminTabs />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Próximos Turnos" value={stats.proximos} />
                <StatCard title="Turnos de Hoy" value={stats.hoy} />
                <StatCard title="Pendientes" value={stats.pendientes} />
            </div>

            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-700">
                        {verHistorial ? "Historial de Turnos (Pasados)" : "Listado de Turnos (Próximos)"}
                    </h3>
                    <button 
                        onClick={() => setVerHistorial(!verHistorial)}
                        className="flex items-center gap-2 text-sm px-3 py-1.5 bg-white border rounded-md hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        {verHistorial ? (
                            <><CalendarDays className="h-4 w-4" /> Ver Próximos</>
                        ) : (
                            <><History className="h-4 w-4" /> Ver Historial</>
                        )}
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="p-4 font-medium">Fecha</th>
                                <th className="p-4 font-medium">Hora</th>
                                <th className="p-4 font-medium">Cliente</th>
                                <th className="p-4 font-medium">Barbero</th>
                                <th className="p-4 font-medium">Servicio</th>
                                <th className="p-4 font-medium">Estado</th>
                                <th className="p-4 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {turnosAMostrar.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-400">
                                        No hay turnos {verHistorial ? "en el historial" : "próximos"}.
                                    </td>
                                </tr>
                            ) : (
                                turnosAMostrar.map((apt) => {
                                    let status = cleanStatus(apt.status);
                                    
                                    const esViejo = apt.appointment_date < hoyStr;
                                    if (esViejo && status === "confirmado") {
                                        status = "completado";
                                    }

                                    return (
                                        <tr key={apt.id} className={cn("hover:bg-gray-50 transition-colors", esViejo && "opacity-75")}>
                                            <td className="p-4">{apt.appointment_date}</td>
                                            <td className="p-4 font-semibold text-gray-900">{apt.appointment_time.slice(0, 5)} hs</td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{apt.client_name}</span>
                                                    <span className="text-xs text-gray-400">{apt.client_phone}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-600">{apt.barbers?.name}</td>
                                            <td className="p-4 text-gray-600">{apt.services?.name}</td>
                                            <td className="p-4">
                                                <span className={cn(
                                                    "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                                                    status === "pendiente" ? "bg-orange-100 text-orange-600" : 
                                                    status === "confirmado" ? "bg-green-100 text-green-600" : 
                                                    status === "completado" ? "bg-blue-100 text-blue-600" : 
                                                    "bg-red-100 text-red-600"
                                                )}>
                                                    {status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                {(!esViejo && status !== "cancelado") ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => updateStatus(apt.id, 'confirmado')}
                                                            className="p-1 hover:bg-green-50 text-green-600 rounded border transition-all"
                                                            title="Confirmar"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => updateStatus(apt.id, 'cancelado')}
                                                            className="p-1 hover:bg-red-50 text-red-600 rounded border transition-all"
                                                            title="Cancelar"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}