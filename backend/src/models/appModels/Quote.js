const mongoose = require("mongoose");

const QuoteSchema = new mongoose.Schema(
  {
    quoteNumber: { type: String, unique: true, index: true },

    // linkages
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      default: null,
    },

    // customer snapshot (from lead)
    customerName: { type: String, required: true, trim: true },
    contactPerson: { type: String, default: "", trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true },

    // project/site
    siteAddress: { type: String, required: true, trim: true },
    projectType: { type: String, required: true, trim: true },
    balustradeType: { type: String, required: true, trim: true },
    leadSource: { type: String, default: "", trim: true },

    // scope (mandatory as per workflow)
    scope: { type: String, required: true, trim: true },
    inclusions: { type: String, required: true, trim: true },
    exclusions: { type: String, required: true, trim: true },
    assumptions: { type: String, default: "", trim: true },

    // quote details
    totalAmount: { type: Number, required: true, min: 0 },
    validUntil: { type: Date, required: true },

    status: {
      type: String,
      enum: [
        "Draft",
        "Sent",
        "Client Viewed",
        "Approved",
        "Rejected",
        "Expired",
        "Converted to Job",
      ],
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

  // auto set approvedAt when quote becomes approved
  if (this.isModified("status")) {
    if (this.status === "Approved" && !this.approvedAt) {
      this.approvedAt = new Date();
    }

    if (this.status !== "Approved") {
      this.approvedAt = null;
    }
  }

  next();
});

module.exports =
  mongoose.models.Quote || mongoose.model("Quote", QuoteSchema);