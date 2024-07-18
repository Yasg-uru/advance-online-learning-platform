import { NextFunction, Request, Response } from 'express';

// Generic function to handle asynchronous errors with Express
const catchAsync = <T>(fn: (req: Request, res: Response, next: NextFunction) => Promise<T>) => (
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next)
      .catch((error) => {
        console.error(error); // Log the error for debugging
        // Handle the error here, send appropriate response to client
        res.status(500).json({ message: 'Internal Server Error' }); // Example error response
      });
  }
);

export default catchAsync;