// src/app/dashboard/radicar/page.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./radicar.module.css";
import { getInboundRadications, downloadRadicationPDF } from "../../services/api";

// ── Tipos ──────────────────────────────────────────────
interface Radicado {
  radication_number: string;
  created_at: string;
  subject: string;
  status: string;
  remitente: string;
}

// ── Línea temporal de estados ──────────────────────────
// El flujo es: pending → in_review → approved  (o rejected / archived)
const FLOW: { key: string; label: string }[] = [
  { key: "pending",   label: "Recibido"  },
  { key: "in_review", label: "En revisión" },
  { key: "approved",  label: "Aprobado"  },
];

// Índice del estado actual en el flujo lineal
function flowIndex(status: string): number {
  if (status === "rejected" || status === "archived") return -1; // estado especial
  return FLOW.findIndex((s) => s.key === status);
}

//──linea del tiempo del radicado────────────
function StatusTimeline({ status }: { status: string }) {
  const pasos = [
    { key: "pending", label: "Recibido" },
    { key: "in_review", label: "En revisión" },
    { key: "approved", label: "Aprobado" },
  ];

  const currentIndex = pasos.findIndex(p => p.key === status);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      {pasos.map((p, i) => {
        const activo = i === currentIndex;
        const completado = i < currentIndex;

        return (
          <div key={p.key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            
            {/* Línea */}
            {i > 0 && (
              <div style={{
                width: "20px",
                height: "2px",
                backgroundColor: completado ? "#22c55e" : "#e5e7eb"
              }} />
            )}

            {/* Punto */}
            <div style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: activo
                ? "#22c55e"
                : completado
                ? "#22c55e"
                : "#d1d5db"
            }} />

            {/* Texto */}
            <span style={{
              fontSize: "12px",
              color: activo || completado ? "#22c55e" : "#9ca3af",
              fontWeight: activo ? "600" : "400"
            }}>
              {p.label}
            </span>

          </div>
        );
      })}
    </div>
  );
}
// ── Helpers ────────────────────────────────────────────
function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const TIPO_LABELS: Record<string, string> = {
  IN:  "Entrada",
  OUT: "Salida",
  INT: "Interno",
};

// ── Página principal ───────────────────────────────────
const FILTROS = ["Todos", "Entrada", "Salida", "Interno"];

export default function RadicarPage() {
  const [radicados, setRadicados] = useState<Radicado[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [filtro,    setFiltro]    = useState("Todos");
  const [busqueda,  setBusqueda]  = useState("");
  const [downloadingPDF, setDownloadingPDF] = useState<string | null>(null);

  async function handleDownloadPDF(radicationNumber: string) {
    try {
      setDownloadingPDF(radicationNumber);
      await downloadRadicationPDF(radicationNumber);
    } catch (e: any) {
      alert("Error al descargar PDF: " + e.message);
    } finally {
      setDownloadingPDF(null);
    }
  }
  useEffect(() => {
  getInboundRadications()
    .then((data) => {
      console.log("RADICADOS:", data); // 👈 CLAVE
      setRadicados(data);
    })
    .catch((e) => setError(e.message))
    .finally(() => setLoading(false));
}, []);

  // Derivar tipo desde radication_number (ej: "2025-000001-IN")
  function getTipo(num: string): string {
    if (num.endsWith("-IN"))  return "Entrada";
    if (num.endsWith("-OUT")) return "Salida";
    if (num.endsWith("-INT")) return "Interno";
    return "Entrada";
  }

  const datos = radicados.filter((r) => {
    const tipo = getTipo(r.radication_number);
    const matchTipo    = filtro === "Todos" || tipo === filtro;
    const q            = busqueda.toLowerCase();
    const matchSearch  =
      r.radication_number.toLowerCase().includes(q) ||
      r.remitente?.toLowerCase().includes(q) ||
      r.subject?.toLowerCase().includes(q);
    return matchTipo && matchSearch;
  });

  return (
    <div className={styles.wrap}>

      {/* ── Heading ── */}
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Gestión documental</p>
          <h1 className={styles.h1}>Radicados</h1>
          <p className={styles.sub}>Historial de documentos radicados — Entrada, Salida e Internos</p>
        </div>
        <div className={styles.headingActions}>
          <Link href="/dashboard/radicar/entrada" className={styles.actionBtn}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5"  y1="12" x2="19" y2="12"/>
            </svg>
            Nuevo radicado
          </Link>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} width="14" height="14"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className={styles.searchInput}
            placeholder="Buscar por número, remitente o asunto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className={styles.filtros}>
          {FILTROS.map((f) => (
            <button
              key={f}
              className={`${styles.filtroBtn} ${filtro === f ? styles.filtroActive : ""}`}
              onClick={() => setFiltro(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Estados ── */}
      {loading && <p className={styles.stateMsg}>Cargando radicados...</p>}
      {error   && <p className={`${styles.stateMsg} ${styles.stateMsgError}`}>{error}</p>}
      {!loading && !error && datos.length === 0 && (
        <p className={styles.stateMsg}>Sin radicados para mostrar.</p>
      )}

      {/* ── Tabla ── */}
      {!loading && !error && datos.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>N° Radicado</th>
                <th className={styles.th}>Tipo</th>
                <th className={styles.th}>Remitente</th>
                <th className={styles.th}>Asunto</th>
                <th className={styles.th}>Fecha</th>
                <th className={styles.th}>Flujo</th>
                <th className={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((r) => {
                const tipo = getTipo(r.radication_number);
                return (
                  <tr key={r.radication_number} className={styles.tr}>

                    <td className={`${styles.td} ${styles.tdId}`}>
                      {r.radication_number}
                    </td>

                    <td className={styles.td}>
                      <span className={`${styles.tipoBadge} ${
                        tipo === "Entrada" ? styles.tipoEntrada :
                        tipo === "Salida"  ? styles.tipoSalida  :
                                            styles.tipoInterno
                      }`}>
                        {tipo}
                      </span>
                    </td>

                    <td className={styles.td}>{r.remitente ?? "—"}</td>

                    <td className={`${styles.td} ${styles.tdAsunto}`}>
                      {r.subject}
                    </td>

                    <td className={`${styles.td} ${styles.tdMuted}`}>
                      {formatDate(r.created_at)}
                    </td>

                    {/* Línea temporal */}
                    <td>
                      <StatusTimeline status={r.status ?? "pending"} />
                    </td>

                    {/* Acciones */}
                    <td className={styles.td}>
                      <div className={styles.acciones}>
                        <button
                          className={styles.accionBtn}
                          title="Descargar PDF"
                          onClick={() => handleDownloadPDF(r.radication_number)}
                          disabled={downloadingPDF === r.radication_number}
                          style={{ opacity: downloadingPDF === r.radication_number ? 0.5 : 1 }}
                        >
                          {downloadingPDF === r.radication_number ? (
                            // Spinner simple
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                              <polyline points="7 10 12 15 17 10"/>
                              <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                          )}
                        </button>
                        <button className={styles.accionBtn} title="Descargar sticker">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                        </button>
                        <button className={`${styles.accionBtn} ${styles.accionDelete}`} title="Archivar">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14H6L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/>
                            <path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className={styles.count}>
        {datos.length} radicado{datos.length !== 1 ? "s" : ""} encontrado{datos.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}