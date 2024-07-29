import { Router } from "express";
import { authorization, isAuthenticated } from "../middleware/auth.middleware";
import {
  createOrder,
  EnrolleFreeCourse,
  verifypaymentStatus,
} from "../controller/coursepayment.controller";
import {
  checkIsFree,
  checkIsPaid,
} from "../middleware/isfreecourse.middleware";
import { isAlreadyEnrolled } from "../middleware/checkpaymentstatus.middleware";
const coursePaymentRouter = Router();
coursePaymentRouter.post(
  "/intialize/:courseId",
  isAuthenticated,
  isAlreadyEnrolled,
  checkIsPaid,
  createOrder
); //marked
coursePaymentRouter.post(
  "/verify-payment/:courseId",
  isAuthenticated,
  isAlreadyEnrolled,
  checkIsPaid,
  verifypaymentStatus
); // marked
coursePaymentRouter.post(
  "/enroll-free/:courseId",
  isAuthenticated,
  isAlreadyEnrolled,
  checkIsFree,
  EnrolleFreeCourse
); //marked
export default coursePaymentRouter;
