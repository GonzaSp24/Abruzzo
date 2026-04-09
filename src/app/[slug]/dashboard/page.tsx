"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// UI components (los que creamos antes)
import AdminLayout from "@/app/components/admin/AdminLayout";
import AdminTabs from "@/app/components/admin/AdminTabs";
import StatCard from "@/app/components/admin/StatCard";

export default function DashboardPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = use(params);
    
    const [business, setBusiness] = useState<any>(null);
    const [barbers, setBarbers] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    
    const today = new Date().toISOString().split("T")[0];
    
    const times = [
        "09:00",
        "09:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "12:00",
        "12:30",
        "13:00",
        "13:30",
        "14:00",
        "14:30",
        "15:00",
    ];
    
    useEffect(() => {
        loadData();
    }, [slug]);
    
    async function loadData() {
        // negocio
        const { data: business } = await supabase
        .from("businesses")
        .select("*")
        .eq("slug", slug)
        .single();
        
        if (!business) return;
        
        setBusiness(business);
        
        // barberos
        const { data: barbers } = await supabase
        .from("barbers")
        .select("*")
        .eq("business_id", business.id);
        
        setBarbers(barbers || []);
        
        // turnos
        const { data } = await supabase
        .from("appointments")
        .select(`
        id,
        appointment_time,
        client_name,
        services(name),
        barber_id
        `)
            .eq("business_id", business.id)
            .eq("appointment_date", today)
            .neq("status", "CANCELADO");
            
            setAppointments(data || []);
        }
        
        async function cancelAppointment(id: string) {
            const confirmCancel = confirm("¿Cancelar turno?");
            if (!confirmCancel) return;
            
            // CAMBIO ACÁ: Actualizamos el estado a 'CANCELADO'
            await supabase
                .from("appointments")
                .update({ status: 'CANCELADO' })
                .eq("id", id);
            
            loadData();
        }
        
        function findAppointment(barberId: string, time: string) {
            return appointments.find(
                (a) =>
                    a.barber_id === barberId &&
                a.appointment_time.slice(0, 5) === time
            );
        }
        
        if (!business) {
            return <div className="p-10">Cargando...</div>;
        }
        
        return (
            <AdminLayout business={business}>
            
            {/* Tabs */}
            <AdminTabs />
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <StatCard title="Hoy" value={appointments.length} />
            <StatCard title="Esta semana" value={appointments.length} />
            <StatCard title="Pendientes" value={appointments.length} />
            <StatCard title="Completados" value={0} />
            </div>
            
            {/* Agenda */}
            <div className="bg-white rounded-xl border p-6">
            
            <h2 className="text-xl font-semibold mb-6">
            Agenda del día
            </h2>
            
            <div className="overflow-x-auto">
            
            <table className="w-full border-collapse">
            
            <thead>
            <tr>
            <th className="border p-3 text-left">Hora</th>
            
            {barbers.map((barber) => (
                <th
                key={barber.id}
                className="border p-3 text-center"
                >
                {barber.name}
                </th>
            ))}
            </tr>
            </thead>
            
            <tbody>
            
            {times.map((time) => (
                <tr key={time}>
                
                <td className="border p-3 font-semibold">
                {time}
                </td>
                
                {barbers.map((barber) => {
                    const appointment = findAppointment(
                        barber.id,
                        time
                    );
                    
                    return (
                        <td
                        key={barber.id}
                        className="border p-3 text-center"
                        >
                        
                        {appointment ? (
                            <div className="bg-gray-100 rounded-lg p-2">
                            
                            <p className="font-semibold">
                            {appointment.client_name}
                            </p>
                            
                            <p className="text-xs text-gray-500">
                            {appointment.services?.name}
                            </p>
                            
                            <button
                            onClick={() =>
                                cancelAppointment(appointment.id)
                            }
                            className="text-red-500 text-xs mt-1"
                            >
                            cancelar
                            </button>
                            
                            </div>
                        ) : (
                            <span className="text-gray-300">
                            libre
                            </span>
                        )}
                        
                        </td>
                    );
                })}
                
                </tr>
            ))}
            
            </tbody>
            
            </table>
            
            </div>
            
            </div>
            
            </AdminLayout>
        );
    }
    