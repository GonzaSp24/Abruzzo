"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Calendar } from "@/app/components/ui/calendar";
import { ArrowLeft, ArrowRight, Check, User, MessageCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { z } from "zod";

// --- ESQUEMAS DE VALIDACIÓN ---
const clientNameSchema = z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 letras")
    .max(100, "Máximo 100 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo debe contener letras");

const clientPhoneSchema = z
    .string()
    .trim()
    .min(10, "El número es muy corto (mínimo 10 dígitos)")
    .max(15, "El número es muy largo")
    .regex(/^\+?[0-9]+$/, "Formato inválido. Usá solo números");

// --- HORARIOS DE LA BARBERÍA ---
const horariosBase = [
    // Mañana: 10:00 a 13:00
    "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
    // Tarde: 17:00 a 21:00
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"
];

// --- FUNCIÓN PARA FILTRAR HORAS PASADAS ---
// --- FUNCIÓN PARA FILTRAR HORAS PASADAS Y POR BARBERO ---
const obtenerHorariosDisponibles = (fechaSeleccionada: Date | undefined, barberoSeleccionado: any) => {
    if (!fechaSeleccionada) return horariosBase;

    let horariosParaMostrar = [...horariosBase];

    // Si el barbero es Agustín, solo mostramos de las 17:00 en adelante
    if (barberoSeleccionado?.id === "a23bb92e-17c4-479b-a1b2-016f809d5c84") {
        horariosParaMostrar = horariosParaMostrar.filter(hora => {
            const [horas] = hora.split(':').map(Number);
            return horas >= 17;
        });
    }

    const ahora = new Date();
    
    const esHoy = 
        fechaSeleccionada.getDate() === ahora.getDate() &&
        fechaSeleccionada.getMonth() === ahora.getMonth() &&
        fechaSeleccionada.getFullYear() === ahora.getFullYear();

    if (esHoy) {
        return horariosParaMostrar.filter(hora => {
            const [horas, minutos] = hora.split(':').map(Number);
            const horaDelTurno = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), horas, minutos);
            return horaDelTurno > ahora;
        });
    }

    return horariosParaMostrar;
};

const steps = ["Barbero", "Servicio", "Fecha y Hora", "Tus Datos", "Confirmación"];

