"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function VerificacionPublicaPage() {
  const params = useParams();
  const numeroRadicado = params.numero as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchRadicado = async () => {
      try {
        // Llama a la ruta pública del backend
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/radication/verificar/${numeroRadicado}`);
        const result = await res.json();

        if (res.ok && result.valid) {
          setData(result.data);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (numeroRadicado) {
      fetchRadicado();
    }
  }, [numeroRadicado]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // PANTALLA DE ERROR (RADICADO FALSO)
  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-lg max-w-md w-full text-center border-t-4 border-red-600">
          <h1 className="text-2xl font-bold text-white mb-2">Verificación Fallida</h1>
          <p className="text-slate-400">El radicado <strong className="text-white">{numeroRadicado}</strong> no existe o no es válido en nuestro sistema.</p>
        </div>
      </div>
    );
  }

  // PANTALLA DE ÉXITO (RADICADO AUTÉNTICO)
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl max-w-lg w-full border-t-4 border-green-500">
        
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Radicado Oficial Auténtico</h1>
          <p className="text-sm text-slate-400 mt-1">Este documento fue registrado exitosamente a través de Prometeo SGD.</p>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-500 uppercase font-bold">Número de Radicado</p>
            <p className="text-lg font-bold text-white">{data.numero}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-500 uppercase font-bold">Fecha</p>
              <p className="text-sm font-semibold text-slate-200">{data.fecha}</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-500 uppercase font-bold">Anexos</p>
              <p className="text-sm font-semibold text-slate-200">{data.anexos}</p>
            </div>
          </div>

          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-500 uppercase font-bold">Entidad</p>
            <p className="text-sm font-semibold text-slate-200">{data.entidad}</p>
          </div>

          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-500 uppercase font-bold">Destino Interno</p>
            <p className="text-sm font-semibold text-slate-200">{data.destino}</p>
          </div>

          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-500 uppercase font-bold">Remitente</p>
            <p className="text-sm font-semibold text-slate-200">{data.remitente}</p>
          </div>
        </div>

        <div className="mt-8 text-center border-t border-slate-700 pt-4">
          <p className="text-xs text-slate-500">Verificado de manera segura mediante <strong className="text-slate-300">Prometeo SGD</strong></p>
        </div>
      </div>
    </div>
  );
}