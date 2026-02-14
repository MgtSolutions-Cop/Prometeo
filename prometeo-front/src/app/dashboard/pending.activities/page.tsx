// src/app/dashboard/pending.activities/page.tsx
import styles from "./pending.activities.module.css";

export default function PendingActivitiesPage() {
  return (
    <div className={styles.wrap}>
      {/* Header interno */}
      <div className={styles.heading}>
        <div>
          <h1 className={styles.h1}>Actividades pendientes</h1>
          <p className={styles.sub}>
            Revisión, asignación y control de tareas por parte del administrador
          </p>
        </div>

        <span className={styles.badge}>✅ Gestión de tareas</span>
      </div>

      <div className={styles.card}>
        <p className={styles.info}>
          Aquí se mostrarán las actividades que requieren revisión o acción por parte
          de los usuarios. El administrador podrá marcarlas como completadas,
          asignarlas o eliminarlas.
        </p>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th className={styles.th}>ID</th>
                <th className={styles.th}>Descripción</th>
                <th className={styles.th}>Responsable</th>
                <th className={styles.th}>Estado</th>
                <th className={styles.thRight}>Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr className={styles.tr}>
                <td className={styles.td}>1</td>
                <td className={styles.td}>
                  <div className={styles.desc}>
                    <span className={styles.dot} />
                    Revisión de documentos
                  </div>
                </td>
                <td className={styles.td}>Juan Pérez</td>
                <td className={styles.td}>
                  <span className={`${styles.status} ${styles.pending}`}>Pendiente</span>
                </td>
                <td className={`${styles.td} ${styles.tdRight}`}>
                  <button className={styles.btnComplete}>Completar</button>
                  <button className={styles.btnDelete}>Eliminar</button>
                </td>
              </tr>

              {/* Ejemplo de otra fila */}
              <tr className={styles.tr}>
                <td className={styles.td}>2</td>
                <td className={styles.td}>
                  <div className={styles.desc}>
                    <span className={styles.dot} />
                    Validación de radicado
                  </div>
                </td>
                <td className={styles.td}>María Gómez</td>
                <td className={styles.td}>
                  <span className={`${styles.status} ${styles.inProgress}`}>En progreso</span>
                </td>
                <td className={`${styles.td} ${styles.tdRight}`}>
                  <button className={styles.btnComplete}>Completar</button>
                  <button className={styles.btnDelete}>Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className={styles.hint}>
          Tip: después añadimos filtros por estado, búsqueda y paginación.
        </p>
      </div>
    </div>
  );
}
