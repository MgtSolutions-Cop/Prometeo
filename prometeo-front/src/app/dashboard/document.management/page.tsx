// src/app/dashboard/document.management/page.tsx
import styles from "./document-management.module.css";

export default function DocumentManagementPage() {
  return (
    <div className={styles.wrap}>
      {/* Header interno */}
      <div className={styles.heading}>
        <div>
          <h1 className={styles.h1}>Gestión documental</h1>
          <p className={styles.sub}>
            Visualiza, sube y administra documentos dentro del sistema
          </p>
        </div>

        <span className={styles.badge}>📁 Documentos</span>
      </div>

      <div className={styles.card}>
        <div className={styles.topRow}>
          <p className={styles.info}>
            Aquí puedes visualizar, subir o eliminar documentos dentro del sistema.
          </p>

          <div className={styles.uploadSection}>
            <label className={styles.fileBox}>
              <input type="file" id="fileUpload" className={styles.fileInput} />
              <span>📎 Seleccionar archivo</span>
            </label>

            <button className={styles.uploadBtn}>Subir documento</button>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th className={styles.th}>Nombre</th>
                <th className={styles.th}>Fecha</th>
                <th className={styles.thRight}>Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr className={styles.tr}>
                <td className={styles.td}>
                  <div className={styles.docName}>
                    <span className={styles.docDot} />
                    Acta_01.pdf
                  </div>
                </td>
                <td className={styles.td}>2025-10-15</td>
                <td className={`${styles.td} ${styles.tdRight}`}>
                  <button className={styles.btnView}>Ver</button>
                  <button className={styles.btnDelete}>Eliminar</button>
                </td>
              </tr>

              {/* Ejemplo fila extra */}
              <tr className={styles.tr}>
                <td className={styles.td}>
                  <div className={styles.docName}>
                    <span className={styles.docDot} />
                    Informe_Finanzas.xlsx
                  </div>
                </td>
                <td className={styles.td}>2025-10-12</td>
                <td className={`${styles.td} ${styles.tdRight}`}>
                  <button className={styles.btnView}>Ver</button>
                  <button className={styles.btnDelete}>Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className={styles.tableHint}>
          Tip: más adelante podemos agregar búsqueda, paginación y previsualización.
        </p>
      </div>
    </div>
  );
}
