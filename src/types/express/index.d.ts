import { JwtDecodedUser } from "../jwtDecodedUser";
declare module "express-serve-static-core" {
  interface Request {
    user: JwtDecodedUser;
    yash:"yashchoudhary";
    cookies: { [key: string]: string };
  }
}
