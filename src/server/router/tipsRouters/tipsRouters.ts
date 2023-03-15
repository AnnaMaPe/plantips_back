import { Router } from "express";
import {
  getMyTips,
  getTips,
} from "../../controllers/tipControllerss/tipControllers.js";
import { endpoints } from "../endpoints.js";

export const tipsRouter = Router();

tipsRouter.get(endpoints.root, getTips);
tipsRouter.get(endpoints.myTips, getMyTips);
