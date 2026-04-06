"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
    onReservar: () => void;
}

function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
}

const Navbar = ({ onReservar }: NavbarProps) => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    
    // Función para el smooth scroll hacia arriba
    const scrollToTop = (e: React.MouseEvent) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        setMenuOpen(false); // Por si tocan el logo teniendo el menú móvil abierto
    };
    
    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6",
                scrolled ? "bg-background/95 backdrop-blur-sm border-b border-border py-4" : "py-6"
            )}
        >
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                
                {/* Logo con el scroll suave hacia arriba */}
                <a 
                    href="#" 
                    onClick={scrollToTop}
                    className="text-2xl font-semibold text-foreground tracking-tight cursor-pointer" 
                    style={{ fontFamily: "Cormorant Garamond, serif" }}
                >
                    Abruzzo
                </a>
                
                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-8">
                    <button
                        onClick={() => scrollToSection("servicios")}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors tracking-wide bg-transparent border-none cursor-pointer"
                    >
                        Servicios
                    </button>
                    <button
                        onClick={() => scrollToSection("equipo")}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors tracking-wide bg-transparent border-none cursor-pointer"
                    >
                        Equipo
                    </button>
                    <Button
                        onClick={onReservar}
                        variant="outline"
                        className="rounded-none text-xs tracking-[0.15em] uppercase border-foreground text-foreground hover:bg-foreground hover:text-background"
                    >
                        Reservar
                    </Button>
                </div>
                
                {/* Mobile toggle */}
                <button
                    className="md:hidden text-foreground"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                >
                    {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
                
            </div>
            
            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden mt-4 pb-4 space-y-4 border-t border-border pt-4">
                    <button
                        onClick={() => { scrollToSection("servicios"); setMenuOpen(false); }}
                        className="block w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
                    >
                        Servicios
                    </button>
                    <button
                        onClick={() => { scrollToSection("equipo"); setMenuOpen(false); }}
                        className="block w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
                    >
                        Equipo
                    </button>
                    <Button
                        onClick={() => { onReservar(); setMenuOpen(false); }}
                        className="w-full rounded-none text-xs tracking-[0.15em] uppercase"
                    >
                        Reservar Turno
                    </Button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;