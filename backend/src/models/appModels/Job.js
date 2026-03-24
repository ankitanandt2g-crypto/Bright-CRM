const mongoose = require("mongoose");

const STAGES = [
  "Backlog",
  "Site Measurement",
  "Planning Lock",
  "Drafting",
  "Job Scheduling",
  "Material Purchase",
  "Fabrication",
  "Quality Control",
  "Installation",
  "Closure",
];

const STATUSES = ["Backlog", "Active", "On Hold", "Completed"];

const IFC_STATUSES = ["Pending", "Approved", "Rejected"];

const JobSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    customer: {
      type: String,
      default: "",
      trim: true,
    },

    site: {
      type: String,
      default: "",
      trim: true,
    },

    stage: {
      type: String,
      enum: STAGES,
      default: "Backlog",
    },

    status: {
      type: String,
      enum: STATUSES,
      default: "Backlog",
    },

    // ===== IFC / Drafting Approval Fields =====
    ifcApproved: {
      type: Boolean,
      default: false,
    },

    ifcStatus: {
      type: String,
      enum: IFC_STATUSES,
      default: "Pending",
    },

    ifcApprovedAt: {
      type: Date,
      default: null,
    },

    ifcApprovedBy: {
      type: String,
      default: "",
      trim: true,
    },

    draftingCompleted: {
      type: Boolean,
      default: false,
    },

    fabricationSignOff: {
      type: Boolean,
      default: false,
    },

    // ===== Linked References =====
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
    },

    quoteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quote",
      default: null,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Job || mongoose.model("Job", JobSchema);