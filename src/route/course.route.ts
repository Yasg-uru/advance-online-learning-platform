import {Router} from "express";
import { authorization, isAuthenticated } from "../middleware/auth.middleware";
import { createCourse, deletecourse, filterCourses } from "../controller/course.controller";
const CourseRouter=Router();

CourseRouter.post("/create",isAuthenticated,authorization(["admin"]),createCourse);
CourseRouter.delete("/:courseId",isAuthenticated,authorization(["admin"]),deletecourse);
CourseRouter.get("/filter",filterCourses);

export default CourseRouter;
