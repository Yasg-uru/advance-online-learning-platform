import courseModel from "../models/coursemodel";
import catchAsync from "../middleware/catchasync.middleware";
import Errorhandler from "../util/Errorhandler.util";
import UploadOnCloudinary from "../util/cloudinary.util";

import { Response, NextFunction, Request } from "express";
import { reqwithuser } from "../middleware/auth.middleware";

export const createCourse = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    // const userid=req.user.id;

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

      // if (!req.file) {
      //   return next(new Errorhandler(400, "please select thumbnail first"));
      // }
      // const cloudinary = await UploadOnCloudinary(req.file.path);
      // const thumbnailUrl = cloudinary?.secure_url;

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
        // thumbnailUrl,
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

export const deletecourse = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;

      const course = await courseModel.findByIdAndDelete(courseId);
      res.status(200).json({
        success: true,
        message: "course deleted successfully",
        course,
      });
    } catch (error) {
      return next(new Errorhandler(500, "Error in deleting course "));
    }
  }
);

export const filterCourses = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const {
        keyword,
        category,
        level,
        language,
        minPrice,
        maxPrice,
        minRating,
        maxRating,
        instructorId,
      } = req.query;
      const filters: any = {};
      if (keyword) {
        filters.$or = [
          {
            title: {
              $regex: keyword,
              $options: "i",
            },
          },
          {
            description: {
              $regex: keyword,
              $options: "i",
            },
          },
          {
            tags: {
              $regex: keyword,
              $options: "i",
            },
          },
        ];
      }
      if (category) filters.category = category;
      if (level) filters.level = level;

      if (language) filters.language = language;
      if (instructorId) filters.instructorId = instructorId;
      if (minPrice) filters.price = { ...filters.price, $gte: minPrice };
      if (maxPrice) filters.price = { ...filters.price, $lte: maxPrice };
      if (minRating) filters.rating = { ...filters.rating, $gte: minRating };
      if (maxRating) filters.rating = { ...filters.rating, $lte: maxRating };
      const ResultCourses = await courseModel.find(filters);
      res.status(200).json({
        success: true,
        message: "successfully filtered courses",
        courses: ResultCourses,
      });
    } catch (error) {
      return next(new Errorhandler(500, "Error in course filteration "));
    }
  }
);
