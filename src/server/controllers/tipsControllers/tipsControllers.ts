import { type NextFunction, type Request, type Response } from "express";
import { CustomError } from "../../../CustomError/CustomError.js";
import { Tip, type TipSchemaStructure } from "../../../database/models/Tip.js";
import { type UserRequest } from "../../../Types/users/types.js";

export const getTips = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const filterByCareLevel = {
    easyCare: "ideal-for-beginners",
    mediumCare: "best-for-connoisseurs",
    difficultCare: "only-for-experts",
  };

  try {
    let tips;

    if (
      req.query.careLevel === filterByCareLevel.easyCare ||
      req.query.careLevel === filterByCareLevel.mediumCare ||
      req.query.careLevel === filterByCareLevel.difficultCare
    ) {
      tips = await Tip.find({ careLevel: req.query.careLevel }).exec();
    } else {
      tips = await Tip.find().exec();
    }

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

  try {
    const newTip = await Tip.create({
      ...tip,
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

export const getTipById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    const tip = await Tip.findById({
      _id: id,
    }).exec();

    res.status(200).json({ tip });
  } catch {
    const customError = new CustomError(
      "Internal Server Error",
      500,
      "Not possible to find the Tip"
    );

    next(customError);
  }
};
