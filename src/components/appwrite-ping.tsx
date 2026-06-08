"use client";

import { useEffect } from "react";
import { client } from "@/lib/appwrite";

/**
 * Verifica la conexión con Appwrite al cargar la app (client.ping).
 * Solo se ejecuta en el cliente; los errores se registran en consola sin bloquear la UI.
 */
export function AppwritePing() {
  useEffect(() => {
    client
      .ping()
      .then(() => {
        if (process.env.NODE_ENV === "development") {
          console.info("[Appwrite] Conexión verificada correctamente");
        }
      })
      .catch((err) => {
        console.warn("[Appwrite] No se pudo verificar la conexión:", err);
      });
  }, []);

  return null;
}
