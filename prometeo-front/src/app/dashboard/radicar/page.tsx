"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./radicar.module.css";
import {
  getAllRadications,
  getPrivateSticker,
  getRadicationPDFUrl,
  archiveRadication,
  updateRadication,
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

interface EditForm {
  subject:         string;
  remitente:       string;
  fecha_documento: string;
  observaciones:   string;
  status:          string;
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
  const [radicados, setRadicados] = useState<Radicado[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [filtro,    setFiltro]    = useState("Todos");
  const [busqueda,  setBusqueda]  = useState("");

  // ── Modal rótulo ──
  const [stickerUrl,       setStickerUrl]       = useState<string | null>(null);
  const [stickerRadNumber, setStickerRadNumber] = useState<string>("");
  const [loadingSticker,   setLoadingSticker]   = useState<string | null>(null);

  // ── Modal PDF ──
  const [pdfUrl,       setPdfUrl]       = useState<string | null>(null);
  const [pdfRadNumber, setPdfRadNumber] = useState<string>("");
  const [loadingPdf,   setLoadingPdf]   = useState<string | null>(null);

  // ── Modal editar ──
  const [editModal,      setEditModal]      = useState(false);
  const [editRadNumber,  setEditRadNumber]  = useState<string>("");
  const [editForm,       setEditForm]       = useState<EditForm>({
    subject: "", remitente: "", fecha_documento: "", observaciones: "", status: "pending"
  });
  const [editLoading,    setEditLoading]    = useState(false);
  const [editError,      setEditError]      = useState<string>("");

  const fetchData = () => {
    setLoading(true);
    getAllRadications()
      .then(setRadicados)
      .catch((e) => setError(e.message))
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
    // Filtro archivados
    if (filtro === "Archivados") return r.archived === true;
    // El resto excluye archivados
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
      alert("No se pudo cargar el rótulo: " + e.message);
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
  }

  // ── Handlers PDF ──
  async function handleViewPDF(radicationNumber: string) {
    try {
      setLoadingPdf(radicationNumber);
      const url = await getRadicationPDFUrl(radicationNumber);
      setPdfUrl(url); setPdfRadNumber(radicationNumber);
    } catch (e: any) {
      alert("No se pudo cargar el PDF: " + e.message);
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
  }

  // ── Handler archivar ──
  async function handleArchive(radicationNumber: string) {
    if (!confirm(`¿Archivar el radicado ${radicationNumber}? Esta acción no se puede deshacer.`)) return;
    try {
      await archiveRadication(radicationNumber);
      fetchData();
    } catch (e: any) {
      alert("Error al archivar: " + e.message);
    }
  }

  // ── Handlers editar ──
  function handleOpenEdit(r: Radicado) {
    setEditRadNumber(r.radication_number);
    setEditForm({
      subject:         r.subject         || "",
      remitente:       r.remitente       || "",
      fecha_documento: r.fecha_documento || "",
      observaciones:   r.observaciones   || "",
      status:          r.status          || "pending",
    });
    setEditError("");
    setEditModal(true);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    try {
      await updateRadication(editRadNumber, editForm);
      setEditModal(false);
      fetchData();
    } catch (err: any) {
      setEditError(err.message || "Error al actualizar");
    } finally {
      setEditLoading(false);
    }
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
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
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

      {/* ── Estados ── */}
      {loading && <p className={styles.stateMsg}>Cargando radicados...</p>}
      {error   && <p className={`${styles.stateMsg} ${styles.stateMsgError}`}>{error}</p>}
      {!loading && !error && datos.length === 0 && (
        <p className={styles.stateMsg}>
          {filtro === "Archivados" ? "No hay radicados archivados." : "Sin radicados para mostrar."}
        </p>
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
                  <tr key={r.radication_number}
                    className={styles.tr}
                    style={{ opacity: r.archived ? 0.6 : 1 }}>

                    <td className={`${styles.td} ${styles.tdId}`}>
                      {r.radication_number}
                      {r.archived && (
                        <span className={styles.archivedBadge}>Archivado</span>
                      )}
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

                    <td className={styles.td}>
                      <StatusTimeline status={r.status ?? "pending"} />
                    </td>

                    <td className={styles.td}>
                      <div className={styles.acciones}>

                        {/* Ver PDF */}
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

                        {/* Ver rótulo */}
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

                        {/* Editar — solo si no está archivado */}
                        {!r.archived && (
                          <button className={styles.accionBtn} title="Editar"
                            onClick={() => handleOpenEdit(r)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                        )}

                        {/* Archivar — solo si no está archivado */}
                        {!r.archived && (
                          <button
                            className={`${styles.accionBtn} ${styles.accionDelete}`}
                            title="Archivar"
                            onClick={() => handleArchive(r.radication_number)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="21 8 21 21 3 21 3 8"/>
                              <rect x="1" y="3" width="22" height="5"/>
                              <line x1="10" y1="12" x2="14" y2="12"/>
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

      {/* ══ MODAL EDITAR ══ */}
      {editModal && (
        <div className={styles.modalOverlay} onClick={() => setEditModal(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "520px" }}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.modalEyebrow}>Editar radicado</p>
                <p className={styles.modalTitle}>{editRadNumber}</p>
              </div>
              <button className={styles.modalClose} onClick={() => setEditModal(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>

              <div className={styles.editField}>
                <label className={styles.editLabel}>Asunto</label>
                <input className={styles.editInput} type="text"
                  value={editForm.subject}
                  onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })} />
              </div>

              <div className={styles.editField}>
                <label className={styles.editLabel}>Remitente</label>
                <input className={styles.editInput} type="text"
                  value={editForm.remitente}
                  onChange={(e) => setEditForm({ ...editForm, remitente: e.target.value })} />
              </div>

              <div className={styles.editField}>
                <label className={styles.editLabel}>Fecha del documento</label>
                <input className={styles.editInput} type="date"
                  value={editForm.fecha_documento}
                  onChange={(e) => setEditForm({ ...editForm, fecha_documento: e.target.value })} />
              </div>

              <div className={styles.editField}>
                <label className={styles.editLabel}>Estado</label>
                <select className={styles.editInput}
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                  <option value="pending">Recibido</option>
                  <option value="in_review">En revisión</option>
                  <option value="approved">Aprobado</option>
                </select>
              </div>

              <div className={styles.editField}>
                <label className={styles.editLabel}>Observaciones</label>
                <input className={styles.editInput} type="text"
                  value={editForm.observaciones}
                  onChange={(e) => setEditForm({ ...editForm, observaciones: e.target.value })} />
              </div>

              {editError && (
                <p style={{ color: "#E53935", fontSize: "13px", margin: 0 }}>{editError}</p>
              )}

              <div className={styles.modalActions}>
                <button type="button" className={styles.modalBtnSecondary}
                  onClick={() => setEditModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className={styles.modalBtnPrimary} disabled={editLoading}>
                  {editLoading ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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