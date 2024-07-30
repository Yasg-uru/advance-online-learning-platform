import catchAsync from "../middleware/catchasync.middleware";
import courseModel, {
  Lesson,
  lessonSchema,
  Module,
} from "../models/coursemodel";
import Errorhandler from "../util/Errorhandler.util";
import { Response, NextFunction } from "express";
import { reqwithuser } from "../middleware/auth.middleware";
import mongoose, { Document, Schema } from "mongoose";
import usermodel from "../models/usermodel";

// export const addModuleToCourse = catchAsync(
//   async (req: reqwithuser, res: Response, next: NextFunction) => {
//     // try {
//       const { courseId } = req.params;
//       const { title, description, lessons, orderIndex } = req.body;

//       if (!courseId) {
//         return next(new Errorhandler(404, "course ID not found"));
//       }
//       const course = await courseModel.findById(courseId);
//       if (!course) {
//         return next(new Errorhandler(404, "course not found"));
//       }
//       const newModule = {
//         title,
//         description,
//         lessons,
//         orderIndex,
//       };
//       course.modules.push(newModule as Module);
//       await course.save();
//       const addedModule = course.modules.find((module) => {
//         return (
//           module.title === title &&
//           module.description === description &&
//           module.orderIndex === orderIndex
//         );
//       });
//       if (!addedModule) {
//         return next(new Errorhandler(404, "module not found after insertion"));
//       }
//       //after that we need to update the user module progress array
//       const EnrolledUsers = await usermodel.find({
//         "EnrolledCourses.courseId": courseId,
//       });
//       for (const user of EnrolledUsers) {
//         const enrolledCourse = user.EnrolledCourses.find(
//           (course) => course.courseId.toString() === courseId.toString()
//         );
//         if (enrolledCourse) {
//           const ExistingmoduleIds = enrolledCourse.modulesProgress.map(
//             (module) => module.moduleId
//           );
//           if (
//             ExistingmoduleIds.includes(addedModule._id as Schema.Types.ObjectId)
//           ) {
//             enrolledCourse.modulesProgress.push({
//               moduleId: addedModule._id as Schema.Types.ObjectId,
//               completedLessons: [],
//               progress: 0,
//               completionStatus: false,
//             });
//             await user.save();
//           }
//         }
//       }
//       res.status(200).json({
//         success: true,
//         message: "Module Created Successfully",
//       });
//     // } catch (error) {
//     //   next(new Errorhandler(500, "Error in course module creation "));
//     // }
//   }
// );


export const addModuleToCourse = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const { title, description, lessons, orderIndex } = req.body;

      if (!courseId) {
        return next(new Errorhandler(404, "course ID not found"));
      }

      const course = await courseModel.findById(courseId);
      if (!course) {
        return next(new Errorhandler(404, "course not found"));
      }

      const newModule = {
        title,
        description,
        lessons,
        orderIndex,
      };

      course.modules.push(newModule as Module);
      await course.save();

      const addedModule = course.modules.find((module) => {
        return (
          module.title === title &&
          module.description === description &&
          module.orderIndex === orderIndex
        );
      });

      if (!addedModule) {
        return next(new Errorhandler(404, "module not found after insertion"));
      }

      // Update the user module progress array
      const enrolledUsers = await usermodel.find({
        "EnrolledCourses.courseId": courseId,
      });

      for (const user of enrolledUsers) {
        const enrolledCourse = user.EnrolledCourses.find(
          (course) => course.courseId.toString() === courseId.toString()
        );

        if (enrolledCourse) {
          const existingModuleIds = enrolledCourse.modulesProgress.map(
            (module) => module.moduleId
          );

          if (
            !existingModuleIds.includes(
              addedModule._id as Schema.Types.ObjectId
            )
          ) {
            enrolledCourse.modulesProgress.push({
              moduleId: addedModule._id as Schema.Types.ObjectId,
              completedLessons: [],
              progress: 0,
              completionStatus: false,
            });

            await user.save();
          }
        }
      }

      res.status(200).json({
        success: true,
        message: "Module Created Successfully",
      });
    } catch (error) {
      next(new Errorhandler(500, "Error in course module creation"));
    }
  }
);

export const updateModule = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const { courseId, moduleId } = req.params;
      console.log("this is a module id ", moduleId);
      const { title, description, lessons, orderIndex } = req.body;
      const course = await courseModel.findById(courseId);
      if (!course) {
        return next(new Errorhandler(404, "Course not found"));
      }

      const updates: any = {
        title,
        description,
        lessons,
        orderIndex,
      };
      Object.keys(updates).forEach(
        (key) => updates[key] === undefined && delete updates[key]
      );

      const module = course.modules.find((module) => {
        const moduleID = module._id as string;

        return moduleID.toString() === moduleId;
      });

      if (!module) {
        return next(new Errorhandler(404, "module not found"));
      }
      module.title = title || module.title;
      module.description = description || module.description;
      module.lessons = lessons || module.lessons;
      module.orderIndex = orderIndex || module.orderIndex;
      await course.save();
      res.status(200).json({
        success: true,
        message: "Successfully updated module",
      });
    } catch (error) {
      next(new Errorhandler(500, "Error in module updation"));
    }
  }
);
export const GetModulesAndQuizesFullAccess = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const course = await courseModel.findById(courseId);
      if (!course) {
        return next(new Errorhandler(404, "course not found"));
      }
      res.status(200).json({
        success: true,
        message: "successfully fetched course",
        course,
      });
    } catch (error) {
      next(new Errorhandler(500, "Error in get course module"));
    }
  }
);
export const GetModulesAndQuizes = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const course = await courseModel.findById(courseId, {
        "modules.title": 1,
        "modules.description": 1,
        "modules.lessons.title": 1,
        "modules.lessons.description": 1,
        "modules.orderIndex": 1,
      });
      if (!course) {
        return next(new Errorhandler(404, "course not found"));
      }
      res.status(200).json({
        success: true,
        message: "successfully fetched course",
        course: course.modules,
      });
    } catch (error) {
      next(new Errorhandler(500, "Error in get course module"));
    }
  }
);
export const DeleteCourseModule = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const { courseId, moduleId } = req.params;
      const course = await courseModel.findById(courseId);
      if (!course) {
        return next(new Errorhandler(404, "course Not found"));
      }
      const filteredModule = course.modules.filter((module) => {
        const moduleID = module._id as string;
        return moduleID.toString() !== moduleId;
      });

      course.modules = filteredModule;
      await course.save();
      res.status(200).json({
        success: true,
        message: "deleted module successfully",
      });
    } catch (error) {
      next(new Errorhandler(500, "Error in deleting course module"));
    }
  }
);

export const addLessonToModule = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const { moduleId, courseId } = req.params;
      const {
        title,
        description,
        contentUrl,
        contentType,
        duration,
        resources,
      } = req.body;
      if (!courseId || !moduleId) {
        return next(
          new Errorhandler(404, "course Id or module id is required")
        );
      }
      const course = await courseModel.findById(courseId);
      if (!course) {
        return next(new Errorhandler(404, "course not found"));
      }
      const module = course.modules.find((module) => {
        const moduleID = module._id as string;
        return moduleID.toString() === moduleId;
      });
      if (!module) {
        return next(new Errorhandler(404, "module not found"));
      }
      const newLesson = {
        title,
        description,
        contentUrl,
        contentType,
        duration,
        resources,
      };
      module.lessons.push(newLesson as Lesson);
      await course.save();
      res.status(200).json({
        success: true,
        message: "Successfully added lesson to the module",
      });
    } catch (error) {
      next(new Errorhandler(500, "Error in addLessonToModule"));
    }
  }
);
