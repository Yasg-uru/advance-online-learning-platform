import { Router } from "express";
import {
  forgotPassword,
  Login,
  Logout,
  registerUser,
  Resetpassword,
  verifyuser,
} from "../controller/user.controller";
import upload from "../middleware/multer.middleware";

const userRouter = Router();
userRouter.post("/register", upload.single("profileUrl"), registerUser); //marked
userRouter.post("/verify-code", verifyuser); //marked
userRouter.post("/sign-in", Login); //marked
userRouter.post("/logout", Logout);
userRouter.post("/forgot-password", forgotPassword);
userRouter.put("/reset-password/:token", Resetpassword);

export default userRouter;
