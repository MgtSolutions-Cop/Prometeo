import jwt from"jsonwebtoken";

export function authMiddleware(req,res,next){
    const token =req.cookies.token;
    if(!token){
        return res.status(401).json({message: "No token provided"});
    }
    try{
        const decoded =jwt.verify(token, process.env.JWT_SECRET);
        res.user = decoded;
        next();
    }catch (error){
        return res.status(401).json({message: "Invalid token"});
    }
};