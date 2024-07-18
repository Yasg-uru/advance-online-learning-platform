import {Router} from "express";
import { registerUser, verifyuser } from "../controller/user.controller";
import upload from "../middleware/multer.middleware";

const userRouter=Router();
userRouter.post("/register",upload.single("profileUrl"),registerUser);
userRouter.post("/verify-code",verifyuser);

export default userRouter;
