import styles from "./document-management.module.css";

export default function DocumentManagementPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Gestión Documental</h1>

      <div className={styles.card}>
        <p className={styles.info}>
          Aquí puedes visualizar, subir o eliminar documentos dentro del sistema.
        </p>

        <div className={styles.uploadSection}>
          <input type="file" id="fileUpload" className={styles.fileInput} />
          <button className={styles.uploadBtn}>Subir Documento</button>
        </div>

        <table className={styles.table}>
          <thead>
            <tr className={styles.tr}>
              <th className={styles.th}>Nombre</th>
              <th className={styles.th}>Fecha</th>
              <th className={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr className={styles.tr}>
              <td className={styles.td}>Acta_01.pdf</td>
              <td className={styles.td}>2025-10-15</td>
              <td className={styles.td}>
                <button className={styles.btnView}>Ver</button>
                <button className={styles.btnDelete}>Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
