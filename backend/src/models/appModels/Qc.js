const mongoose = require("mongoose");

const QcSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },

    item: { type: String, required: true },

    checked: { type: Number, default: 0 },
    passed: { type: Number, default: 0 },
    rejected: { type: Number, default: 0 },

    inspector: { type: String, default: "" },
    inspectionDate: { type: String, default: null }, // "YYYY-MM-DD"
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// ✅ avoids OverwriteModelError
module.exports = mongoose.models.Qc || mongoose.model("Qc", QcSchema);
