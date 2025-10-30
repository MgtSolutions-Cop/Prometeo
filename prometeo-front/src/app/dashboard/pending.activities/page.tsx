import styles from "./pending.activities.module.css";

export default function PendingActivitiesPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Actividades Pendientes</h1>

      <div className={styles.card}>
        <p className={styles.info}>
          Aquí se mostrarán las actividades que requieren revisión o acción
          por parte de los usuarios. El administrador podrá marcarlas como
          completadas, asignarlas o eliminarlas.
        </p>

        <table className={styles.table}>
          <thead>
            <tr className={styles.tr}>
              <th className={styles.th}>ID</th>
              <th className={styles.th}>Descripción</th>
              <th className={styles.th}>Responsable</th>
              <th className={styles.th}>Estado</th>
              <th className={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr className={styles.tr}>
              <td className={styles.td}>1</td>
              <td className={styles.td}>Revisión de documentos</td>
              <td className={styles.td}>Juan Pérez</td>
              <td className={styles.td}>Pendiente</td>
              <td className={styles.td}>
                <button className={styles.btnComplete}>Completar</button>
                <button className={styles.btnDelete}>Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
