// src/components/SessionProvider.tsx (ajusta la ruta según tu estructura)
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Esta es la función que se ejecuta cuando api.ts grita "SESSION_EXPIRED"
    const handleSessionExpired = () => {
      console.warn("Sesión finalizada. Redirigiendo al login...");
      // Aquí puedes agregar un toast o notificación si tienes alguna librería configurada
      
      router.push("/login");
    };

    // Ponemos al navegador a escuchar el evento
    window.addEventListener("SESSION_EXPIRED", handleSessionExpired);

    // Limpieza del listener cuando el componente se desmonta
    return () => {
      window.removeEventListener("SESSION_EXPIRED", handleSessionExpired);
    };
  }, [router]);

  return <>{children}</>;
}