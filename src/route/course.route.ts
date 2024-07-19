import {Router} from "express";
import { authorization, isAuthenticated } from "../middleware/auth.middleware";
import { createCourse } from "../controller/course.controller";
const CourseRouter=Router();

CourseRouter.post("/create",isAuthenticated,authorization("admin"),createCourse);

export default CourseRouter;
