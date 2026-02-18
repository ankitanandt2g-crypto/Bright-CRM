const mongoose = require("mongoose");

const KanbanTaskSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },

    status: {
      type: String,
      enum: ["Backlog", "Active", "On Hold", "Closed"],
      default: "Backlog",
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("KanbanTask", KanbanTaskSchema);
