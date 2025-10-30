"use client";
import { useState } from "react";
import styles from "./create-dependencies.module.css";

export default function CreateDependencies() {
  const [dependencies, setDependencies] = useState([
    { id: 1, name: "Finance Department", description: "Handles all financial operations" },
    { id: 2, name: "IT Department", description: "Responsible for system maintenance" },
  ]);

  const handleAdd = () => console.log("Abrir modal para crear dependencia");
  const handleEdit = (id: number) => console.log("Editar dependencia", id);
  const handleDelete = (id: number) => console.log("Eliminar dependencia", id);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dependency Management</h1>
      <button className={styles.addButton} onClick={handleAdd}>
        + Add New Dependency
      </button>

      <div className={styles.cardContainer}>
        {dependencies.map((dep) => (
          <div key={dep.id} className={styles.card}>
            <h2>{dep.name}</h2>
            <p>{dep.description}</p>
            <div className={styles.actions}>
              <button className={styles.edit} onClick={() => handleEdit(dep.id)}>
                ✏️
              </button>
              <button className={styles.delete} onClick={() => handleDelete(dep.id)}>
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
