export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export async function loginUser(email: string, password: string) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // importante para que guarde cookies del backend
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al iniciar sesión");
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error en login:", error.message);
    throw error;
  }
}
