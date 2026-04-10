import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TurnoBarber", // Título de la pestaña
  description: "Reserva de turnos online",
  other: {
    google: "notranslate", // <--- ESTO BLOQUEA EL TRADUCTOR PARA QUE NO ROMPA REACT
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // <--- CAMBIAMOS "en" a "es" Y AGREGAMOS EL translate="no"
    <html lang="es" translate="no"> 
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}