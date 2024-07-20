import { NextFunction, Response } from "express";
import { reqwithuser } from "./auth.middleware";
import Errorhandler from "../util/Errorhandler.util";
import { Types } from "mongoose";
import courseModel from "../models/coursemodel";

export const checkpaymentstatus = async (
  req: reqwithuser,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id as Types.ObjectId;
    const { courseId } = req.params;

    if (!userId) {
      return next(new Errorhandler(403, "Please Login to continue"));
    }
    const course = await courseModel.findById(courseId);
    if (!course) {
      return next(new Errorhandler(404, "course not found"));
    }
    const enrollement: any = course.enrolledUsers.find(
      (enrollment) => enrollement?.userId.toString() === userId.toString()
    );
    if (!enrollement) {
      return next(new Errorhandler(403, "User is not enrolled in this course"));
    }
    if (enrollement.paymentStatus !== "Paid") {
      return next(
        new Errorhandler(403, "Payment is not completed for this course")
      );
    }
    next();
  } catch (error) {
    return next(new Errorhandler(500, "Error checking payment status"));
  }
};
