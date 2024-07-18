import { NextFunction, Request, Response } from "express";
import catchAsync from "../middleware/catchasync.middleware";
import usermodel, { User } from "../models/usermodel";
import bcrypt from "bcrypt";
import sendVerificationMail from "../util/sendmail.util";

export const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, email, password } = req.body;

      const ExistingUser: User | null = await usermodel.findOne({
        email,
        isVerified: true,
      });

      if (ExistingUser) {
        return Response.json(
          {
            success: false,
            message: "user already exist",
          },
          { status: 400 }
        );
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

        const newUser = new usermodel({
          username,
          password: HashedPassword,
          email,
          verifyCode: verifyCode,
          verifyCodeExpiry: verifyCodeExpiry,
          isVerified: false,
        });

        await newUser.save();
        //email verification system
        const emailResponse = await sendVerificationMail(
          username,
          email,
          verifyCode
        );
        if (!emailResponse.success) {
          return Response.json(
            {
              success: false,
              message: emailResponse.message,
            },
            { status: 500 }
          );
        }
      }
      return Response.json(
        {
          success: true,
          message:
            "User registered successfully ,please verify your account first",
        },
        { status: 201 }
      );
    } catch (error) {
      console.log("Error registering user");

      return Response.json(
        {
          success: false,
          message: "Error registering user",
        },
        { status: 500 }
      );
    }
  }
);
export const verifyuser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, code } = req.body;
      const user: User | null = await usermodel.findOne({ email });
      if (!user) {
        return Response.json({
          success: false,
          message: "user not found with this email",
        });
      }

      const isValidCode = user.verifyCode === code;
      const isNotCodeExpired = new Date(user.verifyCodeExpiry) > new Date();
      if (isValidCode && isNotCodeExpired) {
        user.isVerified = true;
        await user.save();
        return Response.json(
          {
            success: true,
            message: "your account has been successfully verified",
          },
          { status: 200 }
        );
      } else if (!isNotCodeExpired) {
        return Response.json(
          {
            success: false,
            message:
              "Verification code has expired. Please sign up again to get a new code.",
          },
          { status: 400 }
        );
      } else {
        return Response.json(
          {
            success: false,
            message:
              "Incorrect verification code . please signup again to get a new code",
          },
          { status: 400 }
        );
      }
    } catch (error) {
      console.log("Error verify code");
      return Response.json(
        {
          success: false,
          message: "Error verifying user",
        },
        { status: 500 }
      );
    }
  }
);
