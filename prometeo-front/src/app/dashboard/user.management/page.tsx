"use client";

import { useMemo, useState } from "react";
import styles from "./user-management.module.css";

export default function UserManagement() {
  const [users] = useState([
    { id: 1, name: "Carlos Pérez", email: "carlos@empresa.com", role: "Entity Administrator" },
    { id: 2, name: "Laura Gómez", email: "laura@empresa.com", role: "Document Manager" },
  ]);

  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.name, u.email, u.role].some((v) => v.toLowerCase().includes(q))
    );
  }, [users, query]);

  const handleAddUser = () => console.log("Abrir modal para crear usuario");
  const handleEditUser = (id: number) => console.log("Editar usuario", id);
  const handleDeleteUser = (id: number) => console.log("Eliminar usuario", id);

  return (
    <div className={styles.wrap}>
      {/* Header interno */}
      <div className={styles.heading}>
        <div>
          <h1 className={styles.h1}>Gestión de usuarios</h1>
          <p className={styles.sub}>Crea, edita y administra roles de usuarios</p>
        </div>

        <span className={styles.badge}>👤 Admin</span>
      </div>

      <div className={styles.card}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <input
              className={styles.search}
              type="search"
              placeholder="Buscar por nombre, email o rol..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <span className={styles.searchHint}>
              {filtered.length}/{users.length}
            </span>
          </div>

          <button className={styles.addButton} onClick={handleAddUser}>
            + Nuevo usuario
          </button>
        </div>

        {/* Tabla */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th className={styles.th}>#</th>
                <th className={styles.th}>Nombre</th>
                <th className={styles.th}>Email</th>
                <th className={styles.th}>Rol</th>
                <th className={styles.thRight}>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className={styles.tr}>
                  <td className={styles.td}>{u.id}</td>
                  <td className={styles.td}>
                    <div className={styles.nameCell}>
                      <span className={styles.dot} />
                      {u.name}
                    </div>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.mono}>{u.email}</span>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.roleBadge}>{u.role}</span>
                  </td>
                  <td className={`${styles.td} ${styles.tdRight}`}>
                    <button className={styles.iconBtn} onClick={() => handleEditUser(u.id)} aria-label="Editar">
                      ✏️
                    </button>
                    <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => handleDeleteUser(u.id)} aria-label="Eliminar">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr className={styles.tr}>
                  <td className={styles.empty} colSpan={5}>
                    No hay resultados para “{query}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className={styles.hint}>
          Tip: luego agregamos modal “Crear/Editar usuario” y confirmación de borrado.
        </p>
      </div>
    </div>
  );
}
