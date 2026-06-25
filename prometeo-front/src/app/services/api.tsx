// ─────────────────────────────────────────────
// api.tsx — Capa de comunicación con el backend
// Todas las peticiones autenticadas pasan por
// fetchWithAuth que maneja el refresh automático
// ─────────────────────────────────────────────

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────
export interface UserPermissions {
  can_create_users: boolean;
  can_assign_roles: boolean;
  can_configure_trd: boolean;
  can_radicate_documents: boolean;
}

export interface StoredUser {
  id: number;
  full_name: string;
  email: string;
  role_id: number;
  role_name?: string;
  entity_id: number;
  permissions: UserPermissions;
}

// ─────────────────────────────────────────────
// loginUser
// ─────────────────────────────────────────────
export async function loginUser(email: string, password: string) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al iniciar sesión");
    }

    const data = await response.json();

    if (data.user && typeof window !== "undefined") {
      localStorage.setItem("prometeo_user", JSON.stringify(data.user));
    }

    return data;
  } catch (error: any) {
    console.error("Error en login:", error.message);
    throw error;
  }
}

// ─────────────────────────────────────────────
// refreshAccessToken
// ─────────────────────────────────────────────
async function refreshAccessToken() {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) throw new Error("No se pudo refrescar el token");
    return true;
  } catch (error) {
    console.error("Error al refrescar token:", error);
    return false;
  }
}

// ─────────────────────────────────────────────
// logoutUser
// ─────────────────────────────────────────────
export async function logoutUser() {
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    if (typeof window !== "undefined") {
      localStorage.removeItem("prometeo_user");
    }
    if (!response.ok) throw new Error("Error al cerrar sesión");
    return true;
  } catch (error) {
    console.error("Error de logout", error);
    return false;
  }
}

// ─────────────────────────────────────────────
// fetchWithAuth — wrapper universal
// ─────────────────────────────────────────────
export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
) {
  const fetchOptions: RequestInit = {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  let response = await fetch(`${API_URL}${endpoint}`, fetchOptions);

  if (response.status === 401) {
    console.log("Token expirado, intentando refrescar...");
    const tokenRefreshed = await refreshAccessToken();

    if (tokenRefreshed) {
      response = await fetch(`${API_URL}${endpoint}`, fetchOptions);
    } else {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("SESSION_EXPIRED"));
      }
      throw new Error("SESSION_EXPIRED");
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error en la petición a la API");
  }

  return response.json();
}

// ─────────────────────────────────────────────
// getCurrentUser
// ─────────────────────────────────────────────
export function getCurrentUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("prometeo_user");
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// getMe
// ─────────────────────────────────────────────
export async function getMe(): Promise<StoredUser> {
  const data = await fetchWithAuth("/auth/me");
  if (typeof window !== "undefined") {
    localStorage.setItem("prometeo_user", JSON.stringify(data));
  }
  return data;
}

// ════════════════════════════════════════
// USUARIOS
// ════════════════════════════════════════
export async function getUsers() {
  return await fetchWithAuth("/users");
}
export async function createUser(userData: any) {
  return await fetchWithAuth("/users", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}
export async function updateUser(id: number, userData: any) {
  return await fetchWithAuth(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(userData),
  });
}
export async function toggleUserState(id: number) {
  return await fetchWithAuth(`/users/${id}/state`, { method: "PATCH" });
}

// ════════════════════════════════════════
// ROLES
// ════════════════════════════════════════
export async function getRoles() {
  return await fetchWithAuth("/roles");
}
export async function createRole(roleData: any) {
  return await fetchWithAuth("/roles", {
    method: "POST",
    body: JSON.stringify(roleData),
  });
}
export async function updateRole(id: number, roleData: any) {
  return await fetchWithAuth(`/roles/${id}`, {
    method: "PUT",
    body: JSON.stringify(roleData),
  });
}
export async function toggleRoleState(id: number) {
  return await fetchWithAuth(`/roles/${id}/state`, { method: "PATCH" });
}

// ════════════════════════════════════════
// RADICACIÓN
// ════════════════════════════════════════
export async function createEntryRadication(data: any) {
  return await fetchWithAuth("/radication/entry", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export async function createOutputRadication(data: any) {
  return await fetchWithAuth("/radication/output", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export async function createInternalRadication(data: any) {
  return await fetchWithAuth("/radication/internal", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Trae TODOS los radicados (entrada, salida, interno) incluyendo archivados
export async function getAllRadications() {
  const data = await fetchWithAuth("/radication/entry/inbound");
  return data.map((r: any) => ({
    radication_number: r.radication_number,
    created_at:        r.created_at,
    subject:           r.subject || r.asunto,
    status:            r.status  || r.estado || "pending",
    remitente:         r.remitente || r.sender || "—",
    archived:          r.archived ?? false,
    fecha_documento:   r.fecha_documento || "",
    observaciones:     r.observaciones   || "",
  }));
}

// Mantener para compatibilidad con header/notificaciones
export async function getInboundRadications() {
  const data = await fetchWithAuth("/radication/entry/inbound");
  return data
    .filter((r: any) => !r.archived)
    .map((r: any) => ({
      radication_number: r.radication_number,
      created_at:        r.created_at,
      subject:           r.subject || r.asunto,
      status:            r.status  || r.estado || "pending",
      remitente:         r.remitente || r.sender || "—",
    }));
}

// ── Archivar radicado ──
export async function archiveRadication(radicationNumber: string) {
  return await fetchWithAuth(
    `/radication/entry/${encodeURIComponent(radicationNumber)}/archive`,
    { method: "PATCH" }
  );
}

// ── Actualizar radicado ──
export async function updateRadication(radicationNumber: string, data: any) {
  return await fetchWithAuth(
    `/radication/entry/${encodeURIComponent(radicationNumber)}`,
    { method: "PUT", body: JSON.stringify(data) }
  );
}

// ── PDF radicado ──
export async function getRadicationPDFUrl(radicationNumber: string): Promise<string> {
  const response = await fetch(
    `${API_URL}/radication/entry/pdf/${encodeURIComponent(radicationNumber)}`,
    { method: "GET", credentials: "include" }
  );
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Error al generar el PDF");
  }
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

// ════════════════════════════════════════
// RÓTULOS — Módulo de Miguel
// ════════════════════════════════════════

// Sticker PNG privado — nueva ruta /rotulos/ver/
export async function getPrivateSticker(filename: string) {
  const response = await fetch(`${API_URL}/rotulos/ver/${filename}`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) throw new Error("No se pudo cargar el sticker protegido");
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

// Verificación pública desde QR — sin autenticación
// El ciudadano escanea el QR del rótulo y llega a /verificar/[numero]
export async function verifyRadicationPublic(numero: string) {
  const response = await fetch(
    `${API_URL}/rotulos/verificar/${encodeURIComponent(numero)}`,
    { method: "GET", headers: { "Content-Type": "application/json" } }
  );
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Radicado inválido o no encontrado");
  }
  return response.json();
}

// ════════════════════════════════════════
// CONTRASEÑA
// ════════════════════════════════════════
export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  return await fetchWithAuth("/users/me/password", {
    method: "PATCH",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}