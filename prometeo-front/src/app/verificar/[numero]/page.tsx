"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "./verificacion.module.css";
import { API_URL } from "@/app/services/api";

export default function VerificacionPublicaPage() {
  const params = useParams();
  const numeroRadicado = params.numero as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchRadicado = async () => {
      try {
        const res = await fetch(`${API_URL}/radication/verificar/${numeroRadicado}`);
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

  // ── ESTADO 1: CARGANDO ──
  if (loading) {
    return (
      <div className={styles.wrap}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  // ── ESTADO 2: ERROR (RADICADO FALSO) ──
  if (error || !data) {
    return (
      <div className={styles.wrap}>
        <div className={`${styles.card} ${styles.cardError}`}>
          <svg className={styles.iconError} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <h1 className={styles.title}>Verificación Fallida</h1>
          <p className={styles.subtitle}>
            El radicado <strong style={{ color: "#fdfeff" }}>{numeroRadicado}</strong> no existe o no es válido en nuestro sistema.
          </p>
        </div>
      </div>
    );
  }

  // ── ESTADO 3: ÉXITO (RADICADO AUTÉNTICO) ──
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        
        {/* Cabecera */}
        <div className={styles.header}>
          <svg className={styles.iconSuccess} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className={styles.title}>Radicado Oficial Auténtico</h1>
          <p className={styles.subtitle}>Este documento fue registrado exitosamente a través de Prometeo SGD.</p>
        </div>

        {/* Datos */}
        <div>
          <div className={styles.field}>
            <span className={styles.label}>Número de Radicado</span>
            <p className={styles.valueLarge}>{data.numero}</p>
          </div>

          <div className={styles.grid}>
            <div className={styles.fieldHalf}>
              <span className={styles.label}>Fecha</span>
              <p className={styles.value}>{data.fecha}</p>
            </div>
            <div className={styles.fieldHalf}>
              <span className={styles.label}>Anexos</span>
              <p className={styles.value}>{data.anexos}</p>
            </div>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Entidad</span>
            <p className={styles.value}>{data.entidad}</p>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Destino Interno</span>
            <p className={styles.value}>{data.destino}</p>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Remitente</span>
            <p className={styles.value}>{data.remitente}</p>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            Verificado de manera segura mediante <span className={styles.footerHighlight}>Prometeo SGD</span>
          </p>
        </div>

      </div>
    </div>
  );
}