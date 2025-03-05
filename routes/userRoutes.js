import express from "express";
import {
  getUser,
  signIn,
  signupController,
} from "../controllers/userController.js";
import { authMiddleware } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/signup", signupController);
router.post("/signin", signIn);
router.get("/get-user", authMiddleware, getUser);
export default router;
