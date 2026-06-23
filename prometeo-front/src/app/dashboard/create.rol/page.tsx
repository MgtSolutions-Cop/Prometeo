"use client";
import { useMemo, useState, useEffect } from "react";
import styles from "./rol.module.css";
import { FaBan, FaCheckCircle, FaPenAlt } from "react-icons/fa";
import { getRoles, createRole, updateRole, toggleRoleState } from "../../services/api"; 

export default function RoleManagement() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  
  // Estado del formulario con booleanos para los permisos
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    can_create_users: false,
    can_assign_roles: false,
    can_configure_trd: false,
    can_radicate_documents: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const rolesData = await getRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error("Error al cargar roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((r) =>
      [r.name, r.description].some(
        (v) => v && v.toLowerCase().includes(q)
      )
    );
  }, [roles, query]);

  const handleOpenModal = (role?: any) => {
    if (role) {
      setEditingRoleId(role.role_id);
      setFormData({
        name: role.name,
        description: role.description || "",
        can_create_users: role.can_create_users,
        can_assign_roles: role.can_assign_roles,
        can_configure_trd: role.can_configure_trd,
        can_radicate_documents: role.can_radicate_documents,
      });
    } else {
      setEditingRoleId(null);
      setFormData({ 
        name: "", 
        description: "", 
        can_create_users: false, 
        can_assign_roles: false, 
        can_configure_trd: false, 
        can_radicate_documents: false 
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRoleId(null);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRoleId) {
        await updateRole(editingRoleId, formData);
      } else {
        await createRole(formData);
      }
      await fetchData(); 
      handleCloseModal();
    } catch (error: any) {
      alert(error.message || "Error al guardar el rol");
    }
  };

  const handleToggleState = async (id: number) => {
    if (!confirm("¿Estás seguro de cambiar el estado de este rol?")) return;
    try {
      await toggleRoleState(id);
      await fetchData(); 
    } catch (error: any) {
      alert("Error al cambiar el estado: " + error.message);
    }
  };

  // Helper para renderizar los permisos como pequeñas etiquetas
  const renderPermissions = (role: any) => {
    const perms = [];
    if (role.can_create_users) perms.push("Usuarios");
    if (role.can_assign_roles) perms.push("Roles");
    if (role.can_configure_trd) perms.push("TRD");
    if (role.can_radicate_documents) perms.push("Radicar");

    if (perms.length === 0) return <span className={styles.permBadge}>Sin permisos extra</span>;
    
    return (
      <div className={styles.permContainer}>
        {perms.map(p => <span key={p} className={styles.permBadge}>{p}</span>)}
      </div>
    );
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.heading}>
        <div>
          <h1 className={styles.h1}>Gestión de Roles</h1>
          <p className={styles.sub}>Administra los niveles de acceso y permisos del sistema</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <input
              className={styles.search}
              type="search"
              placeholder="Buscar rol por nombre..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <span className={styles.searchHint}>
              {filtered.length}/{roles.length}
            </span>
          </div>
          <button className={styles.addButton} onClick={() => handleOpenModal()}>
            + Nuevo Rol
          </button>
        </div>

        <div className={styles.tableWrap}>
          {loading ? (
            <p className={styles.empty}>Cargando roles...</p>
          ) : (
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr>
                  <th className={styles.th}>Nombre del Rol</th>
                  <th className={styles.th}>Descripción</th>
                  <th className={styles.th}>Permisos Clave</th>
                  <th className={styles.th}>Estado</th>
                  <th className={styles.thRight}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  // MOCK: Si el backend aún no envía is_active, asumimos true para que no se rompa la vista
                  const isActive = r.is_active !== undefined ? r.is_active : true;
                  
                  return (
                  <tr key={r.role_id} className={styles.tr} style={{ opacity: isActive ? 1 : 0.6 }}>
                    <td className={styles.td}>
                      <div className={styles.nameCell}>
                        <span className={styles.dot} style={{ backgroundColor: isActive ? '#b51e2a' : '#555' }} />
                        {r.name}
                      </div>
                    </td>
                    <td className={styles.td}>
                      <span style={{color: '#888', fontSize: '0.8rem'}}>{r.description || 'Sin descripción'}</span>
                    </td>
                    <td className={styles.td}>
                      {renderPermissions(r)}
                    </td>
                    <td className={styles.td}>
                      {isActive ? 'Activo' : 'Inactivo'}
                    </td>
                    <td className={`${styles.td} ${styles.tdRight}`}>
                      
                      <button className={styles.iconBtn} onClick={() => handleOpenModal(r)} title="Editar">
                        <FaPenAlt />
                      </button>
                      
                      <button 
                        className={styles.iconBtn} 
                        onClick={() => handleToggleState(r.role_id)} 
                        title={isActive ? "Inactivar" : "Activar"}
                      >
                        {isActive ? <FaBan className={styles.inc} /> : <FaCheckCircle className={styles.chek} />}
                      </button>

                    </td>
                  </tr>
                )})}
                {filtered.length === 0 && (
                  <tr className={styles.tr}>
                    <td className={styles.empty} colSpan={5}>
                      No se encontraron roles.
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
            <h2>{editingRoleId ? "Editar Rol" : "Nuevo Rol"}</h2>
            
            <form onSubmit={handleSaveRole}>
              <div className={styles.formGroup}>
                <label>Nombre del Rol</label>
                <input 
                  required 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Descripción</label>
                <input 
                  type="text" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  placeholder="Breve descripción de las funciones..."
                />
              </div>

              <div className={styles.formGroup}>
                <label>Configuración de Permisos</label>
                <div className={styles.permissionsGrid}>
                  
                  <label className={styles.checkboxGroup}>
                    <input 
                      type="checkbox" 
                      checked={formData.can_create_users} 
                      onChange={e => setFormData({...formData, can_create_users: e.target.checked})} 
                    />
                    Crear y editar usuarios
                  </label>

                  <label className={styles.checkboxGroup}>
                    <input 
                      type="checkbox" 
                      checked={formData.can_assign_roles} 
                      onChange={e => setFormData({...formData, can_assign_roles: e.target.checked})} 
                    />
                    Asignar y gestionar roles
                  </label>

                  <label className={styles.checkboxGroup}>
                    <input 
                      type="checkbox" 
                      checked={formData.can_configure_trd} 
                      onChange={e => setFormData({...formData, can_configure_trd: e.target.checked})} 
                    />
                    Configurar TRD
                  </label>

                  <label className={styles.checkboxGroup}>
                    <input 
                      type="checkbox" 
                      checked={formData.can_radicate_documents} 
                      onChange={e => setFormData({...formData, can_radicate_documents: e.target.checked})} 
                    />
                    Radicar documentos
                  </label>

                </div>
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