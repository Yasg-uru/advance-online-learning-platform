import express from "express";
import ConnectDatabase from "./lib/connectDb";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRouter from "./route/user.route";
import CourseRouter from "./route/course.route";
import ModuleRouter from "./route/module.route";
import QuizRouter from "./route/quiz.route";
import coursePaymentRouter from "./route/coursepayment.route";
const app = express();
app.use(cookieParser());
app.use(express.json());

app.use("/user", userRouter);
app.use("/course", CourseRouter);
app.use("/course/module", ModuleRouter);
app.use("/course/module/quiz", QuizRouter);
app.use("/payment", coursePaymentRouter);

dotenv.config();
ConnectDatabase();
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("server is running on port:", PORT);
});
