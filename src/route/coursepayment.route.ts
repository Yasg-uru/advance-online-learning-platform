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
const coursePaymentRouter = Router();
coursePaymentRouter.post(
  "/intialize/:courseId",
  isAuthenticated,
  checkIsPaid,
  createOrder
);
coursePaymentRouter.post(
  "/verify-payment/:courseId",
  isAuthenticated,
  checkIsPaid,
  verifypaymentStatus
);
coursePaymentRouter.post(
  "/enroll-free/:courseId",
  isAuthenticated,
  checkIsFree,
  EnrolleFreeCourse
);
export default coursePaymentRouter;
