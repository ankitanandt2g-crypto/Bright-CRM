const Job = require("../models/appModels/Job");
const Lead = require("../models/appModels/Lead");

const generateJobId = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `J-${y}${m}${day}-${rand}`;
};

// GET /api/job/list
exports.listJobs = async (req, res) => {
  try {
    const jobs = await Job.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      result: jobs,
      message: "Jobs fetched",
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      result: null,
      message: e.message,
    });
  }
};

// GET /api/job/read/:id
exports.readJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        result: null,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      result: job,
      message: "Job fetched",
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      result: null,
      message: e.message,
    });
  }
};

// POST /api/job/create
exports.createJob = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      jobId: req.body.jobId || generateJobId(),
      stage: req.body.stage || "Backlog",
      status: req.body.status || "Backlog",
    };

    const created = await Job.create(payload);

    return res.status(201).json({
      success: true,
      result: created,
      message: "Job created",
    });
  } catch (e) {
    return res.status(400).json({
      success: false,
      result: null,
      message: e.message,
    });
  }
};

// DELETE /api/job/delete/:id
exports.deleteJob = async (req, res) => {
  try {
    const deleted = await Job.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        result: null,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      result: deleted,
      message: "Job deleted",
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      result: null,
      message: e.message,
    });
  }
};

// PATCH /api/job/update/:id
exports.updateJob = async (req, res) => {
  try {
    const updated = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        result: null,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      result: updated,
      message: "Job updated",
    });
  } catch (e) {
    return res.status(400).json({
      success: false,
      result: null,
      message: e.message,
    });
  }
};

// POST /api/job/from-lead/:leadId
exports.createJobFromLead = async (req, res) => {
  try {
    const leadId = req.params.leadId;

    const lead = await Lead.findById(leadId);

    if (!lead) {
      return res.status(404).json({
        success: false,
        result: null,
        message: "Lead not found",
      });
    }

    const existing = await Job.findOne({ leadId });

    if (existing) {
      return res.status(200).json({
        success: true,
        result: existing,
        message: "Job already exists for this lead",
      });
    }

    const job = await Job.create({
      jobId: generateJobId(),
      customer: lead.clientName,
      site: lead.siteAddress,
      stage: "Backlog",
      status: "Backlog",
      leadId: lead._id,
    });

    await Lead.findByIdAndUpdate(leadId, { status: "Converted" });

    return res.status(201).json({
      success: true,
      result: job,
      message: "Lead converted to Job",
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      result: null,
      message: e.message,
    });
  }
};