"use client";

import { useState } from "react";
import styles from "./create-dependencies.module.css";

export default function CreateDependencies() {
  const [dependencies] = useState([
    { id: 1, name: "Finance Department", description: "Handles all financial operations" },
    { id: 2, name: "IT Department", description: "Responsible for system maintenance" },
  ]);

  const handleAdd = () => console.log("Abrir modal para crear dependencia");
  const handleEdit = (id: number) => console.log("Editar dependencia", id);
  const handleDelete = (id: number) => console.log("Eliminar dependencia", id);

  return (
    <div className={styles.wrap}>
      {/* Header interno */}
      <div className={styles.heading}>
        <div>
          <h1 className={styles.h1}>Crear dependencias</h1>
          <p className={styles.sub}>
            Administra las dependencias organizacionales del sistema
          </p>
        </div>

        <span className={styles.badge}>🏢 Estructura</span>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <button className={styles.addButton} onClick={handleAdd}>
          + Nueva dependencia
        </button>
      </div>

      {/* Cards */}
      <div className={styles.grid}>
        {dependencies.map((dep) => (
          <div key={dep.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>{dep.name}</h2>
              <span className={styles.cardId}>#{dep.id}</span>
            </div>

            <p className={styles.cardDesc}>{dep.description}</p>

            <div className={styles.actions}>
              <button
                className={styles.iconBtn}
                onClick={() => handleEdit(dep.id)}
                aria-label="Editar"
              >
                ✏️
              </button>
              <button
                className={`${styles.iconBtn} ${styles.danger}`}
                onClick={() => handleDelete(dep.id)}
                aria-label="Eliminar"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className={styles.hint}>
        Tip: luego podemos añadir jerarquía, responsables y estados activos/inactivos.
      </p>
    </div>
  );
}
