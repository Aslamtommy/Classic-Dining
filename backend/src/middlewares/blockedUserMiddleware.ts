import { Request, Response, NextFunction } from "express";
import User from "../models/User/userModel";

const blockedUserMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const   email = req.body.email || req.query.email;
 
    console.log('emial in blocked middleware',email)
    const user = await User.findOne({ email });
 
    if (user && user.isBlocked) {
     res.status(403).json({ message: "User is blocked by Admin." });
     return
    }

   
    return next();
  } catch (error: any) {
    console.error(error.message);
     
    return next(error);
  }
};

export default blockedUserMiddleware;
