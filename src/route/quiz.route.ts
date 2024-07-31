import { Router } from "express";
import { authorization, isAuthenticated } from "../middleware/auth.middleware";
import {
  checkAnswer,
  createCourseQuiz,
  createquize,
  deleteQuiz,
  getCourseQuiz,
  updateQuiz,
} from "../controller/quiz.controller";
const QuizRouter = Router();
QuizRouter.post(
  "/create/:courseId/:moduleId",
  isAuthenticated,
  authorization(["admin", "instructor"]),
  createquize
);
QuizRouter.delete(
  "/delete/:courseId/:moduleId",
  isAuthenticated,
  authorization(["admin", "instructor"]),
  deleteQuiz
);
QuizRouter.put(
  "/update",
  isAuthenticated,
  authorization(["admin", "instructor"]),
  updateQuiz
);
QuizRouter.get("/:courseId", isAuthenticated, getCourseQuiz);
QuizRouter.post("/quiz/:courseId",isAuthenticated,authorization(["admin","instructor"]),createCourseQuiz);

QuizRouter.post("/check/:courseId/:moduleId", isAuthenticated, checkAnswer); //marked

export default QuizRouter;
