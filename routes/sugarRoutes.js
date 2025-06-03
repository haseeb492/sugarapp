import express from "express";
import { authMiddleware } from "../middleware/protectRoute.js";
import {
  getPaginatedLogs,
  getPredictedSugar,
} from "../controllers/sugarController.js";

const router = express.Router();

router.post("/predict-sugar", authMiddleware, getPredictedSugar);
router.get("/get-logs", authMiddleware, getPaginatedLogs);

export default router;
