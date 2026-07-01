"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import styles from "./radicar.module.css";
import {
  getAllRadications,
  getPrivateSticker,
  getRadicationPDFUrl,
  archiveRadication,
  unarchiveRadication,
} from "../../services/api";

interface Radicado {
  radication_number: string;
  created_at: string;
  subject: string;
  status: string;
  remitente: string;
  archived: boolean;
  fecha_documento?: string;
  observaciones?: string;
}

function StatusTimeline({ status }: { status: string }) {
  const pasos = [
    { key: "pending",   label: "Recibido"    },
    { key: "in_review", label: "En revisión" },
    { key: "approved",  label: "Aprobado"    },
  ];
  const currentIndex = pasos.findIndex((p) => p.key === status);
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

const FILTROS = ["Todos", "Entrada", "Salida", "Interno", "Archivados"];

export default function RadicarPage() {
  const router = useRouter();
  const [radicados, setRadicados] = useState<Radicado[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [filtro,    setFiltro]    = useState("Todos");
  const [busqueda,  setBusqueda]  = useState("");

  const [stickerUrl,       setStickerUrl]       = useState<string | null>(null);
  const [stickerRadNumber, setStickerRadNumber] = useState<string>("");
  const [loadingSticker,   setLoadingSticker]   = useState<string | null>(null);

  const [pdfUrl,       setPdfUrl]       = useState<string | null>(null);
  const [pdfRadNumber, setPdfRadNumber] = useState<string>("");
  const [loadingPdf,   setLoadingPdf]   = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    getAllRadications()
      .then(setRadicados)
      .catch((e) => toast.error("Error al cargar radicados: " + e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  function getTipo(num: string): string {
    if (num.endsWith("-IN"))  return "Entrada";
    if (num.endsWith("-OUT")) return "Salida";
    if (num.endsWith("-INT")) return "Interno";
    return "Entrada";
  }

  const datos = radicados.filter((r) => {
    if (filtro === "Archivados") return r.archived === true;
    if (r.archived) return false;
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
      toast.error("No se pudo cargar el rótulo: " + e.message);
    } finally {
      setLoadingSticker(null);
    }
  }

  function handleCloseSticker() {
    if (stickerUrl) URL.revokeObjectURL(stickerUrl);
    setStickerUrl(null); setStickerRadNumber("");
  }

  function handleDownloadSticker() {
    if (!stickerUrl) return;
    const a = document.createElement("a");
    a.href = stickerUrl; a.download = `Rotulo_${stickerRadNumber}.png`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    toast.success("Rótulo descargado");
  }

  // ── Handlers PDF ──
  async function handleViewPDF(radicationNumber: string) {
    try {
      setLoadingPdf(radicationNumber);
      const url = await getRadicationPDFUrl(radicationNumber);
      setPdfUrl(url); setPdfRadNumber(radicationNumber);
    } catch (e: any) {
      toast.error("No se pudo cargar el PDF: " + e.message);
    } finally {
      setLoadingPdf(null);
    }
  }

  function handleClosePdf() {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null); setPdfRadNumber("");
  }

  function handleDownloadPdf() {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl; a.download = `Radicado_${pdfRadNumber}.pdf`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    toast.success("PDF descargado");
  }

  // ── Handler archivar ──
  async function handleArchive(radicationNumber: string) {
    toast(`¿Archivar el radicado ${radicationNumber}?`, {
      action: {
        label: "Archivar",
        onClick: async () => {
          try {
            await archiveRadication(radicationNumber);
            toast.success(`Radicado ${radicationNumber} archivado`);
            fetchData();
          } catch (e: any) {
            toast.error("Error al archivar: " + e.message);
          }
        },
      },
      cancel: { label: "Cancelar", onClick: () => {} },
    });
  }

  // ── Handler desarchivar ──
  async function handleUnarchive(radicationNumber: string) {
    toast(`¿Desarchivar el radicado ${radicationNumber}?`, {
      action: {
        label: "Desarchivar",
        onClick: async () => {
          try {
            await unarchiveRadication(radicationNumber);
            toast.success(`Radicado ${radicationNumber} desarchivado`);
            fetchData();
          } catch (e: any) {
            toast.error("Error al desarchivar: " + e.message);
          }
        },
      },
      cancel: { label: "Cancelar", onClick: () => {} },
    });
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Gestión documental</p>
          <h1 className={styles.h1}>Radicados</h1>
          <p className={styles.sub}>Historial de documentos radicados — Entrada, Salida e Internos</p>
        </div>
        <div className={styles.headingActions}>
          <Link href="/dashboard/radicar/input" className={styles.actionBtn}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuevo radicado
          </Link>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} width="14" height="14"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
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
              className={`${styles.filtroBtn} ${filtro === f ? styles.filtroActive : ""} ${f === "Archivados" ? styles.filtroArchivado : ""}`}
              onClick={() => setFiltro(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className={styles.stateMsg}>Cargando radicados...</p>}
      {!loading && datos.length === 0 && (
        <p className={styles.stateMsg}>
          {filtro === "Archivados" ? "No hay radicados archivados." : "Sin radicados para mostrar."}
        </p>
      )}

      {!loading && datos.length > 0 && (
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
                  <tr key={r.radication_number} className={styles.tr}
                    style={{ opacity: r.archived ? 0.6 : 1 }}>

                    <td className={`${styles.td} ${styles.tdId}`}>
                      {r.radication_number}
                      {r.archived && <span className={styles.archivedBadge}>Archivado</span>}
                    </td>

                    <td className={styles.td}>
                      <span className={`${styles.tipoBadge} ${
                        tipo === "Entrada" ? styles.tipoEntrada :
                        tipo === "Salida"  ? styles.tipoSalida  : styles.tipoInterno
                      }`}>{tipo}</span>
                    </td>

                    <td className={styles.td}>{r.remitente ?? "—"}</td>
                    <td className={`${styles.td} ${styles.tdAsunto}`}>{r.subject}</td>
                    <td className={`${styles.td} ${styles.tdMuted}`}>{formatDate(r.created_at)}</td>
                    <td className={styles.td}><StatusTimeline status={r.status ?? "pending"} /></td>

                    <td className={styles.td}>
                      <div className={styles.acciones}>

                        <button className={styles.accionBtn} title="Ver PDF"
                          onClick={() => handleViewPDF(r.radication_number)}
                          disabled={loadingPdf === r.radication_number}
                          style={{ opacity: loadingPdf === r.radication_number ? 0.5 : 1 }}>
                          {loadingPdf === r.radication_number ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                              style={{ animation: "spin 1s linear infinite" }}>
                              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                              <line x1="16" y1="13" x2="8" y2="13"/>
                              <line x1="16" y1="17" x2="8" y2="17"/>
                            </svg>
                          )}
                        </button>

                        <button className={styles.accionBtn} title="Ver rótulo"
                          onClick={() => handleViewSticker(r.radication_number)}
                          disabled={loadingSticker === r.radication_number}
                          style={{ opacity: loadingSticker === r.radication_number ? 0.5 : 1 }}>
                          {loadingSticker === r.radication_number ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                              style={{ animation: "spin 1s linear infinite" }}>
                              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          )}
                        </button>

                        {!r.archived && (
                          <button className={styles.accionBtn} title="Editar"
                            onClick={() => router.push(`/dashboard/radicar/edit/${encodeURIComponent(r.radication_number)}`)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                        )}

                        {!r.archived && (
                          <button className={`${styles.accionBtn} ${styles.accionDelete}`}
                            title="Archivar" onClick={() => handleArchive(r.radication_number)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="21 8 21 21 3 21 3 8"/>
                              <rect x="1" y="3" width="22" height="5"/>
                              <line x1="10" y1="12" x2="14" y2="12"/>
                            </svg>
                          </button>
                        )}

                        {r.archived && (
                          <button className={styles.accionBtn} title="Desarchivar"
                            style={{ color: "#22c55e" }}
                            onClick={() => handleUnarchive(r.radication_number)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="21 8 21 21 3 21 3 8"/>
                              <rect x="1" y="3" width="22" height="5"/>
                              <polyline points="9 12 12 9 15 12"/>
                              <line x1="12" y1="9" x2="12" y2="17"/>
                            </svg>
                          </button>
                        )}

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
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className={styles.modalImgWrap}>
              <img src={stickerUrl} alt={`Rótulo ${stickerRadNumber}`} className={styles.modalImg} />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.modalBtnSecondary} onClick={handleCloseSticker}>Cerrar</button>
              <button className={styles.modalBtnPrimary} onClick={handleDownloadSticker}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className={styles.modalPdfWrap}>
              <iframe src={pdfUrl} className={styles.modalPdfFrame} title={`PDF ${pdfRadNumber}`} />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.modalBtnSecondary} onClick={handleClosePdf}>Cerrar</button>
              <button className={styles.modalBtnPrimary} onClick={handleDownloadPdf}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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