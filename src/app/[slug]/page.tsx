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
        
        // ACÁ ESTÁ EL CAMBIO: Filtramos solo los barberos activos
        const { data: barbersData } = await supabase
            .from("barbers")
            .select("*")
            .eq("business_id", businessData.id)
            .eq("is_active", true);
        
        setServices(servicesData || []);
        setBarbers(barbersData || []);
        setLoading(false);
    }
    
    if (loading) return <div className="p-10">Cargando...</div>;
    if (!business) return <div className="p-10">Negocio no encontrado</div>;
    
    return (
        <main className="bg-background text-foreground">
            <Navbar onReservar={() => router.push(`/${slug}/reservar`)} />
            
            <Hero
                onReservar={() => router.push(`/${slug}/reservar`)}
                businessName={business.name}
            />
            
            <Services services={services} />
            
            <Team barbers={barbers} />
            
            <Footer />
            
            <button
                onClick={() => router.push(`/${slug}/reservar`)}
                className="fixed bottom-6 right-6 bg-black text-white px-6 py-3 rounded-full shadow-lg hover:scale-105 transition z-50"
            >
                Reservar
            </button>
        </main>
    );
}