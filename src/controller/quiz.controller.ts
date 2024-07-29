import courseModel, { Quiz, QuizSchema } from "../models/coursemodel";
import catchAsync from "../middleware/catchasync.middleware";
import Errorhandler from "../util/Errorhandler.util";
import { reqwithuser } from "../middleware/auth.middleware";
import { NextFunction, Response } from "express";
import { UserAnswer } from "../types/QuizInterfaces";
export const createquize = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const { courseId, moduleId } = req.params;
      const { title, instructions, questions } = req.body;

      if (!courseId || !moduleId) {
        return next(new Errorhandler(404, "courseID and moduleId is required"));
      }
      const course = await courseModel.findById(courseId);
      if (!course) {
        return next(new Errorhandler(404, "course not found "));
      }
      //findign the module
      const module = course.modules.find((module) => {
        const moduleID = module._id as string;
        return moduleID.toString() === moduleId;
      });
      if (!module) {
        return next(new Errorhandler(404, "module not found "));
      }
      const newquiz = { title, instructions, questions };
      module.quiz = newquiz as Quiz;
      await course.save();
      res.status(200).json({
        success: true,
        message: "Quiz created successfully",
      });
    } catch (error) {
      next(new Errorhandler(500, "Error in creating quiz"));
    }
  }
);
export const updateQuiz = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const { courseId, moduleId } = req.params;
      const { title, instructions, questions } = req.body;
      if (!courseId || !moduleId) {
        return next(new Errorhandler(404, "courseID and moduleId is required"));
      }
      const course = await courseModel.findById(courseId);
      if (!course) {
        return next(new Errorhandler(404, "course not found "));
      }
      //findign the module
      const module = course.modules.find((module) => {
        const moduleID = module._id as string;
        return moduleID.toString() === moduleId;
      });
      if (!module) {
        return next(new Errorhandler(404, "module not found "));
      }
      const quiz = module.quiz;
      if (!quiz) {
        return next(new Errorhandler(404, "Quiz not found"));
      }
      quiz.title = title || quiz.title;
      quiz.instructions = instructions || quiz.instructions;
      quiz.questions = questions || quiz.questions;
      await course.save();
      res.status(200).json({
        success: true,
        message: "Updated successfully",
      });
    } catch (error) {
      next(new Errorhandler(500, "Error in quiz updation "));
    }
  }
);
export const deleteQuiz = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const { courseId, moduleId } = req.params;

      if (!courseId || !moduleId) {
        return next(new Errorhandler(404, "courseID and moduleId is required"));
      }
      const course = await courseModel.findById(courseId);
      if (!course) {
        return next(new Errorhandler(404, "course not found "));
      }
      //findign the module
      const module = course.modules.find((module) => {
        const moduleID = module._id as string;
        return moduleID.toString() === moduleId;
      });
      if (!module) {
        return next(new Errorhandler(404, "module not found "));
      }
      module.quiz == undefined;
      res.status(200).json({
        success: true,
        message: "Deleted module quiz successfully",
      });
    } catch (error) {
      next(new Errorhandler(500, "Error in deleting quiz"));
    }
  }
);
export const checkAnswer = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const { courseId, moduleId } = req.params;
      const userAnswers: UserAnswer[] = req.body.userAnswers;
      console.log("this is a user answers :", userAnswers);
      if (!courseId || !moduleId) {
        return next(new Errorhandler(404, "courseId and moduleId is required"));
      }
      const course = await courseModel.findById(courseId);
      if (!course) {
        return next(new Errorhandler(404, "course not found "));
      }
      //findign the module
      const module = course.modules.find((module) => {
        const moduleID = module._id as string;
        return moduleID.toString() === moduleId;
      });
      if (!module) {
        return next(new Errorhandler(404, "module not found "));
      }
      const quiz = module.quiz;
      let TotalPoints: number = 0;
      let ObtainedPoints: number = 0;
      const Feedback: any = [];

      userAnswers.forEach((userAnswers) => {
        const question = quiz.questions[userAnswers.questionIndex];
        TotalPoints += question.points;
        const CorrectOption = question.options.find(
          (option) => option.isCorrect
        );
        const isCorrect =
          CorrectOption?.optionText === userAnswers.selectedAnswer;
        if (isCorrect) {
          ObtainedPoints += question.points;
        }
        Feedback.push({
          question: question.questionText,
          selectedAnswer: userAnswers.selectedAnswer,
          correctAnswer: CorrectOption?.optionText,
          correct: isCorrect,
          points: question.points,
          obtainedPoints: isCorrect ? question.points : 0,
        });
      });
      const scorePercentage = (ObtainedPoints / TotalPoints) * 100;
      res.status(200).json({
        success: true,
         ObtainedPoints,
        TotalPoints,
        scorePercentage,
        Feedback,
      });
    } catch (error) {
      next(new Errorhandler(500, "Error in checking answer "));
    }
  }
);
