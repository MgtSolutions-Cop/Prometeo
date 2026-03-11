// src/app/dashboard/document.management/page.tsx
import styles from "./document-management.module.css";

export default function DocumentManagementPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.heading}>
        <div>
          <h1 className={styles.h1}>Gestión documental</h1>
          <p className={styles.sub}>
            Visualiza, sube y administra documentos dentro del sistema
          </p>
        </div>
        <span className={styles.badge}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          Documentos
        </span>
      </div>

      <div className={styles.card}>
        <div className={styles.topRow}>
          <p className={styles.info}>
            Aquí puedes visualizar, subir o eliminar documentos dentro del sistema.
          </p>
          <div className={styles.uploadSection}>
            <label className={styles.fileBox}>
              <input type="file" id="fileUpload" className={styles.fileInput} />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.41a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
              <span>Seleccionar archivo</span>
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