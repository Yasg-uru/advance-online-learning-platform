import { NextFunction, Request, Response } from "express";
import catchAsync from "../middleware/catchasync.middleware";
import usermodel, { User } from "../models/usermodel";
import bcrypt from "bcrypt";
import sendVerificationMail from "../util/sendmail.util";
import UploadOnCloudinary from "../util/cloudinary.util";
import Errorhandler from "../util/Errorhandler.util";
import sendtoken from "../util/sendtoken";

export const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, email, password } = req.body;

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
    } catch (error) {
      console.log("Error registering user", error);

      return res.status(500).json({
        success: false,
        message: "Error registering user",
      });
    }
  }
);
export const verifyuser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, code } = req.body;
      const user: User | null = await usermodel.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "user not found with this email",
        });
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
        return res.status(400).json({
          success: false,
          message:
            "Verification code has expired. Please sign up again to get a new code.",
        });
      } else {
        return res.status(400).json({
          success: false,
          message:
            "Incorrect verification code . please signup again to get a new code",
        });
      }
    } catch (error) {
      console.log("Error verify code");
      res.status(500).json({
        success: false,
        message: "Error verifying user",
      });
    }
  }
);

export const Login = catchAsync(async (req, res, next) => {
  try {
    
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new Errorhandler(404, "Please Enter credentials"));
    }
    const user = await usermodel.findOne({ email });
    if (!user) {
      return next(new Errorhandler(404, "Invalid credentials"));
    }
    if(!user.isVerified){
      return next(new Errorhandler(400,"Access denied, Please verify your account first "));
      
    }
    const isCorrectPassword = await user.comparePassword(password);
    if (!isCorrectPassword) {
      return next(new Errorhandler(404, "Invalid credentials"));
    }
    const token = user.generateToken();
    sendtoken(res, token, 200, user);
  } catch (error) {
    console.log("Error Login", error);
    return next(new Errorhandler(500, "Error in Login"));
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
