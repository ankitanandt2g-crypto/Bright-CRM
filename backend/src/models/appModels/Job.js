const mongoose = require("mongoose");

const STAGES = [
  "Backlog (Contract Stage)",
  "Site Measurement",
  "Planning Lock",
  "Drafting",
  "Fabrication",
  "Quality Control",
  "Installation",
  "Closure",
];

const STATUSES = ["Backlog", "Active", "On Hold", "Closed"];

const JobSchema = new mongoose.Schema(
  {
    jobId: { type: String, required: true },
    customer: { type: String, default: "" },
    site: { type: String, default: "" },

    stage: { type: String, enum: STAGES, default: "Backlog (Contract Stage)" },
    status: { type: String, enum: STATUSES, default: "Backlog" },

    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", default: null },
  },
  { timestamps: true }
);

// ✅ prevent OverwriteModelError
module.exports = mongoose.models.Job || mongoose.model("Job", JobSchema);
