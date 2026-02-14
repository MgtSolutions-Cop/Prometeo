// src/app/dashboard/page.tsx
import styles from "./page.module.css";

export default function DashboardPage() {
  return (
    <div className={styles.wrap}>
      {/* Header interno del dashboard (debajo de tu Header global) */}
      <div className={styles.heading}>
        <div>
          <h1 className={styles.h1}>Dashboard</h1>
          <p className={styles.sub}>Resumen general de tus archivos y actividad reciente</p>
        </div>

        <span className={styles.badge}>📌 Estado: Operativo</span>
      </div>

      {/* KPIs (puedes conectar a datos reales después) */}
      <div className={styles.kpis}>
        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>Archivos totales</p>
          <p className={styles.kpiValue}>128</p>
          <p className={styles.kpiHint}>+6 esta semana</p>
        </div>

        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>Pendientes</p>
          <p className={styles.kpiValue}>7</p>
          <p className={styles.kpiHint}>2 vencen hoy</p>
        </div>

        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>Última radicación</p>
          <p className={styles.kpiValue}>Hoy</p>
          <p className={styles.kpiHint}>14:32</p>
        </div>
      </div>

      <h3 className={styles.sectionTitle}>Recientes</h3>

      {/* Cards */}
      <div className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Archivo 1</h2>
          <p className={styles.cardMeta}>Última modificación: hoy</p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Archivo 2</h2>
          <p className={styles.cardMeta}>Última modificación: ayer</p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Archivo 3</h2>
          <p className={styles.cardMeta}>Última modificación: hace 1 semana</p>
        </div>
      </div>
    </div>
  );
}
