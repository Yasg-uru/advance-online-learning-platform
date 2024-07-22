import { Router } from "express";
import { authorization, isAuthenticated } from "../middleware/auth.middleware";
import {
  courseByCategory,
  createCourse,
  deletecourse,
  filterCourses,
  getCourseInfo,
  getEnrolledCourses,
  RateCourse,
  SearchCourses,
  updatecourse,
} from "../controller/course.controller";
const CourseRouter = Router();

CourseRouter.post(
  "/create",
  isAuthenticated,
  authorization(["admin", "instructor"]),
  createCourse
);
CourseRouter.delete(
  "/:courseId",
  isAuthenticated,
  authorization(["admin", "instructor"]),
  deletecourse
);
CourseRouter.put(
  "/:courseId",
  isAuthenticated,
  authorization(["admin", "instructor"]),
  updatecourse
);
CourseRouter.get("/detail/:courseId", getCourseInfo);

CourseRouter.get("/category", courseByCategory);
CourseRouter.get("/", SearchCourses);

CourseRouter.get("/filter", filterCourses);
CourseRouter.post("/rate/:courseId", isAuthenticated, RateCourse);
CourseRouter.get("/enrolled", isAuthenticated, getEnrolledCourses);

export default CourseRouter;
