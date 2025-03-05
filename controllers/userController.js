import { generateAccessToken } from "../lib/utils/generateToken.js";
import { hashPassword } from "../lib/utils/hashPassword.js";
import { isNumber } from "../lib/utils/isNumber.js";
import { validatePassword } from "../lib/utils/validatePassword.js";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";

export const signupController = async (req, res) => {
  try {
    const { username, email, password, age } = req.body;

    if (!username || !email || !password || !age) {
      return res.status(400).json({ error: "Please fill all required fields" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const isEmailExist = await User.findOne({ email });
    if (isEmailExist) {
      return res.status(409).json({ error: "Email already taken" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: "invalid password format" });
    }

    const hashedPassword = await hashPassword(password);

    if (!isNumber(age)) {
      return res.status(400).json({ error: "Age must be a number" });
    }

    const newUser = new User({
      email,
      password: hashedPassword,
      username,
      age,
    });

    const accessToken = generateAccessToken(newUser._id);

    await newUser.save();

    res.status(201).json({
      message: "Sign up successfull",
      user: {
        _id: newUser._id,
        name: newUser.username,
        email: newUser.email,
        accessToken,
      },
    });
  } catch (error) {
    console.log("Error in signupController: ", error.message);
    req.status(500).json({ error: "Internal server error" });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "No user found with that email" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ error: "Invalid email/username or password." });
    }

    const accessToken = generateAccessToken(user._id);

    res.status(200).json({
      message: "Login successfull",
      user: {
        username: user.username,
        email: user.email,
        age: user.age,
        accessToken,
      },
    });
  } catch (error) {
    console.log("Error in signin controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("-password");

    res.status(200).json({ user });
  } catch (error) {
    console.log("Error in getUser controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
