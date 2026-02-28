const mongoose = require("mongoose");

const QuoteSchema = new mongoose.Schema(
  {
    quoteNumber: { type: String, unique: true, index: true },

    // linkages
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", default: null },

    // customer snapshot (from lead)
    customerName: { type: String, required: true },
    contactPerson: { type: String, default: "" },
    phone: { type: String, required: true },
    email: { type: String, default: "" },

    // project/site
    siteAddress: { type: String, required: true },
    projectType: { type: String, required: true },
    balustradeType: { type: String, required: true },
    leadSource: { type: String, default: "" },

    // scope (PPT/SOW mandatory)
    scope: { type: String, required: true },
    inclusions: { type: String, required: true },
    exclusions: { type: String, required: true },
    assumptions: { type: String, default: "" },

    // estimation
    materialCost: { type: Number, default: 0 },
    laborCost: { type: Number, default: 0 },
    installCost: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    // planning estimates
    expectedDraftHours: { type: Number, default: 0 },
    expectedFabHours: { type: Number, default: 0 },
    expectedInstallHours: { type: Number, default: 0 },
    crewSize: { type: Number, default: 1 },

    status: {
      type: String,
      enum: ["Draft", "Sent", "Client Viewed", "Approved", "Rejected", "Expired", "Converted to Job"],
      default: "Draft",
    },

    approvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// auto quote number
QuoteSchema.pre("save", function (next) {
  if (!this.quoteNumber) {
    const dt = new Date();
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const d = String(dt.getDate()).padStart(2, "0");
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.quoteNumber = `Q-${y}${m}${d}-${rand}`;
  }
  next();
});

module.exports = mongoose.models.Quote || mongoose.model("Quote", QuoteSchema);