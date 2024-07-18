import { NextFunction } from "express";
import catchAsync from "./catchasync.middleware";
import jwt, { decode } from "jsonwebtoken";
import { Requestwithuser } from "../types/ReqwithUser";
import Errorhandler from "../util/Errorhandler.util";
import JwtDecodedUser from "../types/jwtDecodedUser";

export const isAuthenticated = async (
  req: Requestwithuser,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return next(new Errorhandler(400, "please Login to continue"));
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtDecodedUser;
    if (!decode) {
      return next(new Errorhandler(400, "please login to continue"));
    }
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      // Handle specific JWT errors
      return next(new Errorhandler(401, "Invalid or expired token"));
    } else {
      return next(new Errorhandler(500, "Error verifying token"));
    }
  }
};
export const authorization = (...roles: string[]) => {
  return (req: Requestwithuser, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new Errorhandler(
          400,
          `${req.user.role} is not allowed to access this resource`
        )
      );
    }
    next();
  };
};
