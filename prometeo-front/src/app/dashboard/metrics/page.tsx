import styles from "./metrics.module.css";

export default function MetricsPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Métricas del Sistema</h1>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>Total de Usuarios</h3>
          <p className={styles.number}>256</p>
        </div>
        <div className={styles.card}>
          <h3>Documentos Procesados</h3>
          <p className={styles.number}>1,042</p>
        </div>
        <div className={styles.card}>
          <h3>Actividades Pendientes</h3>
          <p className={styles.number}>14</p>
        </div>
        <div className={styles.card}>
          <h3>Dependencias Creadas</h3>
          <p className={styles.number}>12</p>
        </div>
      </div>
    </div>
  );
}
