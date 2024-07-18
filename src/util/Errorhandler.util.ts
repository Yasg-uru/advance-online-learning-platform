import { NextFunction, Request } from "express";

class Errorhandler extends Error {
  statuscode: number;
  message: string;
  constructor(statuscode: number, message: string) {
    super();

    this.statuscode = statuscode;
    this.message = message;
    Error.captureStackTrace(this, this.constructor);
  }
}
// export const ErrorhandlerMiddleware = (err:Errorhandler, req:Request, res:Response, next:NextFunction) => {
//     if (err instanceof Errorhandler) {
//         return res.status(err.statuscode).json({ error: err.message });
//     }
//     return res.status(500).json({ error: "Internal Server Error" });
// }
    
  
export default Errorhandler;
