// src/app/dashboard/radicar/page.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./radicar.module.css";
import { getInboundRadications, getPrivateSticker, getRadicationPDFUrl } from "../../services/api";

interface Radicado {
  radication_number: string;
  created_at: string;
  subject: string;
  status: string;
  remitente: string;
}

function StatusTimeline({ status }: { status: string }) {
  const pasos = [
    { key: "pending",   label: "Recibido"    },
    { key: "in_review", label: "En revisión" },
    { key: "approved",  label: "Aprobado"    },
  ];
  const currentIndex = pasos.findIndex(p => p.key === status);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      {pasos.map((p, i) => {
        const activo     = i === currentIndex;
        const completado = i < currentIndex;
        return (
          <div key={p.key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {i > 0 && (
              <div style={{ width: "20px", height: "2px",
                backgroundColor: completado ? "#22c55e" : "#e5e7eb" }} />
            )}
            <div style={{ width: "10px", height: "10px", borderRadius: "50%",
              backgroundColor: activo || completado ? "#22c55e" : "#d1d5db" }} />
            <span style={{ fontSize: "12px",
              color: activo || completado ? "#22c55e" : "#9ca3af",
              fontWeight: activo ? "600" : "400" }}>
              {p.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const FILTROS = ["Todos", "Entrada", "Salida", "Interno"];

export default function RadicarPage() {
  const [radicados, setRadicados] = useState<Radicado[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [filtro,    setFiltro]    = useState("Todos");
  const [busqueda,  setBusqueda]  = useState("");

  // ── Estado modal rótulo ──
  const [stickerUrl,       setStickerUrl]       = useState<string | null>(null);
  const [stickerRadNumber, setStickerRadNumber] = useState<string>("");
  const [loadingSticker,   setLoadingSticker]   = useState<string | null>(null);

  // ── Estado modal PDF ──
  const [pdfUrl,       setPdfUrl]       = useState<string | null>(null);
  const [pdfRadNumber, setPdfRadNumber] = useState<string>("");
  const [loadingPdf,   setLoadingPdf]   = useState<string | null>(null);

  useEffect(() => {
    getInboundRadications()
      .then(setRadicados)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function getTipo(num: string): string {
    if (num.endsWith("-IN"))  return "Entrada";
    if (num.endsWith("-OUT")) return "Salida";
    if (num.endsWith("-INT")) return "Interno";
    return "Entrada";
  }

  const datos = radicados.filter((r) => {
    const tipo = getTipo(r.radication_number);
    const matchTipo   = filtro === "Todos" || tipo === filtro;
    const q           = busqueda.toLowerCase();
    const matchSearch =
      r.radication_number.toLowerCase().includes(q) ||
      r.remitente?.toLowerCase().includes(q) ||
      r.subject?.toLowerCase().includes(q);
    return matchTipo && matchSearch;
  });

  // ── Handlers rótulo ──
  async function handleViewSticker(radicationNumber: string) {
    try {
      setLoadingSticker(radicationNumber);
      const url = await getPrivateSticker(`${radicationNumber}.png`);
      setStickerUrl(url);
      setStickerRadNumber(radicationNumber);
    } catch (e: any) {
      alert("No se pudo cargar el rótulo: " + e.message);
    } finally {
      setLoadingSticker(null);
    }
  }

  function handleCloseSticker() {
    if (stickerUrl) URL.revokeObjectURL(stickerUrl);
    setStickerUrl(null);
    setStickerRadNumber("");
  }

  function handleDownloadSticker() {
    if (!stickerUrl) return;
    const link = document.createElement("a");
    link.href     = stickerUrl;
    link.download = `Rotulo_${stickerRadNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ── Handlers PDF ──
  async function handleViewPDF(radicationNumber: string) {
    try {
      setLoadingPdf(radicationNumber);
      const url = await getRadicationPDFUrl(radicationNumber);
      setPdfUrl(url);
      setPdfRadNumber(radicationNumber);
    } catch (e: any) {
      alert("No se pudo cargar el PDF: " + e.message);
    } finally {
      setLoadingPdf(null);
    }
  }

  function handleClosePdf() {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    setPdfRadNumber("");
  }

  function handleDownloadPdf() {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href     = pdfUrl;
    link.download = `Radicado_${pdfRadNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

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
          <Link href="/dashboard/radicar/input" className={styles.actionBtn}>
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
            <button key={f}
              className={`${styles.filtroBtn} ${filtro === f ? styles.filtroActive : ""}`}
              onClick={() => setFiltro(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Estados ── */}
      {loading  && <p className={styles.stateMsg}>Cargando radicados...</p>}
      {error    && <p className={`${styles.stateMsg} ${styles.stateMsgError}`}>{error}</p>}
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
                      }`}>{tipo}</span>
                    </td>

                    <td className={styles.td}>{r.remitente ?? "—"}</td>
                    <td className={`${styles.td} ${styles.tdAsunto}`}>{r.subject}</td>
                    <td className={`${styles.td} ${styles.tdMuted}`}>{formatDate(r.created_at)}</td>

                    <td className={styles.td}>
                      <StatusTimeline status={r.status ?? "pending"} />
                    </td>

                    <td className={styles.td}>
                      <div className={styles.acciones}>

                        {/* Ver PDF */}
                        <button
                          className={styles.accionBtn}
                          title="Ver PDF"
                          onClick={() => handleViewPDF(r.radication_number)}
                          disabled={loadingPdf === r.radication_number}
                          style={{ opacity: loadingPdf === r.radication_number ? 0.5 : 1 }}
                        >
                          {loadingPdf === r.radication_number ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2"
                              style={{ animation: "spin 1s linear infinite" }}>
                              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                            </svg>
                          ) : (
                            // Ícono de documento PDF
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                              <line x1="16" y1="13" x2="8" y2="13"/>
                              <line x1="16" y1="17" x2="8" y2="17"/>
                              <polyline points="10 9 9 9 8 9"/>
                            </svg>
                          )}
                        </button>

                        {/* Ver rótulo — ojito */}
                        <button
                          className={styles.accionBtn}
                          title="Ver rótulo"
                          onClick={() => handleViewSticker(r.radication_number)}
                          disabled={loadingSticker === r.radication_number}
                          style={{ opacity: loadingSticker === r.radication_number ? 0.5 : 1 }}
                        >
                          {loadingSticker === r.radication_number ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2"
                              style={{ animation: "spin 1s linear infinite" }}>
                              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          )}
                        </button>

                        {/* Eliminar */}
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

      {/* ══ MODAL RÓTULO ══ */}
      {stickerUrl && (
        <div className={styles.modalOverlay} onClick={handleCloseSticker}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.modalEyebrow}>Rótulo de radicado</p>
                <p className={styles.modalTitle}>{stickerRadNumber}</p>
              </div>
              <button className={styles.modalClose} onClick={handleCloseSticker}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6"  y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className={styles.modalImgWrap}>
              <img src={stickerUrl} alt={`Rótulo ${stickerRadNumber}`} className={styles.modalImg} />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.modalBtnSecondary} onClick={handleCloseSticker}>
                Cerrar
              </button>
              <button className={styles.modalBtnPrimary} onClick={handleDownloadSticker}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Descargar PNG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL PDF ══ */}
      {pdfUrl && (
        <div className={styles.modalOverlay} onClick={handleClosePdf}>
          <div className={styles.modalBoxPdf} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.modalEyebrow}>Documento radicado</p>
                <p className={styles.modalTitle}>{pdfRadNumber}</p>
              </div>
              <button className={styles.modalClose} onClick={handleClosePdf}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6"  y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Preview iframe del PDF */}
            <div className={styles.modalPdfWrap}>
              <iframe
                src={pdfUrl}
                className={styles.modalPdfFrame}
                title={`PDF ${pdfRadNumber}`}
              />
            </div>

            <div className={styles.modalActions}>
              <button className={styles.modalBtnSecondary} onClick={handleClosePdf}>
                Cerrar
              </button>
              <button className={styles.modalBtnPrimary} onClick={handleDownloadPdf}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}