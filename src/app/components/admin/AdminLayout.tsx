"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
    children,
    business,
}: {
    children: React.ReactNode;
    business: any;
}) {
    const router = useRouter();
    const { slug } = useParams();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            // Verificamos si hay un usuario logueado en Supabase
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                // Si no hay sesión, lo pateamos a la pantalla de login
                router.push(`/${slug}/admin/login`);
            } else {
                // Si está logueado, le permitimos ver el contenido
                setIsChecking(false);
            }
        };
        checkAuth();
    }, [router, slug]);

    // Función para cerrar sesión
    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push(`/${slug}/admin/login`);
    };

    // Mientras verifica la sesión, mostramos una pantalla de carga para que no "parpadee" el panel
    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="border-b bg-white px-8 py-4 flex justify-between items-center">
                <h1 className="font-semibold text-lg" style={{ fontFamily: "var(--font-serif)" }}>
                    {business?.name || "Cargando..."} — Admin
                </h1>
                <button 
                    onClick={handleLogout}
                    className="text-sm bg-gray-100 px-4 py-1.5 rounded-md font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                >
                    Salir
                </button>
            </header>
            
            <main className="p-8 max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    );
}