"use client";
import { useMemo, useState, useEffect } from "react";
import styles from "./user-management.module.css";
import {
  FaBan, FaCheckCircle, FaPenAlt,
  FaEye, FaEyeSlash, FaRandom
} from "react-icons/fa";
import { getUsers, getRoles, createUser, updateUser, toggleUserState } from "../../services/api";

// ═══════════════════════════════════════════════════
// CATÁLOGO DE PERMISOS
// Para agregar uno nuevo en el futuro: solo añadir
// una entrada aquí. No se modifica la BD.
// ═══════════════════════════════════════════════════
const PERMISSIONS = [
  {
    key:   "can_radicate_documents",
    label: "Radicar documentos",
    desc:  "Crear radicados de entrada, salida e internos",
    icon:  (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    key:   "can_create_users",
    label: "Gestionar usuarios",
    desc:  "Crear, editar e inactivar usuarios del sistema",
    icon:  (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    key:   "can_assign_roles",
    label: "Gestionar roles",
    desc:  "Crear roles y modificar sus permisos globales",
    icon:  (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        <polyline points="16 11 18 13 22 9"/>
      </svg>
    ),
  },
  {
    key:   "can_configure_trd",
    label: "Configurar TRD",
    desc:  "Modificar la Tabla de Retención Documental",
    icon:  (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="3" y1="15" x2="21" y2="15"/>
        <line x1="9" y1="9" x2="9" y2="21"/>
      </svg>
    ),
  },
] as const;

type PermKey = typeof PERMISSIONS[number]["key"];

// Override por permiso:
//   "inherit" → sin fila en user_permissions (hereda del rol)
//   "grant"   → granted = true
//   "deny"    → granted = false
type PermState = "inherit" | "grant" | "deny";

type PermOverrides = Record<PermKey, PermState>;

// ─────────────────────────────────────────────
// Helpers de conversión BD ↔ UI
// ─────────────────────────────────────────────
function dbToState(val: boolean | null | undefined): PermState {
  if (val === null || val === undefined) return "inherit";
  return val ? "grant" : "deny";
}

function stateToDB(state: PermState): boolean | null {
  if (state === "inherit") return null;
  return state === "grant";
}

function buildDefaultOverrides(): PermOverrides {
  return Object.fromEntries(
    PERMISSIONS.map((p) => [p.key, "inherit"])
  ) as PermOverrides;
}

// ═══════════════════════════════════════════════════
// Componente: control de 3 estados para un permiso
// ═══════════════════════════════════════════════════
function PermissionRow({
  perm,
  state,
  roleGranted,
  onChange,
}: {
  perm: typeof PERMISSIONS[number];
  state: PermState;
  roleGranted: boolean;
  onChange: (key: PermKey, val: PermState) => void;
}) {
  return (
    <div className={styles.permRow}>
      <div className={styles.permInfo}>
        <div className={styles.permLabelWrap}>
          <span className={styles.permIcon}>{perm.icon}</span>
          <span className={styles.permLabel}>{perm.label}</span>
          {state !== "inherit" && (
            <span className={state === "grant" ? styles.tagGrant : styles.tagDeny}>
              {state === "grant" ? "Concedido" : "Suspendido"}
            </span>
          )}
        </div>
        <span className={styles.permDesc}>{perm.desc}</span>
        {state === "inherit" && (
          <span className={styles.permInherit}>
            {roleGranted
              ? "✓ Activo por rol — hereda"
              : "✗ Inactivo por rol — hereda"}
          </span>
        )}
      </div>

      <div className={styles.permBtnGroup}>
        <button
          type="button"
          className={`${styles.permBtn} ${state === "inherit" ? styles.permBtnActive : ""}`}
          onClick={() => onChange(perm.key, "inherit")}
          title="Heredar del rol"
        >
          Heredar
        </button>
        <button
          type="button"
          className={`${styles.permBtn} ${state === "grant" ? styles.permBtnGrant : ""}`}
          onClick={() => onChange(perm.key, "grant")}
          title="Forzar activo"
        >
          Conceder
        </button>
        <button
          type="button"
          className={`${styles.permBtn} ${state === "deny" ? styles.permBtnDeny : ""}`}
          onClick={() => onChange(perm.key, "deny")}
          title="Suspender"
        >
          Suspender
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// Página principal
// ═══════════════════════════════════════════════════
export default function UserManagement() {
  const [users,   setUsers]   = useState<any[]>([]);
  const [roles,   setRoles]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query,   setQuery]   = useState("");

  const [isModalOpen,    setIsModalOpen]    = useState(false);
  const [editingUserId,  setEditingUserId]  = useState<number | null>(null);
  const [activeTab,      setActiveTab]      = useState<"info" | "permisos">("info");

  const [formData, setFormData] = useState({
    full_name:    "",
    email:        "",
    password:     "",
    role_id:      "",
    dependency_id: 1,
  });

  const [overrides,    setOverrides]    = useState<PermOverrides>(buildDefaultOverrides());
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([getUsers(), getRoles()]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (err) {
      console.error("Error al cargar datos:", err);
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
    return roles.find((r) => r.role_id === roleId)?.name ?? "Desconocido";
  }

  function getRolePerms(roleId: number | string): Record<PermKey, boolean> {
    const role = roles.find((r) => r.role_id === Number(roleId));
    return Object.fromEntries(
      PERMISSIONS.map((p) => [p.key, role?.[p.key] ?? false])
    ) as Record<PermKey, boolean>;
  }

  // Cuenta cuántos permisos tienen override activo
  const overrideCount = Object.values(overrides).filter((s) => s !== "inherit").length;

  const handleOpenModal = (user?: any) => {
    setActiveTab("info");
    if (user) {
      setEditingUserId(user.user_id);
      setFormData({
        full_name:    user.full_name,
        email:        user.email,
        password:     "",
        role_id:      user.role_id,
        dependency_id: user.dependency_id || 1,
      });
      // Cargar overrides actuales del usuario
      const loaded = buildDefaultOverrides();
      const dbOverrides = user.permissionOverrides ?? {};
      PERMISSIONS.forEach(({ key }) => {
        loaded[key] = dbToState(dbOverrides[key]);
      });
      setOverrides(loaded);
    } else {
      setEditingUserId(null);
      setFormData({ full_name: "", email: "", password: "", role_id: "", dependency_id: 1 });
      setOverrides(buildDefaultOverrides());
    }
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUserId(null);
  };

  const handlePermChange = (key: PermKey, val: PermState) => {
    setOverrides((prev) => ({ ...prev, [key]: val }));
  };

  const handleResetPerms = () => setOverrides(buildDefaultOverrides());

  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^*()_+";
    const pwd = Array.from({ length: 12 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");
    setFormData((f) => ({ ...f, password: pwd }));
    setShowPassword(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convertir estados UI → valores para la BD (true | false | null)
      const permissionOverrides: Record<string, boolean | null> = {};
      PERMISSIONS.forEach(({ key }) => {
        permissionOverrides[key] = stateToDB(overrides[key]);
      });

      if (editingUserId) {
        const payload: any = {
          full_name:    formData.full_name,
          email:        formData.email,
          role_id:      formData.role_id,
          dependency_id: formData.dependency_id,
          permissionOverrides,
        };
        if (formData.password.trim()) payload.password = formData.password;
        await updateUser(editingUserId, payload);
      } else {
        if (!formData.password) {
          alert("La contraseña es obligatoria para nuevos usuarios");
          return;
        }
        await createUser({ ...formData, permissionOverrides });
      }

      await fetchData();
      handleCloseModal();
    } catch (err: any) {
      alert(err.message || "Error al guardar el usuario");
    }
  };

  const handleToggleState = async (id: number) => {
    if (!confirm("¿Confirmas cambiar el estado de este usuario?")) return;
    try {
      await toggleUserState(id);
      await fetchData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const rolePerms = getRolePerms(formData.role_id);

  return (
    <div className={styles.wrap}>
      <div className={styles.heading}>
        <div>
          <h1 className={styles.h1}>Gestión de usuarios</h1>
          <p className={styles.sub}>Crea, edita y administra permisos de usuarios</p>
        </div>
      </div>

      {/* ── Tabla ── */}
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
            <span className={styles.searchHint}>{filtered.length}/{users.length}</span>
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
                  <th className={styles.th}>Permisos</th>
                  <th className={styles.th}>Estado</th>
                  <th className={styles.thRight}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const dbOverrides = u.permissionOverrides ?? {};
                  const activeOverrides = PERMISSIONS.filter(
                    ({ key }) => dbOverrides[key] !== null && dbOverrides[key] !== undefined
                  ).length;

                  return (
                    <tr
                      key={u.user_id}
                      className={styles.tr}
                      style={{ opacity: u.is_active ? 1 : 0.55 }}
                    >
                      <td className={styles.td}>
                        <div className={styles.nameCell}>
                          <span className={styles.dot}
                            style={{ background: u.is_active ? "#b51e2a" : "#444" }} />
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
                        {activeOverrides > 0 ? (
                          <span className={styles.overrideBadge}>
                            {activeOverrides} override{activeOverrides > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className={styles.inheritBadge}>Heredado</span>
                        )}
                      </td>
                      <td className={styles.td}>
                        {u.is_active ? "Activo" : "Inactivo"}
                      </td>
                      <td className={`${styles.td} ${styles.tdRight}`}>
                        <button className={styles.iconBtn} onClick={() => handleOpenModal(u)} title="Editar">
                          <FaPenAlt />
                        </button>
                        <button
                          className={styles.iconBtn}
                          onClick={() => handleToggleState(u.user_id)}
                          title={u.is_active ? "Inactivar" : "Activar"}
                        >
                          {u.is_active
                            ? <FaBan className={styles.inc} />
                            : <FaCheckCircle className={styles.chek} />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr className={styles.tr}>
                    <td className={styles.empty} colSpan={6}>
                      Sin resultados para "{query}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ══ MODAL ══ */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>

            {/* Header */}
            <div className={styles.modalHeader}>
              <h2>{editingUserId ? "Editar Usuario" : "Nuevo Usuario"}</h2>
            </div>

            {/* Tabs — solo al editar */}
            {editingUserId && (
              <div className={styles.tabs}>
                <button
                  type="button"
                  className={`${styles.tab} ${activeTab === "info" ? styles.tabActive : ""}`}
                  onClick={() => setActiveTab("info")}
                >
                  Información
                </button>
                <button
                  type="button"
                  className={`${styles.tab} ${activeTab === "permisos" ? styles.tabActive : ""}`}
                  onClick={() => setActiveTab("permisos")}
                >
                  Permisos
                  {overrideCount > 0 && (
                    <span className={styles.tabBadge}>{overrideCount}</span>
                  )}
                </button>
              </div>
            )}

            <form onSubmit={handleSaveUser}>

              {/* ── Tab: Información ── */}
              {(activeTab === "info" || !editingUserId) && (
                <div className={styles.tabContent}>
                  <div className={styles.formGroup}>
                    <label>Nombre Completo <span className={styles.req}>*</span></label>
                    <input
                      required
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Email <span className={styles.req}>*</span></label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>
                      Contraseña{" "}
                      {editingUserId && (
                        <span className={styles.optLabel}>(Opcional)</span>
                      )}
                    </label>
                    <div className={styles.passwordWrapper}>
                      <input
                        required={!editingUserId}
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        placeholder={editingUserId ? "Dejar en blanco para no cambiar" : ""}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                      <button type="button" className={styles.iconAction}
                        onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      <button type="button" className={styles.iconAction}
                        onClick={handleGeneratePassword} title="Generar contraseña">
                        <FaRandom />
                      </button>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Rol <span className={styles.req}>*</span></label>
                    <select
                      required
                      value={formData.role_id}
                      onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                    >
                      <option value="">Seleccione un rol...</option>
                      {roles.map((r) => (
                        <option key={r.role_id} value={r.role_id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* ── Tab: Permisos ── */}
              {activeTab === "permisos" && editingUserId && (
                <div className={styles.tabContent}>
                  <div className={styles.permHeader}>
                    <p className={styles.permIntro}>
                      Los overrides tienen prioridad sobre el rol asignado.
                      "Heredar" elimina el override y usa el permiso del rol.
                    </p>
                    {overrideCount > 0 && (
                      <button
                        type="button"
                        className={styles.resetBtn}
                        onClick={handleResetPerms}
                      >
                        Restablecer todo
                      </button>
                    )}
                  </div>

                  <div className={styles.permList}>
                    {PERMISSIONS.map((perm) => (
                      <PermissionRow
                        key={perm.key}
                        perm={perm}
                        state={overrides[perm.key]}
                        roleGranted={rolePerms[perm.key]}
                        onChange={handlePermChange}
                      />
                    ))}
                  </div>

                  <div className={styles.legend}>
                    <span className={styles.legendItem}>
                      <span className={`${styles.legendDot} ${styles.lInherit}`} />
                      Heredar del rol
                    </span>
                    <span className={styles.legendItem}>
                      <span className={`${styles.legendDot} ${styles.lGrant}`} />
                      Conceder (override activo)
                    </span>
                    <span className={styles.legendItem}>
                      <span className={`${styles.legendDot} ${styles.lDeny}`} />
                      Suspender (override inactivo)
                    </span>
                  </div>
                </div>
              )}

              <div className={styles.modalActions}>
                <button type="button" onClick={handleCloseModal} className={styles.cancelBtn}>
                  Cancelar
                </button>
                <button type="submit" className={styles.saveBtn}>
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}