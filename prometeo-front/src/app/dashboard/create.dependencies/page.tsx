//src/app/dashboard/create.dependencies/page.tsx
"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import styles from "./create-dependencies.module.css";
import { fetchWithAuth } from "../../services/api";

interface Dependency {
  dependency_id: number;
  name: string;
  state: boolean;
  entity_id: number;
}

export default function CreateDependencies() {
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [loading,      setLoading]      = useState(true);

  // ── Modal crear/editar ──
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editingDep,  setEditingDep]  = useState<Dependency | null>(null);
  const [nameInput,   setNameInput]   = useState("");
  const [saving,      setSaving]      = useState(false);

  const fetchDeps = () => {
    setLoading(true);
    fetchWithAuth("/dependencies")
      .then(setDependencies)
      .catch((e: any) => toast.error("Error al cargar dependencias: " + e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDeps(); }, []);

  // ── Abrir modal crear ──
  function handleOpenCreate() {
    setEditingDep(null);
    setNameInput("");
    setModalOpen(true);
  }

  // ── Abrir modal editar ──
  function handleOpenEdit(dep: Dependency) {
    setEditingDep(dep);
    setNameInput(dep.name);
    setModalOpen(true);
  }

  // ── Guardar (crear o editar) ──
  async function handleSave() {
    if (!nameInput.trim()) {
      toast.warning("El nombre no puede estar vacío");
      return;
    }
    setSaving(true);
    const toastId = toast.loading(editingDep ? "Actualizando..." : "Creando dependencia...");
    try {
      if (editingDep) {
        await fetchWithAuth(`/dependencies/${editingDep.dependency_id}`, {
          method: "PUT",
          body: JSON.stringify({ name: nameInput.trim() }),
        });
        toast.success("Dependencia actualizada", { id: toastId });
      } else {
        await fetchWithAuth("/dependencies", {
          method: "POST",
          body: JSON.stringify({ name: nameInput.trim() }),
        });
        toast.success("Dependencia creada exitosamente", { id: toastId });
      }
      setModalOpen(false);
      fetchDeps();
    } catch (e: any) {
      toast.error(e.message || "Error al guardar", { id: toastId });
    } finally {
      setSaving(false);
    }
  }

  // ── Toggle estado ──
  async function handleToggle(dep: Dependency) {
    const toastId = toast.loading(dep.state ? "Desactivando..." : "Activando...");
    try {
      await fetchWithAuth(`/dependencies/${dep.dependency_id}/state`, { method: "PATCH" });
      toast.success(
        dep.state ? `"${dep.name}" desactivada` : `"${dep.name}" activada`,
        { id: toastId }
      );
      fetchDeps();
    } catch (e: any) {
      toast.error(e.message || "Error al cambiar estado", { id: toastId });
    }
  }

  // ── Eliminar ──
  async function handleDelete(dep: Dependency) {
    toast(`¿Eliminar la dependencia "${dep.name}"?`, {
      action: {
        label: "Eliminar",
        onClick: async () => {
          const toastId = toast.loading("Eliminando...");
          try {
            await fetchWithAuth(`/dependencies/${dep.dependency_id}`, { method: "DELETE" });
            toast.success(`"${dep.name}" eliminada`, { id: toastId });
            fetchDeps();
          } catch (e: any) {
            toast.error(e.message || "Error al eliminar", { id: toastId });
          }
        },
      },
      cancel: { label: "Cancelar", onClick: () => {} },
    });
  }

  const activas   = dependencies.filter((d) => d.state);
  const inactivas = dependencies.filter((d) => !d.state);

  return (
    <div className={styles.wrap}>

      {/* ── Heading ── */}
      <div className={styles.heading}>
        <div>
          <h1 className={styles.h1}>Dependencias</h1>
          <p className={styles.sub}>Administra las dependencias organizacionales del sistema</p>
        </div>
        <span className={styles.badge}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2"/>
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
          </svg>
          Estructura
        </span>
      </div>

      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        <button className={styles.addButton} onClick={handleOpenCreate}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nueva dependencia
        </button>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
          {activas.length} activa{activas.length !== 1 ? "s" : ""} · {inactivas.length} inactiva{inactivas.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Estados ── */}
      {loading && <p className={styles.stateMsg}>Cargando dependencias...</p>}
      {!loading && dependencies.length === 0 && (
        <p className={styles.stateMsg}>No hay dependencias registradas.</p>
      )}

      {/* ── Grid ── */}
      {!loading && dependencies.length > 0 && (
        <div className={styles.grid}>
          {dependencies.map((dep) => (
            <div key={dep.dependency_id}
              className={styles.card}
              style={{ opacity: dep.state ? 1 : 0.55 }}>

              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>{dep.name}</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className={`${styles.stateBadge} ${dep.state ? styles.stateActive : styles.stateInactive}`}>
                    {dep.state ? "Activa" : "Inactiva"}
                  </span>
                  <span className={styles.cardId}>#{dep.dependency_id}</span>
                </div>
              </div>

              <div className={styles.actions}>
                {/* Editar */}
                <button className={styles.iconBtn} onClick={() => handleOpenEdit(dep)} title="Editar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>

                {/* Toggle estado */}
                <button className={styles.iconBtn} onClick={() => handleToggle(dep)}
                  title={dep.state ? "Desactivar" : "Activar"}
                  style={{ color: dep.state ? "#f59e0b" : "#22c55e" }}>
                  {dep.state ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="9 12 11 14 15 10"/>
                    </svg>
                  )}
                </button>

                {/* Eliminar */}
                <button className={`${styles.iconBtn} ${styles.danger}`}
                  onClick={() => handleDelete(dep)} title="Eliminar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══ MODAL CREAR / EDITAR ══ */}
      {modalOpen && (
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>

            <div className={styles.modalHeader}>
              <div>
                <p className={styles.modalEyebrow}>
                  {editingDep ? "Editar dependencia" : "Nueva dependencia"}
                </p>
                <p className={styles.modalTitle}>
                  {editingDep ? editingDep.name : "Crear nueva"}
                </p>
              </div>
              <button className={styles.modalClose} onClick={() => setModalOpen(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1 }}>
                  Nombre de la dependencia *
                </label>
                <input
                  autoFocus
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  placeholder="Ej: Secretaría General"
                  style={{
                    marginTop: 8,
                    width: "100%",
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 8,
                    color: "#fff",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div className={styles.modalActions}>
                <button className={styles.modalBtnSecondary} onClick={() => setModalOpen(false)}>
                  Cancelar
                </button>
                <button className={styles.modalBtnPrimary} onClick={handleSave} disabled={saving}>
                  {saving ? "Guardando..." : editingDep ? "Guardar cambios" : "Crear dependencia"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}