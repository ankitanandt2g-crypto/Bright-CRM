const mongoose = require("mongoose");

const FabricationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },

    itemName: { type: String, required: true, trim: true },
    material: {
      type: String,
      required: true,
      enum: ["Glass", "Stainless Steel", "Aluminium", "Wood", "Other"],
      default: "Other",
    },
    qty: { type: Number, required: true, min: 1, default: 1 },

    dueDate: { type: String, default: null }, // "YYYY-MM-DD" (simple string like your frontend)
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Blocked", "Done"],
      default: "Pending",
    },
    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

// ✅ prevent OverwriteModelError
module.exports =
  mongoose.models.Fabrication || mongoose.model("Fabrication", FabricationSchema);
