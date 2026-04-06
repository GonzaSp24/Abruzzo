"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Loader2 } from "lucide-react";

export default function AdminLogin() {
    const { slug } = useParams();
    const router = useRouter();
    const [business, setBusiness] = useState<any>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function getBiz() {
            const { data } = await supabase.from("businesses").select("*").eq("slug", slug).single();
            if (data) setBusiness(data);
        }
        getBiz();
    }, [slug]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Autenticación con Supabase
        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError("Credenciales incorrectas.");
            setLoading(false);
        } else {
            // Si el login es exitoso, lo mandamos al dashboard
            router.push(`/${slug}/admin`);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                <h1 className="text-3xl font-semibold mb-2" style={{ fontFamily: "var(--font-serif)" }}>
                    {business?.name || "Cargando..."}
                </h1>
                <p className="text-sm text-gray-500 mb-8">Panel de Administración</p>

                <form onSubmit={handleLogin} className="space-y-4 text-left">
                    {error && (
                        <p className="text-red-600 text-sm text-center bg-red-50 py-2 rounded border border-red-100">
                            {error}
                        </p>
                    )}
                    <div>
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-gray-50"
                        />
                    </div>
                    <div>
                        <Input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-gray-50"
                        />
                    </div>
                    <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "INGRESAR"}
                    </Button>
                </form>
            </div>
        </div>
    );
}