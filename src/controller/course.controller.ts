import courseModel, { Course, notes } from "../models/coursemodel";
import catchAsync from "../middleware/catchasync.middleware";
import Errorhandler from "../util/Errorhandler.util";
import UploadOnCloudinary from "../util/cloudinary.util";
import { Response, NextFunction, Request } from "express";
import { reqwithuser } from "../middleware/auth.middleware";
import usermodel, { User } from "../models/usermodel";
import { Schema } from "mongoose";

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
      isPaid,
      startingDate,
      modules,
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
      isPaid,
      startingDate,
      modules,
      // thumbnailUrl,
    });
    await newcourse.save();
    res.status(201).json({
      success: true,
      message: "successfully created course",
    });
    } catch (error:any) {
      return next(new Errorhandler(500, error));
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
        tags,
        category,
        level,
        language, //
        minPrice,
        maxPrice,
        minRating,
        maxRating,
        instructorId, //
        isPaid, //
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
      if (Array.isArray(tags)) {
        filters.tags = { $in: tags };
      }
      if (category) {
        filters.category = category;
      }
      if (level) filters.level = level;

      if (language) filters.language = language;
      if (Array.isArray(language)) {
        filters.language = { $in: language };
      }
      if (instructorId) {
        filters.instructorId = { $in: `ObjectId${instructorId}` };
      }

      if (isPaid === "true") {
        filters.isPaid = true;
      }
      if (isPaid === "false") {
        filters.isPaid = false;
      }
      if (minPrice) filters.price = { ...filters.price, $gte: minPrice };
      if (maxPrice) filters.price = { ...filters.price, $lte: maxPrice };
      if (minRating) filters.rating = { ...filters.rating, $gte: minRating };
      if (maxRating) filters.rating = { ...filters.rating, $lte: maxRating };
      console.log(filters);
      const ResultCourses = await courseModel
        .find(filters)
        .select("-modules -quizzes")
        .populate("instructorId");
      if (ResultCourses.length === 0) {
        return next(new Errorhandler(404, "Sorry, No courses found"));
      }
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

export const updatecourse = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;

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
        isPaid,
      } = req.body;
      if (!courseId) {
        return next(new Errorhandler(400, "Course ID is required"));
      }
      const updates: any = {
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
        isPaid,
      };
      if (req.file) {
        const cloudinary = await UploadOnCloudinary(req.file.path);
        updates.thumbnailUrl = cloudinary?.secure_url;
      }
      Object.keys(updates).forEach(
        (key) => updates[key] === undefined && delete updates[key]
      );
      const updatedCourse = await courseModel.findByIdAndUpdate(
        courseId,
        updates,
        {
          new: true,
          runValidators: true,
        }
      );
      if (!updatedCourse) {
        return next(new Errorhandler(404, "course not found"));
      }
      res.status(200).json({
        success: true,
        message: "course updated successfully",
        course: updatecourse,
      });
    } catch (error) {
      next(new Errorhandler(500, "Error in Update Course"));
    }
  }
);
export const getCourseInfo = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      if (!courseId) {
        return next(new Errorhandler(404, "course ID not found"));
      }
      const course = await courseModel.findById(courseId);
      if (!course) {
        return next(new Errorhandler(404, "course not found "));
      }
      res.status(200).json({
        success: true,
        message: "course details successfully fetched",
        course,
      });
    } catch (error) {
      next(new Errorhandler(500, "Error in fetching course details"));
    }
  }
);
export const courseByCategory = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const courses = await courseModel.find();
      if (courses.length === 0) {
        return next(new Errorhandler(404, "course not found"));
      }
      const groupedCourses = courses.reduce((acc: any, course: Course) => {
        const { category } = course as Course;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(course);
        return acc;
      }, {});
      res.status(200).json({
        success: true,
        message: "successfully fetched grouped by category courses",
        groupedCourses,
      });
    } catch (error) {
      next(new Errorhandler(500, "Error in course by category"));
    }
  }
);
export const SearchCourses = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const { searchQuery } = req.query;
      if (!searchQuery) {
        next(new Errorhandler(404, "please give query for searching "));
      }
      const courses = await courseModel
        .find({
          title: { $regex: searchQuery, $options: "i" },
        })
        .select("-modules -quizzes");
      if (!courses) {
        next(new Errorhandler(404, "courses not found"));
      }
      const filteredInfo = courses.map((course) => {
        return {
          title: course.title,
          category: course.category,
          thumbnailUrl: course.thumbnailUrl,
          _id: course._id,
        };
      });
      if (filteredInfo.length === 0) {
        return next(new Errorhandler(404, "Sorry, No Courses Found"));
      }
      res.status(200).json({
        success: true,
        filteredInfo,
      });
    } catch (error) {
      next(new Errorhandler(500, "Error in Searching"));
    }
  }
);

