"use client";
import { useState } from "react";
import styles from "./user-management.module.css";

export default function UserManagement() {
  const [users, setUsers] = useState([
    { id: 1, name: "Carlos Pérez", email: "carlos@empresa.com", role: "Entity Administrator" },
    { id: 2, name: "Laura Gómez", email: "laura@empresa.com", role: "Document Manager" },
  ]);

  const handleAddUser = () => console.log("Abrir modal para crear usuario");
  const handleEditUser = (id: number) => console.log("Editar usuario", id);
  const handleDeleteUser = (id: number) => console.log("Eliminar usuario", id);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>User Management</h1>
      <button className={styles.addButton} onClick={handleAddUser}>
        + Add New User
      </button>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <button className={styles.edit} onClick={() => handleEditUser(u.id)}>
                  ✏️
                </button>
                <button className={styles.delete} onClick={() => handleDeleteUser(u.id)}>
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
