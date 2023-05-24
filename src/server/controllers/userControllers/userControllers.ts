import "../../../loadEnvironment.js";
import { type Response, type Request, type NextFunction } from "express";
import bcryptjs from "bcryptjs";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { CustomError } from "../../../CustomError/CustomError.js";
import {
  type RegisterUserCredentials,
  type UserCredentials,
} from "../../../Types/users/types";
import { User } from "../../../database/models/User.js";

export const loginUser = async (
  req: Request<
    Record<string, unknown>,
    Record<string, unknown>,
    UserCredentials
  >,
  res: Response,
  next: NextFunction
) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username }).exec();

    if (!user) {
      const error = new CustomError("User not found", 401, "Wrong credentials");
      throw error;
    }

    const passwordComparer = await bcryptjs.compare(password, user.password);

    if (!passwordComparer) {
      const error = new CustomError("Wrong password", 401, "Wrong credentials");
      throw error;
    }

    const jwtPayload: JwtPayload = {
      username: user.username,
      sub: user._id.toString(),
    };

    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET!, {
      expiresIn: "2d",
    });

    res.status(200).json({ token });
  } catch (error: unknown) {
    next(error);
  }
};

export const registerUserController = async (
  req: Request<
    Record<string, unknown>,
    Record<string, unknown>,
    RegisterUserCredentials
  >,
  res: Response,
  next: NextFunction
) => {
  const { username, password, email } = req.body;

  try {
    const hashedPassword = await bcryptjs.hash(password, 8);

    await User.create({
      username,
      password: hashedPassword,
      email,
    });

    res.status(201).json({ message: "User was successfully registered" });
  } catch (error: unknown) {
    const customError = new CustomError(
      (error as Error).message,
      500,
      "User was not created"
    );

    next(customError);
  }
};
