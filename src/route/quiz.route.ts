import { Router } from "express";
import { authorization, isAuthenticated } from "../middleware/auth.middleware";
import { createquize } from "../controller/quiz.controller";
const QuizRouter = Router();
QuizRouter.post(
  "/create/:courseId/:moduleId",
  isAuthenticated,
  authorization(["admin"]),
  createquize
);
export default QuizRouter;
