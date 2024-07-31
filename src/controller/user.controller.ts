import { NextFunction, Request, Response } from "express";
import catchAsync from "../middleware/catchasync.middleware";
import usermodel, { User } from "../models/usermodel";
import bcrypt from "bcrypt";
import sendVerificationMail, {
  sendResetPasswordMail,
} from "../util/sendmail.util";
import UploadOnCloudinary from "../util/cloudinary.util";
import Errorhandler from "../util/Errorhandler.util";
import sendtoken from "../util/sendtoken";
import { reqwithuser } from "../middleware/auth.middleware";
import { Schema, ObjectId } from "mongoose";
import courseModel from "../models/coursemodel";

export const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, email, password } = req.body;
      console.log("this is a req.body", req.body);
      const ExistingUser = await usermodel.findOne({
        email,
        isVerified: true,
      });

      if (ExistingUser) {
        return next(new Errorhandler(400, "already user exist"));
      }
      const ExistingUserUnVerified = await usermodel.findOne({
        email,
        isVerified: false,
      });
      let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

      if (ExistingUserUnVerified) {
        ExistingUserUnVerified.password = await bcrypt.hash(password, 10);
        ExistingUserUnVerified.verifyCode = verifyCode;
        ExistingUserUnVerified.verifyCodeExpiry = new Date(
          Date.now() + 3600000
        );
        await ExistingUserUnVerified.save();
        const emailResponse = await sendVerificationMail(
          username,
          email,
          verifyCode
        );
        if (!emailResponse.success) {
          return next(new Errorhandler(400, emailResponse.message));
        }
      } else {
        const verifyCodeExpiry = new Date(Date.now() + 3600000);
        if (req.file && req.file.path) {
          const cloudinaryUrl = await UploadOnCloudinary(req.file.path);

          const profileUrl = cloudinaryUrl?.secure_url;
          console.log(
            "this is a cloudinary and secure url",
            profileUrl + "     " + cloudinaryUrl
          );
          const newUser = new usermodel({
            username,
            password,
            email,
            profileUrl: profileUrl,
            verifyCode: verifyCode,
            verifyCodeExpiry: verifyCodeExpiry,
            isVerified: false,
          });

          await newUser.save();
        } else {
          const newUser = new usermodel({
            username,
            password,
            email,
            verifyCode: verifyCode,
            verifyCodeExpiry: verifyCodeExpiry,
            isVerified: false,
          });

          await newUser.save();
        }

        const emailResponse = await sendVerificationMail(
          username,
          email,
          verifyCode
        );
        if (!emailResponse.success) {
          return next(new Errorhandler(400, emailResponse.message));
        }
      }
      res.status(201).json({
        success: true,
        message:
          "User registered successfully ,please verify your account first",
      });
    } catch (error: any) {
      return next(new Errorhandler(500, "Internal server Error "));
    }
  }
);
export const verifyuser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, code } = req.body;
      const user: User | null = await usermodel.findOne({ email });
      if (!user) {
        return next(new Errorhandler(404, "user not found with this email"));
      }

      const isValidCode = user.verifyCode === code;
      const isNotCodeExpired = new Date(user.verifyCodeExpiry) > new Date();
      if (isValidCode && isNotCodeExpired) {
        user.isVerified = true;
        await user.save();
        res.status(200).json({
          success: true,
          message: "your account has been successfully verified",
        });
      } else if (!isNotCodeExpired) {
        return next(
          new Errorhandler(
            404,
            "Verification code has expired. Please sign up again to get a new code."
          )
        );
      } else {
        return next(
          new Errorhandler(
            404,
            "Incorrect verification code . please signup again to get a new code"
          )
        );
      }
    } catch (error: any) {
      return next(new Errorhandler(404, error));
    }
  }
);

