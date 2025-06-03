import express from "express";
import { authMiddleware } from "../middleware/protectRoute.js";
import {
  getDietInsights,
  getInsulinDosageInsights,
  getPaginatedLogs,
  getPredictedSugar,
  getSugarLevelInsights,
} from "../controllers/sugarController.js";

const router = express.Router();

router.post("/predict-sugar", authMiddleware, getPredictedSugar);
router.get("/get-logs", authMiddleware, getPaginatedLogs);
router.get("/get-insulin-insghts", authMiddleware, getInsulinDosageInsights);
router.get("/get-diet-insghts", authMiddleware, getDietInsights);
router.get("/get-sugar-insghts", authMiddleware, getSugarLevelInsights);

export default router;
