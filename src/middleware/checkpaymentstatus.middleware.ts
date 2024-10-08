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
    const enrollement = course.enrolledUsers.find(
      (enrollment) => enrollment?.userId.toString() === userId.toString()
    );
    if (!enrollement) {
      return next(new Errorhandler(403, "User is not enrolled in this course"));
    }

    if (enrollement.paymentStatus !== "Paid") {
      return next(
        new Errorhandler(
          403,
          "Please Enroll in course to get Access of modules of this course"
        )
      );
    }
    const currentDate = new Date();
    const expirationDate = new Date(enrollement.enrolledAt);
    expirationDate.setFullYear(expirationDate.getFullYear() + 2);
    const isCourseExpired = expirationDate < currentDate;
    if (isCourseExpired) {
      return next(new Errorhandler(403, "course is Expired"));
    }

    next();
  } catch (error) {
    return next(new Errorhandler(500, "Error checking payment status"));
  }
};
export const isAlreadyEnrolled = async (
  req: reqwithuser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId } = req.params;
    const course = await courseModel.findById(courseId);
    if (!course) {
      return next(new Errorhandler(404, "Course not found"));
    }
    const userId = req.user?._id;
    const isEnrolled = course.enrolledUsers.findIndex((enrollment) => {
      return enrollment.userId.toString() === (userId as string).toString();
    });
    if (isEnrolled !== -1) {
      return next(new Errorhandler(403, "Already Enrolled to this course"));
    }
    next();
  } catch (error) {
    return next(new Errorhandler(500, "Error in checking user enrollment"));
  }
};
