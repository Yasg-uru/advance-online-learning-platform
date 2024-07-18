import {Router} from "express";
import { registerUser, verifyuser } from "../controller/user.controller";
const userRouter=Router();
userRouter.post("/register",registerUser);
userRouter.post("/verify-code",verifyuser);

export default userRouter;
