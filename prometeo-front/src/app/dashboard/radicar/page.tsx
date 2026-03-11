// src/app/dashboard/radicar/page.tsx
import styles from "./radicar.module.css";

export default function RadicarPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.heading}>
        <div>
          <h1 className={styles.h1}>Radicación</h1>
          <p className={styles.sub}>Registra y radica documentos dentro del sistema</p>
        </div>
        <span className={styles.badge}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          Nuevo documento
        </span>
      </div>

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
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.41a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
            </svg>
            <span>Seleccionar archivo</span>
          </label>
        </div>

        <button className={styles.submitButton}>
          Radicar documento
        </button>
      </div>
    </div>
  );
}