import { type NextFunction, type Request, type Response } from "express";
import mongoose from "mongoose";
import { CustomError } from "../../../CustomError/CustomError.js";
import { Tip, type TipSchemaStructure } from "../../../database/models/Tip.js";
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

export const deleteTipById = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    const tips = await Tip.findByIdAndDelete({
      _id: id,
      sharedBy: req.sharedBy,
    }).exec();

    res.status(200).json({ tips });
  } catch {
    const customError = new CustomError(
      "Internal Server Error",
      500,
      "Not possible to delete the Tip"
    );

    next(customError);
  }
};

export const createTip = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  const tip = req.body as TipSchemaStructure;
  const { id } = req;

  try {
    const newTip = await Tip.create({
      ...tip,
      sharedBy: new mongoose.Types.ObjectId(id),
    });

    res.status(201).json({ ...newTip.toJSON() });
  } catch (error) {
    const customError = new CustomError(
      "Not possible to create a Tip",
      500,
      "Tip not created. Try again!"
    );
    next(customError);
  }
};
