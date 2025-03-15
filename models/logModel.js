import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: Date,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currentSugar: {
      type: Number,
      required: true,
    },
    predictedSugar: {
      type: Number,
      required: true,
    },
    insolineDosage: {
      type: Number,
    },
    calories: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Log = mongoose.model("Log", logSchema);
export default Log;
