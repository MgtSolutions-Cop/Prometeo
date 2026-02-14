// src/app/dashboard/metrics/page.tsx
import styles from "./metrics.module.css";

export default function MetricsPage() {
  return (
    <div className={styles.wrap}>
      {/* Header interno */}
      <div className={styles.heading}>
        <div>
          <h1 className={styles.h1}>Métricas</h1>
          <p className={styles.sub}>
            Indicadores generales del sistema Prometeo
          </p>
        </div>

        <span className={styles.badge}>📊 En tiempo real</span>
      </div>

      {/* Grid de métricas */}
      <div className={styles.grid}>
        <div className={styles.card}>
          <p className={styles.label}>Usuarios totales</p>
          <p className={styles.value}>256</p>
          <p className={styles.hint}>+12 este mes</p>
        </div>

        <div className={styles.card}>
          <p className={styles.label}>Documentos procesados</p>
          <p className={styles.value}>1,042</p>
          <p className={styles.hint}>Últimos 30 días</p>
        </div>

        <div className={styles.card}>
          <p className={styles.label}>Actividades pendientes</p>
          <p className={styles.value}>14</p>
          <p className={styles.hint}>3 críticas</p>
        </div>

        <div className={styles.card}>
          <p className={styles.label}>Dependencias creadas</p>
          <p className={styles.value}>12</p>
          <p className={styles.hint}>Sistema activo</p>
        </div>
      </div>
    </div>
  );
}
