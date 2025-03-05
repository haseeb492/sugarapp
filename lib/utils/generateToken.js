import jwt from "jsonwebtoken";

export const generateAccessToken = (userId) => {
  try {
    const payload = {
      userId,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    return token;
  } catch (error) {
    console.error("Error generating access token:", error);
    throw new Error("TokenGenerationError");
  }
};