export const Login = catchAsync(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log("this is a req.body:", req.body);
    if (!email || !password) {
      return next(new Errorhandler(404, "Please Enter credentials"));
    }
    const user = await usermodel.findOne({ email });
    if (!user) {
      return next(new Errorhandler(404, "Invalid credentials"));
    }
    if (!user.isVerified) {
      return next(
        new Errorhandler(
          400,
          "Access denied, Please verify your account first "
        )
      );
    }
    const isCorrectPassword = await user.comparePassword(password);
    if (!isCorrectPassword) {
      return next(new Errorhandler(404, "Invalid credentials"));
    }
    const token = user.generateToken();
    sendtoken(res, token, 200, user);
  } catch (error: any) {
    console.log("Error Login", error);
    return next(new Errorhandler(500, "Internal server Error "));
  }
});
export const Logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res
      .cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: false,
        sameSite: "none" as const,
        secure: true,
      })
      .status(200)
      .json({
        success: true,
        message: "Logged out successfully",
      });
  }
);
export const forgotPassword = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const user = await usermodel.findOne({ email });
      if (!user) {
        return next(new Errorhandler(404, "User not found"));
      }
      user.ResetToken();
      await user.save();
      const resetUrl = `http://localhost:5173/reset-password/${user.ResetPasswordToken}`;
      const mailresponse = await sendResetPasswordMail(resetUrl, email);
      if (!mailresponse.success) {
        return next(new Errorhandler(403, mailresponse.message));
      }
      res.status(200).json({
        success: true,
        message: "sent forgot password email successfully",
      });
    } catch (error) {
      return next(new Errorhandler(500, "Error forgot password"));
    }
  }
);
export const Resetpassword = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const { token } = req.params;
      const { password } = req.body;
      //finding the user by this resettoken
      const user = await usermodel.findOne({
        ResetPasswordToken: token,
        ResetPasswordTokenExpire: { $gt: new Date() },
      });
      if (!user) {
        return next(
          new Errorhandler(404, "Resetpassword token has been expired")
        );
      }
      user.password = password;
      user.ResetPasswordToken = undefined;
      user.ResetPasswordTokenExpire = undefined;
      await user.save();
      res.status(200).json({
        success: true,
        message: "your reset password successfully",
      });
    } catch (error) {
      return next(new Errorhandler(500, "Error password Reset"));
    }
  }
);

//implementing progress tracking functionality
export const completeLesson = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const { courseId, moduleId, lessonId } = req.params;

      const user = await usermodel.findById(userId);
      if (!user) {
        return next(new Errorhandler(404, "user not found"));
      }
      const course = user.EnrolledCourses.find(
        (course) => course.courseId.toString() === courseId.toString()
      );
      if (!course) {
        return next(new Errorhandler(404, "course not found"));
      }
      const module = course.modulesProgress.find(
        (module) => module.moduleId.toString() === moduleId.toString()
      );
      if (!module) {
        return next(new Errorhandler(404, "Module not found "));
      }
      if (module.progress === 100) {
        return next(
          new Errorhandler(403, "All lessons are completed to this module")
        );
      }
      const LessonId = lessonId as unknown as Schema.Types.ObjectId;
      const courseModules = await courseModel.findById(courseId);
      if (!courseModules) {
        return next(new Errorhandler(404, "course not found "));
      }
      const ModuleLessons = courseModules.modules.find(
        (module) => (module._id as string).toString() === moduleId.toString()
      );
      if (!ModuleLessons) {
        return next(new Errorhandler(404, "Lesson not found"));
      }
      if (!module.completedLessons.includes(LessonId)) {
        module.completedLessons.push(LessonId);
        const TotalLessons = ModuleLessons.lessons.length;
        module.progress = (module.completedLessons.length / TotalLessons) * 100;
        module.completionStatus = module.progress === 100;
        //recalculating the overall course progress
        const TotalModules = course.modulesProgress.length;
        const completedModules = course.modulesProgress.filter(
          (module) => module.completionStatus
        ).length;
        course.overallProgress = (completedModules / TotalModules) * 100;
        course.CompletionStatus = course.overallProgress === 100;
        await user.save();
      }
      res.status(200).json({
        success: true,
        message: "Successfully tracked your progress",
        user,
      });
    } catch (error: any) {
      return next(new Errorhandler(500, "Internal server Error "));
    }
  }
);
export const LoadProgress = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const { courseId } = req.params;

      const user = await usermodel.findById(userId);
      if (!user) {
        return next(new Errorhandler(404, "User not found"));
      }
      const EnrolledCourse = user.EnrolledCourses.find(
        (course) => course.courseId.toString() === courseId.toString()
      );
      if (!EnrolledCourse) {
        return next(new Errorhandler(404, "user not enrolled to this course "));
      }

      res.status(200).json({
        success: true,
        message: "successfully fetched your progress to the particular course",
        EnrolledCourse,
      });
    } catch (error: any) {
      return next(new Errorhandler(500, "Internal server Error "));
    }
  }
);
export const getAllEnrolledCourseProgress = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const user = await usermodel.findById(userId);
      if (!user) {
        return next(new Errorhandler(404, "User not found "));
      }
      const EnrolledCourses = user.EnrolledCourses;
      res.status(200).json({
        success: true,
        message: "Successfully fetched enrolled courses",
        EnrolledCourses,
      });
    } catch (error: any) {
      return next(new Errorhandler(500, "Internal server Error "));
    }
  }
);
