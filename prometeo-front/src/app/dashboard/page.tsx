// src/app/dashboard/page.tsx
"use client";
import { useState } from "react";
import styles from "./page.module.css";

const kpis = [
  {
    label: "Archivos totales",
    value: "128",
    hint: "+6 esta semana",
    trend: "up",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    ),
  },
  {
    label: "Pendientes",
    value: "7",
    hint: "2 vencen hoy",
    trend: "warn",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    label: "Última radicación",
    value: "Hoy",
    hint: "14:32",
    trend: "up",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    label: "Usuarios activos",
    value: "34",
    hint: "+3 hoy",
    trend: "up",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
];

const barData = [
  { day: "Lun", value: 42 },
  { day: "Mar", value: 68 },
  { day: "Mié", value: 55 },
  { day: "Jue", value: 89 },
  { day: "Vie", value: 73 },
  { day: "Sáb", value: 31 },
  { day: "Dom", value: 47 },
];

const maxBar = Math.max(...barData.map((d) => d.value));

const recientes = [
  { name: "Contrato_2024_001.pdf", tipo: "Contrato", estado: "Aprobado", fecha: "Hoy, 14:32" },
  { name: "Informe_Q1.xlsx", tipo: "Informe", estado: "Pendiente", fecha: "Hoy, 11:15" },
  { name: "Acta_reunion_marzo.docx", tipo: "Acta", estado: "En revisión", fecha: "Ayer, 16:48" },
  { name: "Presupuesto_2025.pdf", tipo: "Presupuesto", estado: "Aprobado", fecha: "Ayer, 09:20" },
  { name: "Solicitud_vacaciones.pdf", tipo: "RRHH", estado: "Pendiente", fecha: "Hace 2 días" },
];

const estadoColor: Record<string, string> = {
  Aprobado: styles.estadoAprobado,
  Pendiente: styles.estadoPendiente,
  "En revisión": styles.estadoRevision,
};

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState("Esta semana");
  const filters = ["Hoy", "Esta semana", "Este mes", "Este año"];

  return (
    <div className={styles.wrap}>

      {/* ── HEADING ── */}
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Panel de control</p>
          <h1 className={styles.h1}>Dashboard</h1>
          <p className={styles.sub}>Resumen general de tus archivos y actividad reciente</p>
        </div>
        <div className={styles.headingRight}>
          <span className={styles.badge}>
            <span className={styles.badgeDot} />
            Estado: Operativo
          </span>
          <div className={styles.filters}>
            {filters.map((f) => (
              <button
                key={f}
                className={`${styles.filterBtn} ${activeFilter === f ? styles.filterActive : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className={styles.kpis}>
        {kpis.map((k) => (
          <div key={k.label} className={styles.kpiCard}>
            <div className={styles.kpiTop}>
              <span className={`${styles.kpiIcon} ${k.trend === "warn" ? styles.kpiIconWarn : ""}`}>
                {k.icon}
              </span>
              <span className={`${styles.kpiTrend} ${k.trend === "warn" ? styles.kpiTrendWarn : ""}`}>
                {k.trend === "up" ? "↑" : "⚠"} {k.hint}
              </span>
            </div>
            <p className={styles.kpiValue}>{k.value}</p>
            <p className={styles.kpiLabel}>{k.label}</p>
          </div>
        ))}
      </div>

    </div>
  );
}