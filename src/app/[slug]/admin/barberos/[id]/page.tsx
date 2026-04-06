"use client";

import { useState, useEffect, use } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminLayout from "@/app/components/admin/AdminLayout";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { ArrowLeft, Loader2, Upload, User, Trash2 } from "lucide-react";

export default function EditarBarbero({
    params,
}: {
    params: Promise<{ slug: string; id: string }>;
}) {
    const { slug, id } = use(params);
    const router = useRouter();
    
    const [business, setBusiness] = useState<any>(null);
    const [barber, setBarber] = useState<any>(null);
    
    const [fetchingData, setFetchingData] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingPhoto, setDeletingPhoto] = useState(false);
    
    // Al inicializarlos en "", evitamos el error de "uncontrolled input"
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        async function loadAllData() {
            setFetchingData(true);
            
            const { data: bizData } = await supabase
                .from("businesses")
                .select("*")
                .eq("slug", slug)
                .single();
            
            if (bizData) setBusiness(bizData);

            const { data: barbData, error } = await supabase
                .from("barbers")
                .select("*")
                .eq("id", id)
                .single();

            if (barbData) {
                setBarber(barbData);
                // EL ARREGLO: Agregamos || "" para que si viene nulo, sea texto vacío
                setName(barbData.name || "");
                setRole(barbData.role || "");
                setIsActive(barbData.is_active !== false);
                setPhotoUrl(barbData.photo_url || null);
            } else if (error) {
                console.error("Error cargando barbero:", error);
                alert("No se encontró el barbero.");
                router.push(`/${slug}/admin/barberos`);
            }
            
            setFetchingData(false);
        }
        loadAllData();
    }, [slug, id, router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) {
                alert("La imagen es muy pesada (máximo 2MB)");
                e.target.value = ""; 
                return;
            }
            if (!file.type.startsWith("image/")) {
                alert("Por favor subí un archivo de imagen válido");
                e.target.value = "";
                return;
            }
            setImageFile(file);
        }
    };

    const handleDeletePhoto = async () => {
        if (!confirm("¿Estás seguro de borrar la foto de perfil?")) return;
        setDeletingPhoto(true);

        const urlParts = photoUrl?.split('/barberos/');
        if (!urlParts || urlParts.length < 2) {
            alert("No se pudo determinar la ruta del archivo a borrar.");
            setDeletingPhoto(false);
            return;
        }
        const filePath = urlParts[1];

        const { error: storageError } = await supabase.storage
            .from('barberos')
            .remove([filePath]);

        if (storageError) {
            console.error("Error borrando de storage:", storageError);
        }

        const { error: dbError } = await supabase
            .from("barbers")
            .update({ photo_url: null })
            .eq("id", id);

        if (dbError) {
            console.error("Error actualizando DB:", dbError);
            alert("Archivo borrado, pero falló actualizar la base de datos.");
        } else {
            setPhotoUrl(null);
            setImageFile(null); 
        }
        
        setDeletingPhoto(false);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!business?.id || !barber) return;
        setSaving(true);

        let finalPhotoUrl = photoUrl; 

        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`; 
            const filePath = `${business.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('barberos')
                .upload(filePath, imageFile);

            if (uploadError) {
                console.error("Error de subida:", uploadError);
                alert("Error al subir la nueva imagen. Verificá las políticas de Storage.");
                setSaving(false);
                return;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('barberos')
                .getPublicUrl(filePath);
            
            finalPhotoUrl = publicUrl;

            if (photoUrl) {
                const oldUrlParts = photoUrl.split('/barberos/');
                if (oldUrlParts && oldUrlParts.length >= 2) {
                    const oldFilePath = oldUrlParts[1];
                    supabase.storage.from('barberos').remove([oldFilePath]); 
                }
            }
        }

        // Aseguramos enviar strings limpios para evitar que falle Supabase
        const { error: updateError } = await supabase
            .from("barbers")
            .update({
                name: name ? name.trim() : "",
                role: role ? role.trim() : "",
                is_active: isActive,
                photo_url: finalPhotoUrl,
            })
            .eq("id", id);

        setSaving(false);
        if (updateError) {
            // Imprimimos el error completo por si vuelve a fallar, saber exactamente qué es
            console.error("Error completo DB:", JSON.stringify(updateError));
            alert("Error al guardar en base de datos. Revisá la consola.");
        } else {
            router.push(`/${slug}/admin/barberos`);
            router.refresh(); 
        }
    };

    if (fetchingData) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;
    if (!barber) return <div className="p-10 text-center">Barbero no encontrado</div>;

    return (
        <AdminLayout business={business}>
            <div className="max-w-2xl mx-auto">
                <button 
                    onClick={() => router.push(`/${slug}/admin/barberos`)} 
                    className="flex items-center gap-2 text-sm text-gray-500 mb-6 hover:text-gray-800 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" /> Volver a Barberos
                </button>

                <h2 className="text-3xl font-bold mb-8">Editar Barbero</h2>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 border rounded-xl shadow-sm">
                    {/* Sección Foto */}
                    <div className="border-b pb-6 mb-6">
                        <label className="block text-sm font-medium mb-3 text-gray-700">Foto de Perfil</label>
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-200 shadow-inner relative group">
                                {imageFile ? (
                                    <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
                                ) : photoUrl ? (
                                    <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="h-12 w-12 text-gray-300" />
                                )}
                            </div>
                            
                            <div className="flex flex-col gap-2 flex-1 w-full">
                                <label className="cursor-pointer">
                                    <div className="flex items-center justify-center gap-2 text-sm h-10 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium border">
                                        <Upload className="h-4 w-4" />
                                        {photoUrl ? "Cambiar foto" : "Subir foto"}
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
                                </label>
                                
                                {photoUrl && (
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={handleDeletePhoto} 
                                        disabled={deletingPhoto}
                                        className="text-red-600 hover:bg-red-50 hover:text-red-700 gap-2 w-full justify-center"
                                    >
                                        {deletingPhoto ? <Loader2 className="animate-spin h-3 w-3"/> : <Trash2 className="h-3 w-3" />}
                                        Eliminar foto actual
                                    </Button>
                                )}
                                
                                <p className="text-[10px] text-gray-400 mt-1 italic text-center sm:text-left">
                                    JPG, PNG. Máximo 2MB.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Datos Generales */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Nombre Completo</label>
                        <Input 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="Ej: Bruno Díaz" 
                            required 
                            className="bg-gray-50 rounded-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Rol / Especialidad</label>
                        <Input 
                            value={role} 
                            onChange={(e) => setRole(e.target.value)} 
                            placeholder="Ej: Barbero Senior" 
                            required 
                            className="bg-gray-50 rounded-none"
                        />
                    </div>

                    {/* Estado Activo */}
                    <div className="flex items-center gap-2 border p-4 bg-gray-50 rounded-md">
                        <input 
                            type="checkbox" 
                            id="isActive" 
                            checked={isActive} 
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                            Barbero Activo (aparece en la web pública)
                        </label>
                    </div>

                    <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white rounded-none h-12 tracking-wide font-semibold" disabled={saving}>
                        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "GUARDAR CAMBIOS"}
                    </Button>
                </form>
            </div>
        </AdminLayout>
    );
}