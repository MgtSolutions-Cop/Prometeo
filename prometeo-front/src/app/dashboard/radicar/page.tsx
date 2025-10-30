import styles from "./radicar.module.css";

export default function RadicarPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Radicación de Documentos</h1>

      <div className={styles.formCard}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Asunto:</label>
          <input type="text" className={styles.input} placeholder="Ingrese el asunto" />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Dependencia:</label>
          <select className={styles.select}>
            <option>Seleccione una dependencia</option>
            <option>Recursos Humanos</option>
            <option>Finanzas</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Archivo:</label>
          <input type="file" className={styles.fileInput} />
        </div>

        <button className={styles.submitButton}>Radicar Documento</button>
      </div>
    </div>
  );
}
