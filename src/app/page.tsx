export default function TurnoBarberHome() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6">
      <div className="max-w-2xl">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-6">
          TurnoBarber
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          La plataforma definitiva para gestionar los turnos de tu barbería o salón. 
          Digitalizá tu negocio y olvidate de los mensajes de WhatsApp.
        </p>
        <button className="bg-black text-white px-8 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors">
          Registrar mi local (Próximamente)
        </button>
      </div>
    </div>
  );
}