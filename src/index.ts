import express from "express";
import ConnectDatabase from "./lib/connectDb";
import dotenv from "dotenv";
import userRouter from "./route/user.route";
const app = express();
app.use("/user",userRouter);
dotenv.config();
ConnectDatabase();

app.listen(4000, () => {
  console.log("server is running on port:4000 ");
});
