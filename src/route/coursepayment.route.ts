import { Router } from "express";
import { authorization, isAuthenticated } from "../middleware/auth.middleware";
import { createOrder } from "../controller/coursepayment.controller";
const coursePaymentRouter = Router();
coursePaymentRouter.post("/intialize/:courseId",isAuthenticated,createOrder);
;
export default coursePaymentRouter;
