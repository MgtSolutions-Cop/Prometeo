import { loginServices, generateAccessToken, verifyRefreshToken } from "./auth.service.js";
import { pool } from "../../config/db.js"; // Necesario para el refresh

export async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }

        const { accessToken, refreshToken, user } = await loginServices(email, password);

        // Guardamos el Access Token
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Se ajusta solo en producción
            sameSite: "strict",
            maxAge: 15 * 60 * 1000, // 15 min
        });

        // Guardamos el Refresh Token
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000, // 15 min
        });

        return res.json({
            message: "Login successful",
            user,
        });
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: error.message || "Invalid credentials" });
    }
}

export async function refresh(req, res) {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            return res.status(401).json({ message: "No refresh token provided" });
        }

        const decoded = verifyRefreshToken(token);
        
        // Buscamos al usuario de nuevo para asegurar que siga activo y sus roles estén actualizados
        const result = await pool.query("SELECT * FROM users WHERE user_id = $1 AND is_active = true", [decoded.user_id]);
        
        if (result.rows.length === 0) {
            return res.status(403).json({ message: "User is no longer active or does not exist" });
        }

        const newAccessToken = generateAccessToken(result.rows[0]);

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000, // 15 min
        });

        return res.json({ message: "Token refreshed" });
    } catch (error) {
        console.error(error);
        return res.status(403).json({ message: "Invalid refresh token" });
    }
}

export async function logout(req, res) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.json({ message: "Logged out successfully" });
}