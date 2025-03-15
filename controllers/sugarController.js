import { calculateCalories } from "../lib/utils/calculateCalories.js";
import { getTodayDate } from "../lib/utils/getTodayDate.js";
import { predictSugar } from "../lib/utils/predictSugar.js";
import Log from "../models/logModel.js";

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
