import { Router } from "express";
import {
  deleteTipById,
  getMyTips,
  getTips,
} from "../../controllers/tipsControllers/tipsControllers.js";
import { endpoints } from "../endpoints.js";

export const tipsRouter = Router();

tipsRouter.get(endpoints.root, getTips);
tipsRouter.get(endpoints.myTips, getMyTips);
tipsRouter.delete(`${endpoints.delete}${endpoints.id}`, deleteTipById);
