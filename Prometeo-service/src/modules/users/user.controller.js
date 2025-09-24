import * as userServices from "../users/user.service.js";

export const createUser = async(req,res)=> {
    try{
        const newUser= await userServices.createUser(req.body);
        res.status(201).json(newUser);
    }catch(error){
        res.status(400).json({message: error.message});
    }
};

export const getUsers = async (req, res) => {
    try {
      const users = await userServices.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

export const getUserId =async(req,res)=>{
try{
    const user = await userServices.getUserId(req.params.id);
    if (!user) return res.status(404).json({message:" user not exist"})
        res.json(user);
}catch(error){
    res.status(500).json({message:error.message});
}
};

export const updateUser =async (req,res)=>{
    try{
        const update = await userServices.updateUser(req.params.id, req.body);
        res.json(update);
    }catch(error){
        res.status(400).json({message:error.message});
    }
};



export const toggleUserState = async(req,res)=>{
    try{
        const toggled =await userServices.toggleUserState(req.params.id);
        res.json(toggled);
    }catch(error){
        res.status(400).json({message:error.message})
    }
};