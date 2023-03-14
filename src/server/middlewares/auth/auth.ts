import { type NextFunction, type Response } from "express";
import { type UserRequest } from "../../../Types/users/types";
import jwt from "jsonwebtoken";
import { type CustomJwtPayload } from "../../controllers/types";
import { CustomError } from "../../../CustomError/CustomError";

const auth = (req: UserRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    if (!authHeader?.includes("Bearer")) {
      throw new Error("Missing bearer in authorization header");
    }

    const token = authHeader.replace(/^Bearer\s*/, "");

    const { sub: sharedBy } = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as CustomJwtPayload;

    req.sharedBy = sharedBy;

    next();
  } catch (error: unknown) {
    const customError = new CustomError(
      (error as Error).message,
      401,
      "Invalid token"
    );
    next(customError);
  }
};
