const mongoose = require("mongoose");

const PlanningSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },

    task: { type: String, required: true, trim: true },

    start: { type: String, required: true }, // "YYYY-MM-DD"
    end: { type: String, required: true },   // "YYYY-MM-DD"

    workers: { type: Number, required: true, min: 1 },
    hours: { type: Number, required: true, min: 1 },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Done"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// ✅ IMPORTANT: prevent OverwriteModelError
module.exports = mongoose.models.Planning || mongoose.model("Planning", PlanningSchema);
