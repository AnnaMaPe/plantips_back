import { Router } from "express";
import { getTips } from "../../controllers/tipControllerss/tipControllers.js";
import { endpoints } from "../endpoints.js";

export const tipsRouter = Router();

tipsRouter.get(endpoints.home, getTips);
