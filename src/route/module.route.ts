import { Router } from "express";
import { authorization, isAuthenticated } from "../middleware/auth.middleware";
import {
  addModuleToCourse,
  DeleteCourseModule,
  updateModule,
} from "../controller/module.controller";
const ModuleRouter = Router();
ModuleRouter.post(
  "/create/:courseId",
  isAuthenticated,
  authorization(["admin"]),
  addModuleToCourse
);
ModuleRouter.put("/:courseId/:moduleId", isAuthenticated, authorization(["admin"]), updateModule);
ModuleRouter.delete("/:courseId/:moduleId",isAuthenticated,authorization(["admin"]),DeleteCourseModule);

export default ModuleRouter;
