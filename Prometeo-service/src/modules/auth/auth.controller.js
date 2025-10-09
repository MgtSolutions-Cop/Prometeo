import { loginServices } from "./auth.service.js";

export async function login(req,res) {
    try{
        const {email,password}=req.body;
       if  (!email || !password){
            return res.status(400).json({message:"Email and password required"})
        }
        const {token,user} = await loginServices(email,password);
        res.cookie("token",token,{
            httpOnly:true,
            secure:false,//cambiar en producion en true para https
            sameSite:"strict",
        });
    return res.json({
        message: "Login sucessful",
        user,
    });
    }catch(error){
        console.error(error);
        return res.status(401).json({message: error.message||"Invalid credentials"});
    }
    
}


export async function refresh(req, res) {
    try {
      const token = req.cookies.refreshToken;
      if (!token) {
        return res.status(401).json({ message: "No refresh token provided" });
      }
  
      const decoded = verifyRefreshToken(token);
  
      // Generamos un nuevo accessToken
      const newAccessToken = generateAccessToken({ user_id: decoded.user_id });
  
      // Guardamos el nuevo accessToken en cookie
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: false, // en producción: true con HTTPS
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