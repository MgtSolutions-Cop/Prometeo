"use client";
import { useState } from "react";
import styles from "./create-dependencies.module.css";

export default function CreateDependencies() {
  const [dependencies] = useState([
    { id: 1, name: "Finance Department",  description: "Handles all financial operations" },
    { id: 2, name: "IT Department",       description: "Responsible for system maintenance" },
  ]);

  const handleAdd    = () => console.log("Abrir modal para crear dependencia");
  const handleEdit   = (id: number) => console.log("Editar dependencia", id);
  const handleDelete = (id: number) => console.log("Eliminar dependencia", id);

  return (
    <div className={styles.wrap}>
      <div className={styles.heading}>
        <div>
          <h1 className={styles.h1}>Crear dependencias</h1>
          <p className={styles.sub}>Administra las dependencias organizacionales del sistema</p>
        </div>
        <span className={styles.badge}>
          {/* Building / office icon */}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2"/>
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
            <line x1="12" y1="12" x2="12" y2="12.01"/>
          </svg>
          Estructura
        </span>
      </div>

      <div className={styles.toolbar}>
        <button className={styles.addButton} onClick={handleAdd}>
          + Nueva dependencia
        </button>
      </div>

      <div className={styles.grid}>
        {dependencies.map((dep) => (
          <div key={dep.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>{dep.name}</h2>
              <span className={styles.cardId}>#{dep.id}</span>
            </div>
            <p className={styles.cardDesc}>{dep.description}</p>
            <div className={styles.actions}>
              {/* Editar */}
              <button className={styles.iconBtn} onClick={() => handleEdit(dep.id)} aria-label="Editar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              {/* Eliminar */}
              <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => handleDelete(dep.id)} aria-label="Eliminar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

      
    </div>
  );
}