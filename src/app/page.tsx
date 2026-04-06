"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// UI Lovable
import Hero from "@/app/components/landing/Hero";
import Services from "@/app/components/landing/Services";
import Team from "@/app/components/landing/Team";
import Navbar from "@/app/components/landing/Navbar";
import Footer from "@/app/components/landing/Footer";

export default function BusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [business, setBusiness] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [slug]);

  async function loadData() {
    // negocio
    const { data: businessData } = await supabase
      .from("businesses")
      .select("*")
      .eq("slug", slug)
      .single();

    if (!businessData) return;

    setBusiness(businessData);

    // servicios
    const { data: servicesData } = await supabase
      .from("services")
      .select("*")
      .eq("business_id", businessData.id);

    setServices(servicesData || []);

    // barberos
    const { data: barbersData } = await supabase
      .from("barbers")
      .select("*")
      .eq("business_id", businessData.id);

    setBarbers(barbersData || []);
  }

  if (!business) {
    return <div className="p-10">Cargando...</div>;
  }

  return (
    <main className="bg-white text-black">

      <Navbar onReservar={() => {}} />

      {/* HERO */}
      <Hero
        onReservar={() => {}}
        businessName={business.name}
      />

      {/* SERVICIOS */}
      <Services services={services} />

      {/* TEAM */}
      <Team barbers={barbers} />

      {/* CTA */}
      <div className="text-center py-10">
        <a
          href={`/${slug}/reservar`}
          className="bg-black text-white px-6 py-3 rounded-lg"
        >
          Reservar turno
        </a>
      </div>

      <Footer />
    
    </main>
  );
}