export const RateCourse = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const { rating, comment } = req.body;
      if (!courseId || !comment || !courseId) {
        return next(
          new Errorhandler(400, "Please provide course ID, rating, and comment")
        );
      }
      if (rating < 0 && rating > 5) {
        return next(new Errorhandler(400, "Rating must between 0 and 5"));
      }
      const userId = req.user?.id;
      const course = await courseModel.findById(courseId);
      if (!course) {
        return next(new Errorhandler(404, "Course not found "));
      }
      const ExistingReview = course.reviews.find(
        (review) => review.userId.toString() === userId.toString()
      );
      if (ExistingReview) {
        return next(
          new Errorhandler(400, "You have already rated this course")
        );
      }

      const newreview = {
        userId,
        rating,
        comment,
      };
      course.reviews.push(newreview as any);
      const TotalRatings = course.reviews.length;
      const TotalScore = course.reviews.reduce(
        (acc, review) => acc + review.rating,
        0
      );
      course.rating = TotalScore / TotalRatings || 0;
      await course.save();
      res.status(200).json({
        success: true,
        message: "added your rating to the course",
      });
    } catch (error) {
      return next(new Errorhandler(500, "Error in Ratecourse"));
    }
  }
);
export const getEnrolledCourses = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const enrolledCourses = await usermodel
        .findById(userId)
        .populate("EnrolledCourses.courseId");
      if (!enrolledCourses) {
        return next(new Errorhandler(404, "courses not found"));
      }
      res.status(200).json({
        success: true,
        message: "successfully fetched enrolled courses",
        courses: enrolledCourses.EnrolledCourses,
      });
    } catch (error) {
      return next(new Errorhandler(500, "Error in fetching enrolled courses"));
    }
  }
);
export const createNote = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const { note, lessonName, NoteMakingTime } = req.body;
      console.log("this is a req.body:", req.body);
      const { courseId } = req.params;

      const userId = req.user?._id;
      const course = await courseModel.findById(courseId);
      if (!course) {
        return next(new Errorhandler(404, "Course not found"));
      }
      course.notes.push({
        userId: userId as Schema.Types.ObjectId,
        note,
        lessonName,
        NoteMakingTime,
      } as notes);
      await course.save();
      res.status(201).json({
        success: true,
        message: "Successfully created your note",
      });
    } catch (error) {
      next(new Errorhandler(500, "Error in creating note"));
    }
  }
);
export const deletenote = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const { noteId, courseId } = req.params;
      const course = await courseModel.findById(courseId);
      if (!course) {
        return next(new Errorhandler(404, "course not found"));
      }
      course.notes = course.notes.filter((note) => {
        return (note._id as string).toString() !== noteId.toString();
      });
      await course.save();
      res.status(200).json({
        success: true,
        message: "successfully deleted not",
      });
    } catch (error: any) {
      return next(new Errorhandler(500, error));
    }
  }
);
export const getUserNotes = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const { lessonName } = req.query;
      if (!lessonName) {
        return next(new Errorhandler(404, "lesson name is required"));
      }
      const userId = req.user?._id;

      const course = await courseModel.findById(courseId);
      if (!course) {
        return next(new Errorhandler(404, "course not found"));
      }
      const userNotes = course.notes.filter(
        (note) => note.userId.toString() === (userId as string).toString()
      );
      console.log("this is a user notes", userNotes);
      const lessonNotes = userNotes.filter(
        (note) => note.lessonName.trim() === (lessonName as string).trim()
      );
      console.log("this is a lesson notes", lessonNotes);
      res.status(200).json({
        success: true,
        message: "Fetched successfully your lesson notes",
        lessonNotes,
      });
    } catch (error: any) {
      return next(new Errorhandler(500, error));
    }
  }
);
