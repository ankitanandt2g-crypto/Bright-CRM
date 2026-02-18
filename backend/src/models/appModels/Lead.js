const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true, trim: true },
    contactPerson: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    siteAddress: { type: String, required: true, trim: true },

    projectType: { type: String, required: true, trim: true },
    balustradeType: { type: String, required: true, trim: true },

    leadSource: {
      type: String,
      required: true,
      enum: ["Manual Entry", "Website Enquiries", "Phone Calls", "Referrals"],
      default: "Manual Entry",
    },

    notes: { type: String, trim: true },

    status: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Converted", "Lost"],
      default: "New",
    },
    
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", LeadSchema);





/*const Lead = require("../models/Lead"); // ✅ change if your file name is different

// GET /api/lead/list
exports.listLeads = async (req, res) => {
  try {
    const leads = await Lead.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      result: leads,
      message: "Leads fetched successfully",
    });
  } catch (error) {
    console.error("listLeads error:", error);
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || "Server error",
    });
  }
};

// POST /api/lead/create
exports.createLead = async (req, res) => {
  try {
    const lead = await Lead.create(req.body);

    return res.status(201).json({
      success: true,
      result: lead,
      message: "Lead created successfully",
    });
  } catch (error) {
    console.error("createLead error:", error);
    return res.status(400).json({
      success: false,
      result: null,
      message: error.message || "Invalid data",
    });
  }
};

// PUT /api/lead/update/:id
exports.updateLead = async (req, res) => {
  try {
    const updated = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        result: null,
        message: "Lead not found",
      });
    }

    return res.status(200).json({
      success: true,
      result: updated,
      message: "Lead updated successfully",
    });
  } catch (error) {
    console.error("updateLead error:", error);
    return res.status(400).json({
      success: false,
      result: null,
      message: error.message || "Invalid update data",
    });
  }
};

// DELETE /api/lead/delete/:id
exports.deleteLead = async (req, res) => {
  try {
    const deleted = await Lead.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        result: null,
        message: "Lead not found",
      });
    }

    return res.status(200).json({
      success: true,
      result: deleted,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("deleteLead error:", error);
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || "Server error",
    });
  }
};
*/