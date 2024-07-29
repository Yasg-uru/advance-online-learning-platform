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
); //marked
coursePaymentRouter.post(
  "/verify-payment/:courseId",
  isAuthenticated,
  checkIsPaid,
  verifypaymentStatus
); // change required
coursePaymentRouter.post(
  "/enroll-free/:courseId",
  isAuthenticated,
  checkIsFree,
  EnrolleFreeCourse
); //marked
export default coursePaymentRouter;
