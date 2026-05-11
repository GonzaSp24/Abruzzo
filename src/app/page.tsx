import { CalendarDays, Scissors, Smartphone, ArrowRight } from "lucide-react";
import { Button } from "@/app/components/ui/button"; // Usamos tu botón existente

export default function LandingPage() {
  // ACÁ PONÉS TU NÚMERO DE WHATSAPP REAL (Ej: 5493584123456)
  const miNumeroWhatsApp = "5493584250061"; 
  
  // El mensaje que te va a llegar a tu celu cuando toquen el botón
  const mensaje = encodeURIComponent(
    "¡Hola Gonzalo! Vi tu sistema TurnoBarber y me gustaría implementar algo así en mi local. ¿Me pasás info?"
  );
  
  const linkWhatsapp = `https://wa.me/${miNumeroWhatsApp}?text=${mensaje}`;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
      
      {/* Navbar simple */}
      <header className="p-6 border-b bg-white flex justify-between items-center shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
          TurnoBarber
        </h1>
        <a href={linkWhatsapp} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-gray-600 hover:text-black transition-colors">
          Contacto
        </a>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center mt-12 md:mt-20">
        <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <span className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest bg-gray-900 text-white rounded-full">
            SaaS para Barberías y Salones
          </span>
          
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight" style={{ fontFamily: "var(--font-serif)" }}>
            Digitalizá tu agenda y olvidate del WhatsApp
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            La plataforma definitiva para gestionar los turnos de tu negocio. Tus clientes reservan solos las 24 horas, y vos controlás todo desde un panel privado.
          </p>
          
          {/* --- AHORA SÍ, CENTRAMOS EL BOTÓN --- */}
          <div className="pt-8 flex justify-center"> 
            <a href={linkWhatsapp} target="_blank" rel="noopener noreferrer">
              <Button className="px-8 py-6 text-base md:text-lg rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 bg-black text-white">
                Registrar mi local <ArrowRight className="h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>

        {/* Sección de Características (Features) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full max-w-6xl pb-20">
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow">
            <div className="bg-gray-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 border border-gray-100">
              <Smartphone className="h-7 w-7 text-gray-700" />
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ fontFamily: "var(--font-serif)" }}>Reservas 24/7</h3>
            <p className="text-gray-600 leading-relaxed">
              Tus clientes pueden sacar turno en cualquier momento desde su celular de forma intuitiva sin tener que escribirte.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow">
            <div className="bg-gray-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 border border-gray-100">
              <CalendarDays className="h-7 w-7 text-gray-700" />
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ fontFamily: "var(--font-serif)" }}>Panel de Control</h3>
            <p className="text-gray-600 leading-relaxed">
              Administrá la agenda del día, bloqueá feriados o vacaciones, y confirmá o cancelá turnos con un solo click.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow">
            <div className="bg-gray-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 border border-gray-100">
              <Scissors className="h-7 w-7 text-gray-700" />
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ fontFamily: "var(--font-serif)" }}>Multi-Profesional</h3>
            <p className="text-gray-600 leading-relaxed">
              Cada empleado de tu local tiene su propia agenda configurada, y el sistema evita que se superpongan los turnos automáticamente.
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="p-8 text-center text-sm text-gray-400 mt-auto border-t bg-white">
        <p>© {new Date().getFullYear()} TurnoBarber. Desarrollado por Gonzalo Spernanzoni.</p>
      </footer>
    </div>
  );
}