const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    companyName: { type: String, default: "" },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, default: "" },

    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },

    // ✅ new
    status: {
      type: String,
      enum: ["Active", "Completed"],
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);
