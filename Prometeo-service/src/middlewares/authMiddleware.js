import jwt from"jsonwebtoken";

export function authMiddleware(req,res,next){
    const token =req.cookies.token;
    if(!token){
        return res.status(401).json({message: "No token provided"});
    }
    try{
        const decoded =jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            user_id: decoded.user_id,
            role_id: decoded.role_id,
            entity_id: decoded.entity_id,
            dependency_id: decoded.dependency_id
          };
        next();
    }catch (error){
        return res.status(401).json({message: "Invalid token"});
    }
};