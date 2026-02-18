const mongoose = require("mongoose");

const Lead = mongoose.models.Lead;
const Job = mongoose.models.Job;
const Customer = mongoose.models.Customer;

if (!Lead) throw new Error("Lead model not loaded");
if (!Job) throw new Error("Job model not loaded");
if (!Customer) throw new Error("Customer model not loaded");

// ✅ GET /api/lead/list
exports.listLeads = async (req, res) => {
  try {
    const leads = await Lead.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, result: leads });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ POST /api/lead/create
exports.createLead = async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    return res.json({ success: true, result: lead, message: "Lead created" });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// ✅ PATCH /api/lead/update/:id
exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    return res.json({ success: true, result: lead, message: "Lead updated" });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// ✅ DELETE /api/lead/delete/:id
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    return res.json({ success: true, message: "Lead deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ POST /api/lead/convert-to-job/:id
exports.createJobFromLead = async (req, res) => {
  try {
    const leadId = req.params.id;

    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

    // ✅ If already converted - return existing job
    if (lead.isConverted && lead.convertedToJobId) {
      const existingJob = await Job.findById(lead.convertedToJobId);
      return res.json({
        success: true,
        result: { job: existingJob, customer: null },
        message: "Lead already converted",
      });
    }

    // =========================
    // 1) Create/Find Customer
    // =========================
    const emailLower = String(lead.email || "").toLowerCase().trim();

    let customer =
      (await Customer.findOne({ leadId: lead._id })) ||
      (emailLower ? await Customer.findOne({ email: emailLower }) : null);

    if (!customer) {
      customer = await Customer.create({
        leadId: lead._id,

        // ✅ Lead me clientName hai, wahi customer name banao
        name: lead.clientName || "Customer",

        companyName: lead.companyName || "",
        email: emailLower,
        phone: lead.phone || "",

        // ✅ Customer schema me address nahi hai, so ignore or add field in schema if you want
        // address: lead.siteAddress || "",

        status: "Active",
      });
    }

    // =========================
    // 2) Generate jobId
    // =========================
    const lastJob = await Job.findOne({ jobId: { $exists: true } }).sort({ createdAt: -1 });
    let nextNumber = 1;

    if (lastJob?.jobId) {
      const match = String(lastJob.jobId).match(/(\d+)$/);
      if (match) nextNumber = parseInt(match[1], 10) + 1;
    }

    const jobId = `JOB-${String(nextNumber).padStart(5, "0")}`;

    // =========================
    // 3) Create Job (✅ Job model ke fields only)
    // =========================
    const job = await Job.create({
      jobId,

      // ✅ Job model me customer string hai, so store customer name here
      customer: customer.name || "",

      // ✅ Job model me site string hai
      site: lead.siteAddress || "",

      // ✅ enums only
      stage: "Backlog (Contract Stage)",
      status: "Active", // ✅ allowed: Backlog/Active/On Hold/Closed (tumhare STATUSES ke hisab se)

      leadId: lead._id,
    });

    // =========================
    // 4) Mark lead converted
    // =========================
    lead.status = "Converted";
    lead.isConverted = true;
    lead.convertedToJobId = job._id;
    await lead.save();

    return res.json({
      success: true,
      result: { job, customer },
      message: "Lead converted to Job + Customer created/linked",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