export default function ReservarPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = use(params);
    const router = useRouter();
    
    const [business, setBusiness] = useState<any>(null);
    const [barbers, setBarbers] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [bookedTimes, setBookedTimes] = useState<string[]>([]);
    
    const [step, setStep] = useState(0);
    const [selectedBarber, setSelectedBarber] = useState<any>(null);
    const [selectedService, setSelectedService] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [month, setMonth] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [clientName, setClientName] = useState("");
    const [clientPhone, setClientPhone] = useState("");
    const [nameError, setNameError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        async function loadData() {
            const { data: businessData } = await supabase
            .from("businesses")
            .select("*")
            .eq("slug", slug)
            .single(); // Quitamos is_active de business, solo para barbers
            
            if (!businessData) return;
            setBusiness(businessData);
            
            // --- AQUÍ FILTRAMOS A LOS BARBEROS ACTIVOS ---
            const { data: barbersData } = await supabase
            .from("barbers")
            .select("*")
            .eq("business_id", businessData.id)
            .eq("is_active", true); // Solo muestra a los activos
            setBarbers(barbersData || []);
            
            const { data: servicesData } = await supabase
            .from("services")
            .select("*")
            .eq("business_id", businessData.id);
            setServices(servicesData || []);
        }
        loadData();
    }, [slug]);
    
    useEffect(() => {
        async function loadBooked() {
            if (!business || !selectedBarber || !selectedDate) return;
            const { data } = await supabase
            .from("appointments")
            .select("appointment_time")
            .eq("business_id", business.id)
            .eq("barber_id", selectedBarber.id)
            .eq("appointment_date", format(selectedDate, "yyyy-MM-dd"))
            // Para que si se cancela un turno, la hora se libere:
            .neq("status", "CANCELADO"); 
            
            setBookedTimes(data?.map((a) => a.appointment_time.slice(0, 5)) || []);
        }
        loadBooked();
    }, [business, selectedBarber, selectedDate]);
    
    const canNext = () => {
        switch (step) {
            case 0: return !!selectedBarber;
            case 1: return !!selectedService;
            case 2: return !!selectedDate && !!selectedTime;
            case 3: return clientName.trim().length > 0 && clientPhone.trim().length > 0;
            default: return false;
        }
    };

    const validateAndClean = () => {
        const cleanPhone = clientPhone.replace(/[\s\-\(\)]/g, "");
        const nameResult = clientNameSchema.safeParse(clientName);
        const phoneResult = clientPhoneSchema.safeParse(cleanPhone);

        setNameError(nameResult.success ? "" : nameResult.error.issues[0].message);
        setPhoneError(phoneResult.success ? "" : phoneResult.error.issues[0].message);

        return {
            success: nameResult.success && phoneResult.success,
            cleanData: {
                name: clientName.trim(),
                phone: cleanPhone
            }
        };
    };
    
    async function handleNext() {
        if (step === 3) {
            const validation = validateAndClean();
            
            if (!validation.success) return;
            
            setLoading(true);
            const { error } = await supabase.from("appointments").insert({
                business_id: business.id,
                barber_id: selectedBarber.id,
                service_id: selectedService.id,
                appointment_date: format(selectedDate!, "yyyy-MM-dd"),
                appointment_time: selectedTime,
                client_name: validation.cleanData.name,
                client_phone: validation.cleanData.phone,
            });
            setLoading(false);
            
            if (error) {
                console.error("ERROR DE SUPABASE:", error);
                alert("Error de la base de datos: " + error.message); // <-- Esto te va a mostrar por qué falló
                return;
            }
            setStep(4);
        } else {
            setStep((s) => s + 1);
        }
    }
    
    const whatsappMessage = () => {
        const dateStr = selectedDate
        ? format(selectedDate, "EEEE d 'de' MMMM", { locale: es })
        : "";
        return encodeURIComponent(
            `Hola! Reservé un turno en ${business?.name} para ${selectedService?.name} con ${selectedBarber?.name} el ${dateStr} a las ${selectedTime}. Mi nombre es ${clientName}.`
        );
    };

    // --- OBTENEMOS LAS HORAS DINÁMICAMENTE ---
    const timeSlots = obtenerHorariosDisponibles(selectedDate, selectedBarber);
    
    if (!business) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-px h-12 bg-muted-foreground/30 animate-pulse" />
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <div className="border-b border-border px-6 py-4">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => router.push(`/${slug}`)}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" /> Volver
                    </button>
                    <h1 className="text-xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
                        Reservar Turno
                    </h1>
                    <div className="w-16" />
                </div>
            </div>
            
            {/* Stepper */}
            <div className="px-6 py-6 border-b border-border">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    {steps.map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                            <div
                                className={cn(
                                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                                    i < step
                                        ? "bg-accent text-accent-foreground"
                                        : i === step
                                        ? "bg-foreground text-background"
                                        : "bg-muted text-muted-foreground"
                                )}
                            >
                                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                            </div>
                            <span className="hidden md:inline text-xs text-muted-foreground">{s}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Content */}
            <div className="px-6 py-12">
                <div className="max-w-3xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* PASO 1 — Barbero */}
                            {step === 0 && (
                                <div>
                                    <h2 className="text-3xl font-semibold mb-2" style={{ fontFamily: "var(--font-serif)" }}>
                                        Elegí tu barbero
                                    </h2>
                                    <p className="text-muted-foreground mb-8">Seleccioná con quién querés atenderte.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {barbers.map((b) => (
                                            <button
                                                key={b.id}
                                                onClick={() => setSelectedBarber(b)}
                                                className={cn(
                                                    "border p-6 text-center transition-all duration-200",
                                                    selectedBarber?.id === b.id
                                                        ? "border-accent bg-accent/5"
                                                        : "border-border hover:border-muted-foreground"
                                                )}
                                            >
                                                <div className="w-20 h-20 mx-auto mb-4 bg-muted flex items-center justify-center overflow-hidden">
                                                    {b.photo_url ? (
                                                        <img src={b.photo_url} alt={b.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="h-8 w-8 text-muted-foreground/40" />
                                                    )}
                                                </div>
                                                <h3 className="text-lg font-semibold">{b.name}</h3>
                                                <p className="text-xs text-muted-foreground">{b.role}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* PASO 2 — Servicio */}
                            {step === 1 && (
                                <div>
                                    <h2 className="text-3xl font-semibold mb-2" style={{ fontFamily: "var(--font-serif)" }}>
                                        Elegí el servicio
                                    </h2>
                                    <p className="text-muted-foreground mb-8">¿Qué te gustaría hacerte?</p>
                                    <div className="space-y-4">
                                        {services.map((s) => (
                                            <button
                                                key={s.id}
                                                onClick={() => setSelectedService(s)}
                                                className={cn(
                                                    "w-full border p-6 flex items-center justify-between transition-all duration-200 text-left",
                                                    selectedService?.id === s.id
                                                        ? "border-accent bg-accent/5"
                                                        : "border-border hover:border-muted-foreground"
                                                )}
                                            >
                                                <div>
                                                    <h3 className="text-lg font-semibold">{s.name}</h3>
                                                    <p className="text-xs text-muted-foreground">{s.duration_minutes} min</p>
                                                </div>
                                                <span className="text-xl font-light">${s.price?.toLocaleString()}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* PASO 3 — Fecha y hora */}
                            {step === 2 && (
                                <div>
                                    <h2 className="text-3xl font-semibold mb-2" style={{ fontFamily: "var(--font-serif)" }}>
                                        Elegí fecha y hora
                                    </h2>
                                    <p className="text-muted-foreground mb-8">Seleccioná cuándo querés venir.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="flex justify-center">
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={(date: Date | undefined) => { 
                                                setSelectedDate(date); 
                                                setSelectedTime(null); 
                                            }}
                                            month={month}
                                            onMonthChange={setMonth}
                                            disabled={(date: Date) => {
                                                const hoy = new Date();
                                                hoy.setHours(0, 0, 0, 0);
                                                
                                                const esPasado = date < hoy;
                                                const esDomingo = date.getDay() === 0; // 0 es Domingo
                                                const esLunes = date.getDay() === 1;   // 1 es Lunes <--- AGREGAMOS ESTO
                                                
                                                return esPasado || esDomingo || esLunes;
                                            }}
                                            locale={es}
                                        />
                                        </div>
                                        {selectedDate && (
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                                                </p>
                                                
                                                {/* Mensaje si no hay turnos */}
                                                {timeSlots.length === 0 ? (
                                                    <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded border border-amber-100">
                                                        No hay más turnos disponibles para el día de hoy.
                                                    </p>
                                                ) : (
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {timeSlots.map((time) => {
                                                            const isBooked = bookedTimes.includes(time);
                                                            return (
                                                                <button
                                                                    key={time}
                                                                    disabled={isBooked}
                                                                    onClick={() => setSelectedTime(time)}
                                                                    className={cn(
                                                                        "py-2 text-sm border transition-colors",
                                                                        isBooked
                                                                            ? "border-border text-muted-foreground/30 line-through cursor-not-allowed"
                                                                            : selectedTime === time
                                                                            ? "border-accent bg-accent text-accent-foreground"
                                                                            : "border-border hover:border-muted-foreground"
                                                                    )}
                                                                >
                                                                    {time}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            {/* PASO 4 — Datos */}
                            {step === 3 && (
                                <div>
                                    <h2 className="text-3xl font-semibold mb-2" style={{ fontFamily: "var(--font-serif)" }}>
                                        Tus datos
                                    </h2>
                                    <p className="text-muted-foreground mb-8">Así podemos contactarte si es necesario.</p>
                                    <div className="max-w-md space-y-6">
                                        <div>
                                            <label className="text-sm text-muted-foreground mb-2 block">Nombre</label>
                                            <Input
                                                value={clientName}
                                                onChange={(e) => { setClientName(e.target.value); setNameError(""); }}
                                                placeholder="Tu nombre"
                                                className="rounded-none"
                                                maxLength={100}
                                            />
                                            {nameError && <p className="text-xs text-destructive mt-1">{nameError}</p>}
                                        </div>
                                        <div>
                                            <label className="text-sm text-muted-foreground mb-2 block">WhatsApp</label>
                                            <Input
                                                type="tel"
                                                value={clientPhone}
                                                onChange={(e) => { setClientPhone(e.target.value); setPhoneError(""); }}
                                                placeholder="3584123456"
                                                className="rounded-none"
                                                maxLength={20}
                                            />
                                            {phoneError && <p className="text-xs text-destructive mt-1">{phoneError}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* PASO 5 — Confirmación */}
                            {step === 4 && (
                                <div className="text-center">
                                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
                                        <Check className="h-8 w-8 text-accent" />
                                    </div>
                                    <h2 className="text-3xl font-semibold mb-2" style={{ fontFamily: "var(--font-serif)" }}>
                                        ¡Turno reservado!
                                    </h2>
                                    <p className="text-muted-foreground mb-8">Revisá el resumen de tu turno.</p>
                                    
                                    <div className="max-w-sm mx-auto border border-border p-8 mb-8 text-left space-y-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Barbero</p>
                                            <p className="font-medium">{selectedBarber?.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Servicio</p>
                                            <p className="font-medium">
                                                {selectedService?.name} — ${selectedService?.price?.toLocaleString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Fecha y hora</p>
                                            <p className="font-medium">
                                                {selectedDate && format(selectedDate, "EEEE d 'de' MMMM", { locale: es })} a las {selectedTime}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Cliente</p>
                                            <p className="font-medium">{clientName}</p>
                                        </div>
                                    </div>
                                    
                                    <a 
                                        href={`https://wa.me/${business.whatsapp_number}?text=${whatsappMessage()}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block"
                                    >
                                        <Button className="rounded-none text-xs tracking-[0.15em] uppercase px-8 py-5 gap-2 bg-[hsl(142,70%,35%)] hover:bg-[hsl(142,70%,30%)] text-white">
                                            <MessageCircle className="h-4 w-4" />
                                            Confirmar por WhatsApp
                                        </Button>
                                    </a>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                    
                    {/* Nav buttons */}
                    {step < 4 && (
                        <div className="flex justify-between mt-12">
                            <Button
                                variant="ghost"
                                onClick={() => setStep((s) => Math.max(0, s - 1))}
                                disabled={step === 0}
                                className="rounded-none text-xs tracking-[0.1em] uppercase gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" /> Anterior
                            </Button>
                            <Button
                                onClick={handleNext}
                                disabled={!canNext() || loading}
                                className="rounded-none text-xs tracking-[0.1em] uppercase gap-2 bg-foreground text-background hover:bg-foreground/90"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        {step === 3 ? "Confirmar" : "Siguiente"}{" "}
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}