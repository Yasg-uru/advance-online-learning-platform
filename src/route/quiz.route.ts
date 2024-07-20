import { Router } from "express";
import { authorization, isAuthenticated } from "../middleware/auth.middleware";
import {
  checkAnswer,
  createquize,
  deleteQuiz,
  updateQuiz,
} from "../controller/quiz.controller";
const QuizRouter = Router();
QuizRouter.post(
  "/create/:courseId/:moduleId",
  isAuthenticated,
  authorization(["admin"]),
  createquize
);
QuizRouter.delete("/delete/:courseId/:moduleId", isAuthenticated, deleteQuiz);
QuizRouter.put("/update", isAuthenticated, updateQuiz);
QuizRouter.get("/check/:courseId/:moduleId", isAuthenticated, checkAnswer);

export default QuizRouter;
