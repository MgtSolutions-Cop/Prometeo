import express, { Router } from "express"
import{
createUser,
getUsers,
getUserId,
toggleUserState,
updateUser
} from "../users/user.controller.js"

import {authMiddleware} from "../../middlewares/authMiddleware.js"
const router = Router();

 router.use(authMiddleware);

 router.post("/",createUser);
 router.get("/",getUsers);
 router.get("/:id",getUserId);
 router.patch("/:id/state",toggleUserState);
 router.put("/:id",updateUser)

 export default router;