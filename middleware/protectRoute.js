import User from "../models/userModel.js";
import { verifyToken } from "../lib/utils/verifyToken.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const bearerHeader = req.headers["authorization"];
    if (!bearerHeader || !bearerHeader.startsWith("bearer")) {
      return res.status(401).json({ error: "Missing Token" });
    }

    const accessToken = bearerHeader.split(" ")[1];
    if (!accessToken) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decodedAccessToken = verifyToken(accessToken);

    if (!decodedAccessToken) {
      return res.status(400).json({ error: "Invalid Token" });
    }
    const userId = decodedAccessToken.userId;

    // Check if user exists
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ error: "User not found or invalid token" });
    }

    if (!user.accessTokenStatus) {
      return res.status(401).json({ error: "Token has expired" });
    }

    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };
    req.accessToken = accessToken;
    next();
  } catch (error) {
    console.error("Error in authMiddleware:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
