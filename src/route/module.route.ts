import { Router } from "express";
import { authorization, isAuthenticated } from "../middleware/auth.middleware";
import {
  addLessonToModule,
  addModuleToCourse,
  DeleteCourseModule,
  GetModulesAndQuizes,
  updateModule,
} from "../controller/module.controller";
import { checkpaymentstatus } from "../middleware/checkpaymentstatus.middleware";
const ModuleRouter = Router();
ModuleRouter.post(
  "/create/:courseId",
  isAuthenticated,
  authorization(["admin"]),
  addModuleToCourse
);
ModuleRouter.put(
  "/:courseId/:moduleId",
  isAuthenticated,
  authorization(["admin"]),
  updateModule
);
ModuleRouter.put(
  "/lesson/:courseId/:moduleId",
  isAuthenticated,
  authorization(["admin"]),
  addLessonToModule
);
ModuleRouter.get("/:courseId",isAuthenticated,checkpaymentstatus,GetModulesAndQuizes)

ModuleRouter.delete(
  "/:courseId/:moduleId",
  isAuthenticated,
  authorization(["admin"]),
  DeleteCourseModule
);

export default ModuleRouter;
