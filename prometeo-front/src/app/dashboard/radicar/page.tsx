// src/app/dashboard/radicar/page.tsx
import styles from "./radicar.module.css";

export default function RadicarPage() {
  return (
    <div className={styles.wrap}>
      {/* Header interno */}
      <div className={styles.heading}>
        <div>
          <h1 className={styles.h1}>Radicación</h1>
          <p className={styles.sub}>
            Registra y radica documentos dentro del sistema
          </p>
        </div>

        <span className={styles.badge}>📄 Nuevo documento</span>
      </div>

      {/* Formulario */}
      <div className={styles.card}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Asunto</label>
          <input
            type="text"
            className={styles.input}
            placeholder="Ingrese el asunto del documento"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Dependencia</label>
          <select className={styles.select}>
            <option value="">Seleccione una dependencia</option>
            <option>Recursos Humanos</option>
            <option>Finanzas</option>
            <option>Jurídica</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Archivo</label>

          <label className={styles.fileBox}>
            <input type="file" className={styles.fileInput} />
            <span>📎 Seleccionar archivo</span>
          </label>
        </div>

        <button className={styles.submitButton}>
          Radicar documento
        </button>
      </div>
    </div>
  );
}
