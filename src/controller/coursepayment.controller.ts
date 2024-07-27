import courseModel from "../models/coursemodel";
import catchAsync from "../middleware/catchasync.middleware";
import Errorhandler from "../util/Errorhandler.util";
import { reqwithuser } from "../middleware/auth.middleware";
import { NextFunction, Response } from "express";

import razorpay from "../config/razorpayConfig";
import crypto from "crypto";
import { Schema } from "mongoose";
import usermodel from "../models/usermodel";

export const createOrder = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const { amount, currency = "INR" } = req.body;
      const { courseId } = req.params;
      const course = await courseModel.findById(courseId);
      if (!course) {
        return next(new Errorhandler(404, "course not found"));
      }
      if (course.isPaid === false) {
        return next(new Errorhandler(403, "This course is free "));
      }
      const options = {
        amount: amount * 100,
        currency,
        receipt: courseId,
      };
      const order = await razorpay.orders.create(options);
      res.status(201).json({
        success: true,
        message: "successfully created order",
        order,
      });
    } catch (error) {
      next(new Errorhandler(500, "Error in creating order"));
    }
  }
);

export const verifypaymentStatus = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        req.body;

      console.log("this is a req.body of the verify payment:", req.body);
      //   const { courseId } = req.params;
      const rzpsecret = "d3q0tkLxfFVKoizPqeboYYsm";
      const generated_signature = crypto
        .createHmac("sha256", rzpsecret)
        .update(`${razorpay_order_id} | ${razorpay_payment_id}`)
        .digest("hex");

      console.log("this is razorpay signature:", razorpay_signature);
      console.log("this is generated  signature:", generated_signature);
      // if (razorpay_signature !== generated_signature) {
      //   return next(new Errorhandler(400, "Invalid payment signature"));
      // }
      const { courseId } = req.params;
      const course = await courseModel.findById(courseId);
      if (!course) {
        return next(new Errorhandler(404, "course not found"));
      }
      const userId = req.user?._id;
      const user = await usermodel.findById(userId);
      if (!user) {
        return next(new Errorhandler(404, "User not found"));
      }
      user.EnrolledCourses.push({
        courseId: course._id as Schema.Types.ObjectId,
        Progress: 0,
        CompletionStatus: false,
      });
      await user.save();
      const userEnrollment: any = course.enrolledUsers.find(
        (user) => user.userId.toString() === (userId as string).toString()
      );
      if (userEnrollment) {
        userEnrollment.paymentStatus = userEnrollment.paymentStatus = "Paid";
      } else {
        course.enrolledUsers.push({
          userId: userId as Schema.Types.ObjectId,
          paymentStatus: "Paid",
          enrolledAt: new Date(),
        });
      }
      await course.save();
      res.status(200).json({
        success: true,
        message: "Payment verified and enrollment updated successfully",
      });
    } catch (error) {
      next(new Errorhandler(500, "Error verifying payment"));
    }
  }
);

export const EnrolleFreeCourse = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const { courseId } = req.params;
      const course = await courseModel.findById(courseId);
      const user = await usermodel.findById(userId);
      if (!user) {
        return next(new Errorhandler(404, "User not found "));
      }
      if (!course) {
        return next(new Errorhandler(404, "course not found"));
      }
      user.EnrolledCourses.push({
        courseId: course._id as Schema.Types.ObjectId,
        CompletionStatus: false,
        Progress: 0,
      });
      await user.save();
      course.enrolledUsers.push({
        userId: user._id as Schema.Types.ObjectId,
        paymentStatus: "Paid",
        enrolledAt: new Date(),
      });
      await course.save();
      res.status(200).json({
        success: true,
        message: "successfully enrolled in course",
      });
    } catch (error) {
      next(new Errorhandler(500, "Error Free Course Enrollement"));
    }
  }
);
