import { Router } from "express";
import {
  createTip,
  deleteTipById,
  getMyTips,
  getTipById,
  getTips,
} from "../../controllers/tipsControllers/tipsControllers.js";
import { endpoints } from "../endpoints.js";

export const tipsRouter = Router();

tipsRouter.get(endpoints.root, getTips);
tipsRouter.get(endpoints.myTips, getMyTips);
tipsRouter.delete(`${endpoints.delete}${endpoints.id}`, deleteTipById);
tipsRouter.post(`${endpoints.create}`, createTip);
tipsRouter.get(`${endpoints.id}`, getTipById);
