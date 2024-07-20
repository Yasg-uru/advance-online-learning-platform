import courseModel, { Quiz, QuizSchema } from "../models/coursemodel";
import catchAsync from "../middleware/catchasync.middleware";
import Errorhandler from "../util/Errorhandler.util";
import { reqwithuser } from "../middleware/auth.middleware";
import { NextFunction, Response } from "express";
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
