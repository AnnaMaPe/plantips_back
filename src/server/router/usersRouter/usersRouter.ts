import { Router } from "express";
import {
  loginUser,
  registerUser,
} from "../../controllers/userControllers/userControllers.js";
import { endpoints } from "../endpoints.js";

export const usersRouter = Router();

usersRouter.post(endpoints.login, loginUser);

usersRouter.post(endpoints.register, registerUser);
