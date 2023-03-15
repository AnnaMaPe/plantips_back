import { type NextFunction, type Request, type Response } from "express";
import { CustomError } from "../../../CustomError/CustomError.js";
import { Tip } from "../../../database/models/Tip.js";
import { type UserRequest } from "../../../Types/users/types.js";

export const getTips = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tips = await Tip.find().exec();

    res.status(200).json({ tips });
  } catch (error) {
    const customError = new CustomError(
      (error as Error).message,
      400,
      "Couldn't retrieve tips"
    );

    next(customError);
  }
};

export const getMyTips = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tips = await Tip.find({ sharedBy: req.sharedBy }).exec();

    res.status(200).json({ tips });
  } catch {
    const customError = new CustomError(
      "Bad request",
      400,
      "Not possible to obtain your Tips"
    );

    next(customError);
  }
};
