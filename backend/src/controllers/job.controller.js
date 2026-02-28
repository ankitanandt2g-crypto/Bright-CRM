const Job = require("../models/appModels/Job");
const Lead = require("../models/appModels/Lead");

// ✅ GET /api/job/list
exports.listJobs = async (req, res) => {
  try {
    const jobs = await Job.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, result: jobs, message: "Jobs fetched" });
  } catch (e) {
    return res.status(500).json({ success: false, result: null, message: e.message });
  }
};

// ✅ GET /api/job/read/:id  (NEW)
exports.readJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, result: null, message: "Job not found" });
    }

    return res.status(200).json({ success: true, result: job, message: "Job fetched" });
  } catch (e) {
    return res.status(500).json({ success: false, result: null, message: e.message });
  }
};

// ✅ POST /api/job/create
exports.createJob = async (req, res) => {
  try {
    const created = await Job.create(req.body);
    return res.status(201).json({ success: true, result: created, message: "Job created" });
  } catch (e) {
    return res.status(400).json({ success: false, result: null, message: e.message });
  }
};

// ✅ DELETE /api/job/delete/:id
exports.deleteJob = async (req, res) => {
  try {
    const deleted = await Job.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, result: null, message: "Job not found" });
    }

    return res.status(200).json({ success: true, result: deleted, message: "Job deleted" });
  } catch (e) {
    return res.status(500).json({ success: false, result: null, message: e.message });
  }
};

// ✅ POST /api/job/from-lead/:leadId  (Lead -> Job)
exports.createJobFromLead = async (req, res) => {
  try {
    const leadId = req.params.leadId;

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ success: false, result: null, message: "Lead not found" });
    }

    // ✅ prevent duplicate job for same lead
    const existing = await Job.findOne({ leadId });
    if (existing) {
      return res.status(200).json({
        success: true,
        result: existing,
        message: "Job already created for this lead",
      });
    }

    // generate Job ID (simple)
    const jobId = `JOB-${Date.now()}`;

    const job = await Job.create({
      jobId,
      customer: lead.clientName,
      site: lead.siteAddress,
      stage: "Backlog (Contract Stage)",
      status: "Backlog",
      leadId: lead._id,
    });

    // ✅ optionally update lead status to Converted
    await Lead.findByIdAndUpdate(leadId, { status: "Converted" });

    return res.status(201).json({
      success: true,
      result: job,
      message: "Lead converted to Job",
    });
  } catch (e) {
    return res.status(500).json({ success: false, result: null, message: e.message });
  }
};

// ✅ PATCH /api/job/update/:id
exports.updateJob = async (req, res) => {
  try {
    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ success: false, result: null, message: "Job not found" });
    }

    return res.status(200).json({ success: true, result: updated, message: "Job updated" });
  } catch (e) {
    return res.status(400).json({ success: false, result: null, message: e.message });
  }
};