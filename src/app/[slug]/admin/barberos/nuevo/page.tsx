"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminLayout from "@/app/components/admin/AdminLayout";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function NuevoBarbero() {
    const { slug } = useParams();
    const router = useRouter();
    const [business, setBusiness] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [fetchingBiz, setFetchingBiz] = useState(true);
    
    const [name, setName] = useState("");
    const [role, setRole] = useState("Barbero");
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        async function getBiz() {
            setFetchingBiz(true);
            const { data } = await supabase.from("businesses").select("*").eq("slug", slug).single();
            if (data) setBusiness(data);
            setFetchingBiz(false);
        }
        getBiz();
    }, [slug]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) {
                alert("La imagen es muy pesada (máximo 2MB)");
                e.target.value = "";
                return;
            }
            setImageFile(file);
        }
    };

    // ACÁ AGREGAMOS EL <HTMLFormElement> PARA QUE TYPESCRIPT NO LLORE
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!business?.id) return;
        setLoading(true);

        let finalPhotoUrl = null;

        // 1. Subir imagen si existe
        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${business.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('barberos')
                .upload(filePath, imageFile);

            if (uploadError) {
                // AHORA TE VA A DECIR EXACTAMENTE QUÉ FALLÓ
                alert("Error de Storage al subir imagen: " + uploadError.message);
                setLoading(false);
                return;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('barberos')
                .getPublicUrl(filePath);
            
            finalPhotoUrl = publicUrl;
        }

        // 2. Guardar en la tabla
        const { error } = await supabase.from("barbers").insert({
            business_id: business.id,
            name: name.trim(),
            role: role.trim(),
            photo_url: finalPhotoUrl,
            is_active: true // Lo creamos como activo por defecto
        });

        setLoading(false);
        if (error) {
            alert("Error de Base de Datos al guardar: " + error.message);
        } else {
            router.push(`/${slug}/admin/barberos`);
            router.refresh(); // Forzamos actualización de la lista
        }
    };

    if (fetchingBiz) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-gray-400" /></div>;

    return (
        <AdminLayout business={business}>
            <div className="max-w-2xl mx-auto">
                <button onClick={() => router.push(`/${slug}/admin/barberos`)} className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <ArrowLeft className="h-4 w-4" /> Volver
                </button>
                <h2 className="text-3xl font-bold mb-8">Nuevo Barbero</h2>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 border rounded-xl">
                    <div>
                        <label className="block text-sm font-medium mb-2">Nombre</label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Rol</label>
                        <Input value={role} onChange={(e) => setRole(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Foto de Perfil (Max 2MB)</label>
                        <div className="flex items-center gap-4">
                            <Input type="file" accept="image/*" onChange={handleFileChange} className="cursor-pointer" />
                            {imageFile && <span className="text-xs text-green-600 font-medium">Archivo listo</span>}
                        </div>
                    </div>
                    <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "GUARDAR BARBERO"}
                    </Button>
                </form>
            </div>
        </AdminLayout>
    );
}