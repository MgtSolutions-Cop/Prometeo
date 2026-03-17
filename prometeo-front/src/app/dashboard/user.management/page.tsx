"use client";
import { useMemo, useState, useEffect } from "react";
import styles from "./user-management.module.css";
import { FaBan, FaCheckCircle, FaPenAlt, FaEye, FaEyeSlash, FaRandom } from "react-icons/fa";
import { getUsers, getRoles, createUser, updateUser, toggleUserState } from "../../services/api"; 

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "", 
    role_id: "",
    dependency_id: 1 
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([getUsers(), getRoles()]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      alert("Error al cargar los datos del servidor");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.full_name, u.email, getRoleName(u.role_id)].some(
        (v) => v && v.toLowerCase().includes(q)
      )
    );
  }, [users, query, roles]);

  function getRoleName(roleId: number) {
    const role = roles.find((r) => r.role_id === roleId);
    return role ? role.name : "Desconocido";
  }

  const handleOpenModal = (user?: any) => {
    if (user) {
      setEditingUserId(user.user_id);
      setFormData({
        full_name: user.full_name,
        email: user.email,
        password: "", // Se deja vacío para que decida si quiere cambiarla
        role_id: user.role_id,
        dependency_id: user.dependency_id || 1,
      });
    } else {
      setEditingUserId(null);
      setFormData({ full_name: "", email: "", password: "", role_id: "", dependency_id: 1 });
    }
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUserId(null);
  };

 const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUserId) {
        // Creamos un objeto limpio solo con los datos básicos
        const payload: any = {
          full_name: formData.full_name,
          email: formData.email,
          role_id: formData.role_id,
          dependency_id: formData.dependency_id
        };
        
        // Solo si el usuario escribió una contraseña nueva, la añadimos al payload
        if (formData.password.trim() !== "") {
          payload.password = formData.password;
        }

        await updateUser(editingUserId, payload);
      } else {
        // Crear
        if (!formData.password) return alert("La contraseña es obligatoria para nuevos usuarios");
        await createUser(formData);
      }
      await fetchData(); 
      handleCloseModal();
    } catch (error: any) {
      alert(error.message || "Error al guardar el usuario");
    }
  };

  const handleToggleState = async (id: number) => {
    if (!confirm("¿Estás seguro de cambiar el estado de este usuario?")) return;
    try {
      await toggleUserState(id);
      await fetchData(); 
    } catch (error: any) {
      alert("Error al cambiar el estado: " + error.message);
    }
  };

  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^*()_+";
    let newPassword = "";
    for (let i = 0; i < 12; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password: newPassword });
    setShowPassword(true);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.heading}>
        <div>
          <h1 className={styles.h1}>Gestión de usuarios</h1>
          <p className={styles.sub}>Crea, edita y administra roles de usuarios</p>
        </div>
      </div>

      <div className={styles.card}>
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
          <button className={styles.addButton} onClick={() => handleOpenModal()}>
            + Nuevo usuario
          </button>
        </div>

        <div className={styles.tableWrap}>
          {loading ? (
            <p className={styles.empty}>Cargando datos...</p>
          ) : (
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr>
                  <th className={styles.th}>Nombre</th>
                  <th className={styles.th}>Email</th>
                  <th className={styles.th}>Rol</th>
                  <th className={styles.th}>Estado</th>
                  <th className={styles.thRight}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.user_id} className={styles.tr} style={{ opacity: u.is_active ? 1 : 0.6 }}>
                    <td className={styles.td}>
                      <div className={styles.nameCell}>
                        <span className={styles.dot} style={{ backgroundColor: u.is_active ? '#b51e2a' : '#555' }} />
                        {u.full_name}
                      </div>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.mono}>{u.email}</span>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.roleBadge}>{getRoleName(u.role_id)}</span>
                    </td>
                    <td className={styles.td}>
                      {u.is_active ? 'Activo' : 'Inactivo'}
                    </td>
                    <td className={`${styles.td} ${styles.tdRight}`}>
                      
                      {/* Botón Editar original */}
                      <button className={styles.iconBtn} onClick={() => handleOpenModal(u)} title="Editar">
                        <FaPenAlt />
                      </button>
                      
                      {/* Botones Activar/Inactivar con tus clases originales */}
                      <button 
                        className={styles.iconBtn} 
                        onClick={() => handleToggleState(u.user_id)} 
                        title={u.is_active ? "Inactivar" : "Activar"}
                      >
                        {u.is_active ? <FaBan className={styles.inc} /> : <FaCheckCircle className={styles.chek} />}
                      </button>

                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr className={styles.tr}>
                    <td className={styles.empty} colSpan={5}>
                      No hay resultados para "{query}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>{editingUserId ? "Editar Usuario" : "Nuevo Usuario"}</h2>
            
            <form onSubmit={handleSaveUser}>
              <div className={styles.formGroup}>
                <label>Nombre Completo</label>
                <input 
                  required 
                  type="text" 
                  value={formData.full_name} 
                  onChange={e => setFormData({...formData, full_name: e.target.value})} 
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Email</label>
                <input 
                  required 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                />
              </div>

              {/* Ahora el campo de contraseña siempre se muestra */}
              <div className={styles.formGroup}>
                <label>Contraseña {editingUserId && <span style={{fontSize: '0.75rem', color: '#666'}}>(Opcional)</span>}</label>
                <div className={styles.passwordWrapper}>
                  <input 
                    required={!editingUserId} // Solo es obligatoria al crear
                    type={showPassword ? "text" : "password"} 
                    value={formData.password} 
                    placeholder={editingUserId ? "Dejar en blanco para no cambiar" : ""}
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                  />
                  <button 
                    type="button" 
                    className={styles.actionBtn} 
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  <button 
                    type="button" 
                    className={styles.actionBtn} 
                    onClick={handleGeneratePassword}
                    title="Generar contraseña segura"
                  >
                    <FaRandom />
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Rol</label>
                <select 
                  required 
                  value={formData.role_id} 
                  onChange={e => setFormData({...formData, role_id: e.target.value})}
                >
                  <option value="">Seleccione un rol...</option>
                  {roles.map(role => (
                    <option key={role.role_id} value={role.role_id}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={handleCloseModal} className={styles.cancelBtn}>Cancelar</button>
                <button type="submit" className={styles.saveBtn}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}