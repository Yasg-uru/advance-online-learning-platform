import courseModel from "../models/coursemodel";
import catchAsync from "../middleware/catchasync.middleware";
import Errorhandler from "../util/Errorhandler.util";
import UploadOnCloudinary from "../util/cloudinary.util";
import { Requestwithuser } from "../types/ReqwithUser";
import { Response, NextFunction, Request } from "express";

export const createCourse = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        title,
        description,
        category,
        level,
        language,
        prerequisites,
        targetAudience,
        learningOutComes,
        syllabus,
        tags,
        price,
        discount,
        duration,
        instructorId,
        published,
      } = req.body;

      if (!req.file) {
        return next(new Errorhandler(400, "please select thumbnail first"));
      }
      const cloudinary = await UploadOnCloudinary(req.file.path);
      const thumbnailUrl = cloudinary?.secure_url;

      const newcourse = new courseModel({
        title,
        description,
        category,
        level,
        language,
        prerequisites,
        targetAudience,
        learningOutComes,
        syllabus,
        tags,
        price,
        discount,
        duration,
        instructorId,
        published,
        thumbnailUrl,
      });
      await newcourse.save();
      res.status(201).json({
        success: true,
        message: "successfully created course",
      });
    } catch (error) {
      return next(new Errorhandler(500, "Error in creating course"));
    }
  }
);
