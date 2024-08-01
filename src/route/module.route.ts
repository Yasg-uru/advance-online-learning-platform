import { Router } from "express";
import { authorization, isAuthenticated } from "../middleware/auth.middleware";
import {
  addLessonToModule,
  addModuleToCourse,
  DeleteCourseModule,
  GetModulesAndQuizes,
  GetModulesAndQuizesFullAccess,
  updateModule,
} from "../controller/module.controller";
import { checkpaymentstatus } from "../middleware/checkpaymentstatus.middleware";
const ModuleRouter = Router();
ModuleRouter.post(
  "/create/:courseId",
  isAuthenticated,
  authorization(["admin", "instructor"]),
  addModuleToCourse
);
ModuleRouter.put(
  "/:courseId/:moduleId",
  isAuthenticated,
  authorization(["admin", "instructor"]),
  updateModule
);
ModuleRouter.put(
  "/lesson/:courseId/:moduleId",
  isAuthenticated,
  authorization(["admin", "instructor"]),
  addLessonToModule
);
ModuleRouter.get(
  "/fullaccess/:courseId",
  isAuthenticated,
  checkpaymentstatus,

  GetModulesAndQuizesFullAccess
);
ModuleRouter.get("/:courseId",  GetModulesAndQuizes);

ModuleRouter.delete(
  "/:courseId/:moduleId",
  isAuthenticated,
  authorization(["admin", "instructor"]),
  DeleteCourseModule
);

export default ModuleRouter;
