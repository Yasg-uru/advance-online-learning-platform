import courseModel from "../models/coursemodel";
import catchAsync from "../middleware/catchasync.middleware";
import Errorhandler from "../util/Errorhandler.util";
import { reqwithuser } from "../middleware/auth.middleware";
import { NextFunction, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import razorpay from "../config/razorpayConfig";

export const createOrder = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const { amount, currency = "INR" } = req.body;
      const receipt = Math.floor(Math.random()*(99999-10000+1))+10000;
      const options = {
        amount: amount * 100,
        currency,
        receipt:`order_${receipt}`,
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
