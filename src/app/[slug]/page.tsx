"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import Navbar from "@/app/components/landing/Navbar";
import Hero from "@/app/components/landing/Hero";
import Services from "@/app/components/landing/Services";
import Team from "@/app/components/landing/Team";
import Footer from "@/app/components/landing/Footer";

export default function BusinessPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = use(params);
    const router = useRouter();
    
    const [business, setBusiness] = useState<any>(null);
    const [services, setServices] = useState<any[]>([]);
    const [barbers, setBarbers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        loadData();
    }, [slug]);
    
    async function loadData() {
        setLoading(true);
        
        const { data: businessData } = await supabase
            .from("businesses")
            .select("*")
            .eq("slug", slug)
            .single();
        
        if (!businessData) {
            setLoading(false);
            return;
        }
        
        setBusiness(businessData);
        
        const { data: servicesData } = await supabase
            .from("services")
            .select("*")
            .eq("business_id", businessData.id);
        
        const { data: barbersData } = await supabase
            .from("barbers")
            .select("*")
            .eq("business_id", businessData.id)
            .eq("is_active", true);
        
        setServices(servicesData || []);
        setBarbers(barbersData || []);
        setLoading(false);
    }
    
    if (loading) return <div className="p-10 flex justify-center items-center h-screen">Cargando...</div>;
    if (!business) return <div className="p-10">Negocio no encontrado</div>;
    
    return (
        <main className="bg-background text-foreground">
            {/* 1. Le pasamos 'business' como prop a los componentes */}
            <Navbar onReservar={() => router.push(`/${slug}/reservar`)} business={business} />
            
            <Hero
                onReservar={() => router.push(`/${slug}/reservar`)}
                business={business}
            />
            
            <Services services={services} />
            
            <Team barbers={barbers} />
            
            {/* También se lo podés pasar al Footer si querés usar el logo ahí abajo */}
            <Footer business={business} />
            
            {/* 2. Acá aplicamos el inline style para el color de fondo dinámico */}
            <button
                onClick={() => router.push(`/${slug}/reservar`)}
                className="fixed bottom-6 right-6 text-white px-6 py-3 rounded-full shadow-lg hover:scale-105 transition z-50 font-medium"
                style={{ backgroundColor: business.primary_color || '#111827' }}
            >
                Reservar
            </button>
        </main>
    );
}