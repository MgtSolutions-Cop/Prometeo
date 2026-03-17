import { Console, error } from "console";

// src/services/api.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// 1. Mantenemos tu función de login intacta
export async function loginUser(email: string, password: string) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Guarda las cookies iniciales
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al iniciar sesión");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error en login:", error.message);
    throw error;
  }
}

// 2. Nueva función para refrescar el token
async function refreshAccessToken() {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include", // Importante para enviar la cookie del refreshToken
    });

    if (!response.ok) {
      throw new Error("No se pudo refrescar el token");
    }
    return true;
  } catch (error) {
    console.error("Error al refrescar token:", error);
    return false;
  }
}
export async function logoutUser() {
  try{
  const response =await fetch(`${API_URL}/auth/logout`,{
    method :"POST",
    credentials:"include"
  });
  if (!response.ok) {
    throw new Error("ERROR AL INICIAR SESION ");
  }
  return true;
 }catch (error){
  console.error("Error de logout",error);
  return false;
 }
}
//  El Wrapper mágico para usar en el resto de la aplicación
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // Aseguramos que siempre se envíen las cookies en cada petición
  const fetchOptions = {
    ...options,
    credentials: "include" as RequestCredentials, 
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  let response = await fetch(`${API_URL}${endpoint}`, fetchOptions);

  // Si el backend nos dice que no estamos autorizados (token expirado)
  if (response.status === 401) {
    console.log("Token expirado, intentando refrescar...");
    
    // Intentamos obtener un nuevo token
    const tokenRefreshed = await refreshAccessToken();

    if (tokenRefreshed) {
      // Si tuvimos éxito, repetimos la petición original automáticamente
      response = await fetch(`${API_URL}${endpoint}`, fetchOptions);
    } else {
      // Si el refresh falla (ej: el refresh token también expiró o el usuario fue desactivado)
      // Aquí podrías redirigir al login usando window.location o un manejador de estado global
     if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("SESSION_EXPIRED"));
      }
      throw new Error("SESSION_EXPIRED");
    }
  }

  // Manejo de otros errores (404, 500, etc.)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error en la petición a la API");
  }

  return response.json();
}

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
  return await fetchWithAuth(`/users/${id}/state`, {
    method: "PATCH",
  });
}

// --- GESTIÓN DE ROLES ---
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

// Tendrás que crear este endpoint en tu backend de roles
export async function toggleRoleState(id: number) {
  return await fetchWithAuth(`/roles/${id}/state`, {
    method: "PATCH",
  });
}
// --- RADICACIÓN ---
export async function createEntryRadication(data: any) {
  return await fetchWithAuth("/radication/entry", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
// Stiker
export async function getInboundRadications() {
  return await fetchWithAuth("/radication/inbound");
}

// Función para descargar imágenes protegidas
export async function getPrivateSticker(filename: string) {
  const response = await fetch(`${API_URL}/radication/sticker/${filename}`, {
    method: "GET",
    credentials: "include", // ¡Aquí está la magia que envía las cookies!
  });

  if (!response.ok) {
    throw new Error("No se pudo cargar el sticker protegido");
  }

  // Convertimos la respuesta cruda en un objeto Blob (archivo binario)
  const blob = await response.blob();
  // Creamos una URL temporal en el navegador para esa imagen
  return URL.createObjectURL(blob);
}