import { Router } from "express";
import { authorization, isAuthenticated } from "../middleware/auth.middleware";
import {
  courseByCategory,
  createCourse,
  createNote,
  deletecourse,
  deletenote,
  filterCourses,
  getCourseInfo,
  getEnrolledCourses,
  getUserNotes,
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
CourseRouter.get("/usernote/:courseId",isAuthenticated,getUserNotes);

CourseRouter.get("/filter", filterCourses);
CourseRouter.post("/rate/:courseId", isAuthenticated, RateCourse);
CourseRouter.get("/enrolled", isAuthenticated, getEnrolledCourses);
CourseRouter.delete("/note/:noteId/:courseId", isAuthenticated, deletenote);
CourseRouter.post("/note/:courseId", isAuthenticated, createNote);

export default CourseRouter;
