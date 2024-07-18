import JwtDecodedUser from "./jwtDecodedUser";
import { Request } from "express";

export  interface Requestwithuser extends Request {
  user: JwtDecodedUser,
  cookies:{[key:string]:string}
}