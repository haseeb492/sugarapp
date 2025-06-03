import { calculateCalories } from "../lib/utils/calculateCalories.js";
import { getTodayDate } from "../lib/utils/getTodayDate.js";
import { isValidDate } from "../lib/utils/isValidDate.js";
import { predictSugar } from "../lib/utils/predictSugar.js";
import Log from "../models/logModel.js";
import User from "../models/userModel.js";

export const getPredictedSugar = async (req, res) => {
  try {
    const userId = req.user._id;
    const { foodInput, currentSugar, insulineDosage } = req.body;

    if (!foodInput || !currentSugar) {
      return res.status(400).json({ error: "Please fill all required fields" });
    }

    const calorieData = await calculateCalories(foodInput);

    let totalCalories = 0;
    for (const item of calorieData.items) {
      totalCalories += item.calories;
    }

    console.log(totalCalories);
    const predictedSugar = await predictSugar(
      totalCalories,
      currentSugar,
      insulineDosage
    );
    const currentTime = new Date();
    const today = getTodayDate();

    const newLog = new Log({
      time: currentTime,
      date: today,
      user: userId,
      currentSugar,
      predictedSugar,
      insolineDosage: insulineDosage ? insulineDosage : 0,
      calories: totalCalories,
      meal: foodInput,
    });

    await newLog.save();

    return res.status(200).json({
      predictedSugar,
      calorieData,
      currentSugar,
      newLog,
    });
  } catch (error) {
    console.log("Error in predictSugar controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPaginatedLogs = async (req, res) => {
  try {
    const { from, to, page = 1, offset = 10 } = req.query;
    const userId = req.user._id;

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(offset, 10);

    if (
      isNaN(pageNumber) ||
      isNaN(pageSize) ||
      pageNumber < 1 ||
      pageSize < 1
    ) {
      return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    console.log(from);
    console.log(to);
    if (!from || !to) {
      return res.status(400).json({ message: "From and to date is required" });
    }

    if (!isValidDate(from) || !isValidDate(to)) {
      return res.status(400).json({ error: "Invalid Date format" });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (fromDate > toDate) {
      return res
        .status(400)
        .json({ error: "'from' date cannot be after 'to' date." });
    }

    const skip = (pageNumber - 1) * pageSize;

    const query = {
      user: userId,
      date: {
        $gte: fromDate,
        $lte: toDate,
      },
    };

    const totalCount = await Log.countDocuments(query);

    const logs = await Log.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(pageSize);

    res.status(200).json({
      message: "Logs retrieved successfully",
      data: logs,
      totalRecords: totalCount,
      currentPage: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    });
  } catch (error) {
    console.log("Error in getPaginatedLogs controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getInsulinDosageInsights = async (req, res) => {
  try {
    const { to, from } = req.query;
    const userId = req.user._id;

    if (!to || !from) {
      return res.status(400).json({ error: "To and from date is required" });
    }

    if (!isValidDate(to) || !isValidDate(from)) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const fromDate = new Date(from);
    fromDate.setUTCHours(0, 0, 0, 0);
    const toDate = new Date(to);
    toDate.setUTCHours(23, 59, 59, 999);

    const insights = await Log.find({
      user: userId,
      time: {
        $gte: fromDate,
        $lte: toDate,
      },
      insolineDosage: { $gt: 0 },
    })
      .select("insolineDosage _id time")
      .sort({ time: -1 });

    console.log(toDate);
    console.log(fromDate);

    if (insights.length === 0) {
      return res.status(204).json([]);
    }

    return res.status(200).json(insights);
  } catch (error) {
    console.log(
      "Error in getInsulinDosageInsights controller: ",
      error.message
    );
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDietInsights = async (req, res) => {
  try {
    const { to, from } = req.query;
    const userId = req.user._id;

    if (!to || !from) {
      return res.status(400).json({ error: "To and from date is required" });
    }

    if (!isValidDate(to) || !isValidDate(from)) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const fromDate = new Date(from);
    fromDate.setUTCHours(0, 0, 0, 0);
    const toDate = new Date(to);
    toDate.setUTCHours(23, 59, 59, 999);

    const insights = await Log.find({
      user: userId,
      time: {
        $gte: fromDate,
        $lte: toDate,
      },
    })
      .select("calories _id time meal")
      .sort({ time: -1 });

    console.log(toDate);
    console.log(fromDate);

    if (insights.length === 0) {
      return res.status(204).json([]);
    }

    return res.status(200).json(insights);
  } catch (error) {
    console.log("Error in getDietInsights controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSugarLevelInsights = async (req, res) => {
  try {
    const { to, from } = req.query;
    const userId = req.user._id;

    if (!to || !from) {
      return res.status(400).json({ error: "To and from date is required" });
    }

    if (!isValidDate(to) || !isValidDate(from)) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const fromDate = new Date(from);
    fromDate.setUTCHours(0, 0, 0, 0);
    const toDate = new Date(to);
    toDate.setUTCHours(23, 59, 59, 999);

    const insights = await Log.find({
      user: userId,
      time: {
        $gte: fromDate,
        $lte: toDate,
      },
    })
      .select("currentSugar predictedSugar _id time meal")
      .sort({ time: -1 });

    console.log(toDate);
    console.log(fromDate);

    if (insights.length === 0) {
      return res.status(204).json([]);
    }

    return res.status(200).json(insights);
  } catch (error) {
    console.log("Error in getSugarLevelInsights controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
