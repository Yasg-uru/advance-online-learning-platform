import { NextFunction, Response } from "express";
import courseModel from "../models/coursemodel";
import { reqwithuser } from "./auth.middleware";
import Errorhandler from "../util/Errorhandler.util";
export const checkIsFree = async (
  req: reqwithuser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId } = req.params;
    if (!courseId) {
      return next(new Errorhandler(404, "courseid not found"));
    }
    const course = await courseModel.findById(courseId);
    if (!course) {
      return next(new Errorhandler(404, "course not found"));
    }
    if (course.isPaid === true) {
      return next(new Errorhandler(403, "This course is paid"));
    }
    next();
  } catch (error) {
    next(new Errorhandler(500, "Error checking course status"));
  }
};

export const checkIsPaid = async (
  req: reqwithuser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId } = req.params;
    if (!courseId) {
      return next(new Errorhandler(404, "courseid not found"));
    }
    const course = await courseModel.findById(courseId);
    if (!course) {
      return next(new Errorhandler(404, "course not found"));
    }
    if (course.isPaid === false) {
      return next(new Errorhandler(403, "This course is Free"));
    }
    next();
  } catch (error) {
    next(new Errorhandler(500, "Error checking course status"));
  }
};
