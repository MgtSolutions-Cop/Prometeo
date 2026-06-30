export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

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

export function getCurrentUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("prometeo_user");
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

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

// Para notificaciones del header (solo activos, sin metadata extra)
export async function getInboundRadications() {
  const data = await fetchWithAuth("/radication/inbound");
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

// Para la tabla principal — incluye TODOS los campos del metadata
export async function getAllRadications() {
  const data = await fetchWithAuth("/radication/inbound");
  return data.map((r: any) => ({
    radication_number:     r.radication_number,
    created_at:            r.created_at,
    subject:               r.subject               || r.asunto || "",
    status:                r.status                || r.estado || "pending",
    remitente:             r.remitente             || r.sender || "—",
    archived:              r.archived              ?? false,
    // Campos básicos
    fecha_documento:       r.fecha_documento       || "",
    observaciones:         r.observaciones         || "",
    // Campos nuevos del metadata
    clase_correspondencia: r.clase_correspondencia || "OFICIAL",
    cedula_nit:            r.cedula_nit            || "",
    entidad_origen:        r.entidad_origen        || "",
    correo:                r.correo                || "",
    direccion:             r.direccion             || "",
    telefono:              r.telefono              || "",
    tipo_documento:        r.tipo_documento        || "Oficio",
    no_origen:             r.no_origen             || "",
    no_guia:               r.no_guia               || "",
    referenciados:         r.referenciados         || "",
    dependencia_destino:   r.dependencia_destino   || "",
    destinatario:          r.destinatario          || "",
    jefe_dependencia:      r.jefe_dependencia      || "",
    encargado:             r.encargado             || "",
    copia:                 r.copia                 || "NO",
    folios:                r.folios                || "1",
    anexos:                r.anexos                || "0",
    medio_correspondencia: r.medio_correspondencia || "Correo Electrónico",
    aplica_confidencial:   r.aplica_confidencial   || false,
    llevado_a_la_mano:     r.llevado_a_la_mano     || false,
  }));
}


// ── Archivar / Desarchivar ──
export async function archiveRadication(radicationNumber: string) {
  return await fetchWithAuth(
    `/radication/${encodeURIComponent(radicationNumber)}/archive`,
    { method: "PATCH" }
  );
}
export async function unarchiveRadication(radicationNumber: string) {
  return await fetchWithAuth(
    `/radication/${encodeURIComponent(radicationNumber)}/unarchive`,
    { method: "PATCH" }
  );
}

// ── Actualizar radicado (todos los campos del metadata) ──
export async function updateRadication(radicationNumber: string, data: any) {
  return await fetchWithAuth(
    `/radication/${encodeURIComponent(radicationNumber)}`,
    { method: "PUT", body: JSON.stringify(data) }
  );
}

// ── PDF ──
export async function getRadicationPDFUrl(radicationNumber: string): Promise<string> {
  const response = await fetch(
    `${API_URL}/radication/pdf/${encodeURIComponent(radicationNumber)}`,
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
// RÓTULOS
// ════════════════════════════════════════
export async function getPrivateSticker(filename: string) {
  const response = await fetch(`${API_URL}/rotulos/ver/${filename}`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) throw new Error("No se pudo cargar el sticker protegido");
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

// Verificación pública desde QR
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