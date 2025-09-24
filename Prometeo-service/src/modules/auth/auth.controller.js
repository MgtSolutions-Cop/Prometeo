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