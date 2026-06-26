import { Phone } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import Link from "next/link";

// 1. Le avisamos a TypeScript que vamos a recibir el objeto business
interface FooterProps {
    business?: any;
}

const Footer = ({ business }: FooterProps) => {
    return (
        <footer className="py-16 px-6 border-t border-border">
            <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                    {/* Brand */}
                    <div>
                        <h3 className="text-3xl font-semibold text-foreground mb-2">
                            {business?.name || "Barbería"}
                        </h3>
                        <p className="text-sm text-muted-foreground">Barbería</p>
                    </div>
                    
                    {/* Contact */}
                    <div>
                        <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4">
                            Contacto
                        </p>
                        <div className="space-y-3">
                            {/* WhatsApp dinámico leyendo de la BD */}
                            <a
                                href={`https://wa.me/${business?.whatsapp_number || '543584877740'}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-foreground hover:text-accent transition-colors"
                            >
                                <Phone className="h-4 w-4" />
                                WhatsApp
                            </a>
                            {/* Instagram preparado para ser dinámico */}
                            <a
                                href={`https://instagram.com/${business?.instagram_handle || 'abruzzo.barberia'}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-foreground hover:text-accent transition-colors"
                            >
                                <SiInstagram className="h-4 w-4" />
                                @{business?.instagram_handle || 'abruzzo.barberia'}
                            </a>
                        </div>
                    </div>
                    
                    {/* Address */}
                    <div>
                        <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4">
                            Dirección
                        </p>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                            {business?.address || "Gaudard 478\nRio Cuarto, Cordoba, Argentina"}
                        </p>
                    </div>
                </div>
                
                {/* Copyright con link oculto al admin dinámico y firma de TurnoBarber */}
                <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-center items-center gap-2 text-center">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()}{" "}
                        <Link 
                            href={`/${business?.slug || 'abruzzo'}/admin`} 
                            className="cursor-text hover:text-foreground transition-colors"
                        >
                            {business?.name || "Abruzzo Barbería"}
                        </Link>
                        . Todos los derechos reservados.
                    </p>
                    
                    <span className="hidden md:inline text-muted-foreground text-xs">|</span>
                    
                    <p className="text-xs text-muted-foreground">
                        Desarrollado por{" "}
                        <a 
                            href="/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-semibold text-foreground hover:text-accent transition-colors"
                        >
                            TurnoBarber
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;