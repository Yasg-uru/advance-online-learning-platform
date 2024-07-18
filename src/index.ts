import express from "express";
import ConnectDatabase from "./lib/connectDb";
import dotenv from "dotenv";
import userRouter from "./route/user.route";
const app = express();
app.use(express.json());

app.use("/user", userRouter);
dotenv.config();
ConnectDatabase();
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("server is running on port:", PORT);
});
