import express from "express";
import { authMiddleware } from "../middleware/protectRoute.js";
import { getPredictedSugar } from "../controllers/sugarController.js";

const router = express.Router();

router.post("/predict-sugar", authMiddleware, getPredictedSugar);

export default router;
