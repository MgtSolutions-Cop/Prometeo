"use client";
import { useState, useEffect } from "react";
import styles from "./labels.module.css";
import { getInboundRadications, getPrivateSticker } from "../../services/api";

export default function Labels() { // Cambiado a Mayúscula
  const [radicados, setRadicados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  
  // Estados para el Sticker
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null); // Faltaba este
  const [selectedRadication, setSelectedRadication] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getInboundRadications();
      setRadicados(data);
    } catch (error) {
      console.error("Error al cargar radicados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSticker = async (radicationNumber: string) => {
    try {
      const imageUrl = await getPrivateSticker(`${radicationNumber}.png`);
      setSelectedSticker(imageUrl);
      setSelectedRadication(radicationNumber);
    } catch (error) {
      alert("Error: No se pudo cargar el sticker. Es posible que el archivo físico no exista.");
    }
  };

  const handleCloseSticker = () => {
    if (selectedSticker) {
      URL.revokeObjectURL(selectedSticker);
    }
    setSelectedSticker(null);
    setSelectedRadication(null);
  };

  const handleDownloadSticker = () => {
    if (!selectedSticker || !selectedRadication) return;
    const link = document.createElement('a');
    link.href = selectedSticker;
    link.download = `Sticker_${selectedRadication}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = radicados.filter((r) =>
    [r.radication_number, r.subject, r.remitente].some(
      (v) => v && v.toLowerCase().includes(query.toLowerCase())
    )
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className={`${styles.statusBadge} ${styles.statusPending}`}>🔴 Radicado</span>;
      case 'assigned': return <span className={`${styles.statusBadge} ${styles.statusAssigned}`}>🏢 En Oficina</span>;
      case 'in_progress': return <span className={`${styles.statusBadge} ${styles.statusProgress}`}>⚙️ En Trámite</span>;
      case 'resolved': return <span className={`${styles.statusBadge} ${styles.statusResolved}`}>✅ Finalizado</span>;
      default: return <span className={styles.statusBadge}>{status}</span>;
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.heading}>
        <div>
          <h1 className={styles.h1}>Bandeja de Entrada</h1>
          <p className={styles.sub}>Historial de documentos radicados en el sistema</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <input
              className={styles.search}
              type="search"
              placeholder="Buscar por número, remitente o asunto..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.tableWrap}>
          {loading ? (
            <p className={styles.empty}>Cargando bandeja...</p>
          ) : (
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr>
                  <th className={styles.th}>Radicado</th>
                  <th className={styles.th}>Fecha</th>
                  <th className={styles.th}>Remitente</th>
                  <th className={styles.th}>Asunto</th>
                  <th className={styles.th}>Estado</th>
                  <th className={styles.thRight}>Rótulo</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.radication_number} className={styles.tr}>
                    <td className={styles.td}>
                      <span className={styles.radBadge}>{r.radication_number}</span>
                    </td>
                    <td className={styles.td}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className={styles.td}>{r.remitente}</td>
                    <td className={styles.td}>
                      <span className={styles.truncate} title={r.subject}>{r.subject}</span>
                    </td>
                    <td className={styles.td}>
                      {getStatusBadge(r.status)}
                    </td>
                    <td className={`${styles.td} ${styles.tdRight}`}>
                      <button className={styles.actionBtn} onClick={() => handleViewSticker(r.radication_number)}>
                        Ver Rótulo
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr className={styles.tr}>
                    <td className={styles.empty} colSpan={6}>No hay radicados de entrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedSticker && (
        <div className={styles.modalOverlay} onClick={handleCloseSticker}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={{marginTop: 0, color: '#fff'}}>Sticker Generado</h2>
            <img src={selectedSticker} alt="Sticker" style={{width: '100%', borderRadius: '8px', border: '1px solid #333'}} />
            
            <div style={{marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center'}}>
              <button className={styles.actionBtn} onClick={handleCloseSticker}>Cerrar</button>
              <button 
                className={styles.actionBtn} 
                onClick={handleDownloadSticker}
                style={{backgroundColor: '#b51e2a', color: '#fff', borderColor: '#b51e2a'}}
              >
                Descargar PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}