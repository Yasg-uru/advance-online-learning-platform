import {Router} from "express";
import { Login, Logout, registerUser, verifyuser } from "../controller/user.controller";
import upload from "../middleware/multer.middleware";

const userRouter=Router();
userRouter.post("/register",upload.single("profileUrl"),registerUser);
userRouter.post("/verify-code",verifyuser);
userRouter.post("/sign-in",Login);
userRouter.post("/logout",Logout);

export default userRouter;
