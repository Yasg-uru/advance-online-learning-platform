import { NextFunction, Request, Response } from "express";
import catchAsync from "../middleware/catchasync.middleware";
import usermodel, { User } from "../models/usermodel";
import bcrypt from "bcrypt";
import sendVerificationMail from "../util/sendmail.util";
import UploadOnCloudinary from "../util/cloudinary.util";

export const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, email, password } = req.body;

      const ExistingUser: User | null = await usermodel.findOne({
        email,
        isVerified: true,
      });

      if (ExistingUser) {
        return res.status(400).json({
          success: false,
          message: "user already exist",
        });
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
      } else {
        const HashedPassword = await bcrypt.hash(password, 10);
        const verifyCodeExpiry = new Date(Date.now() + 3600000);
        if (req.file && req.file.path) {
          const cloudinaryUrl = await UploadOnCloudinary(req.file.path);

          const profileUrl = cloudinaryUrl?.secure_url;

          const newUser = new usermodel({
            username,
            password: HashedPassword,
            email,
            profileUrl: profileUrl || null,
            verifyCode: verifyCode,
            verifyCodeExpiry: verifyCodeExpiry,
            isVerified: false,
          });

          await newUser.save();
        } else {
          const newUser = new usermodel({
            username,
            password: HashedPassword,
            email,
            verifyCode: verifyCode,
            verifyCodeExpiry: verifyCodeExpiry,
            isVerified: false,
          });

          await newUser.save();
        }
        //email verification system
        const emailResponse = await sendVerificationMail(
          username,
          email,
          verifyCode
        );
        if (!emailResponse.success) {
          return res.status(200).json({
            success: false,
            message: emailResponse.message,
          });
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
