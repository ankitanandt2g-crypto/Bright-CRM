const mongoose = require("mongoose");

const Quote = mongoose.models.Quote;
const Lead = mongoose.models.Lead;
const Job = mongoose.models.Job;
const Customer = mongoose.models.Customer;

if (!Quote) throw new Error("Quote model not loaded");
if (!Lead) throw new Error("Lead model not loaded");
if (!Job) throw new Error("Job model not loaded");
if (!Customer) throw new Error("Customer model not loaded");

// ✅ helper: generate readable unique jobId (required by Job schema)
const generateJobId = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000); // 4 digit
  return `J-${y}${m}${day}-${rand}`;
};

// ✅ GET /api/quote/list
// ✅ GET /api/quote/list  (Idurar ErpPanel compatible pagination + filter)
exports.listQuotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page || req.query.current || "1", 10);
    const items = parseInt(req.query.items || req.query.pageSize || "10", 10);
    const skip = (page - 1) * items;

    const q = (req.query.q || "").trim();

    // ✅ Idurar table filter params
    const equal = (req.query.equal || "").toString().trim();
    const filterKey = (req.query.filter || "").toString().trim(); // e.g. "quote"

    let filter = {};

    // ✅ 1) If Idurar sends equal/filter, apply it
    if (equal && filterKey) {
      // since quotes don't have "name", we map to our fields
      filter = {
        $or: [
          { quoteNumber: { $regex: equal, $options: "i" } },
          { customerName: { $regex: equal, $options: "i" } },
          { status: { $regex: equal, $options: "i" } },
        ],
      };
    }
    // ✅ 2) Else if q exists, apply q search
    else if (q) {
      filter = {
        $or: [
          { quoteNumber: { $regex: q, $options: "i" } },
          { customerName: { $regex: q, $options: "i" } },
          { status: { $regex: q, $options: "i" } },
        ],
      };
    }

    const [total, result] = await Promise.all([
      Quote.countDocuments(filter),
      Quote.find(filter).sort({ createdAt: -1 }).skip(skip).limit(items),
    ]);

    const pages = Math.ceil(total / items) || 1;

    return res.json({
      success: true,
      result,
      pagination: { page, items, total, pages },
      message: "Quotes fetched",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ GET /api/quote/search?q=...
// AutoCompleteAsync compatible (expects result items having "name")
exports.searchQuotes = async (req, res) => {
  try {
    const q = (req.query.q || req.query.search || "").trim();

    if (!q) {
      return res.json({ success: true, result: [] });
    }

    const filter = {
      $or: [
        { quoteNumber: { $regex: q, $options: "i" } },
        { customerName: { $regex: q, $options: "i" } },
        { status: { $regex: q, $options: "i" } },
      ],
    };

    const result = await Quote.find(filter)
      .sort({ createdAt: -1 })
      .limit(10)
      .select("_id quoteNumber customerName status totalAmount createdAt");

    // ✅ map to { _id, name } because AutoCompleteAsync uses displayLabels={["name"]}
    const formatted = result.map((x) => ({
      _id: x._id,
      name: `${x.quoteNumber || "Q"} - ${x.customerName || ""}`.trim(),
      quoteNumber: x.quoteNumber,
      customerName: x.customerName,
      status: x.status,
    }));

    return res.json({ success: true, result: formatted });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ GET /api/quote/read/:id
exports.readQuote = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ success: false, message: "Quote not found" });
    return res.json({ success: true, result: quote });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ POST /api/quote/create
exports.createQuote = async (req, res) => {
  try {
    const payload = req.body;

    if (!payload.leadId) {
      return res.status(400).json({ success: false, message: "leadId is required" });
    }

    const lead = await Lead.findById(payload.leadId);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    if (!payload.scope || !payload.inclusions || !payload.exclusions) {
      return res.status(400).json({
        success: false,
        message: "scope, inclusions, exclusions are required",
      });
    }

    if (payload.totalAmount === undefined || payload.totalAmount === null) {
      return res.status(400).json({ success: false, message: "totalAmount is required" });
    }

    const quote = await Quote.create({
      leadId: payload.leadId,

      customerName: payload.customerName || lead.clientName,
      contactPerson: payload.contactPerson || lead.contactPerson || "",
      phone: payload.phone || lead.phone,
      email: payload.email || lead.email || "",

      siteAddress: payload.siteAddress || lead.siteAddress,
      projectType: payload.projectType || lead.projectType,
      balustradeType: payload.balustradeType || lead.balustradeType,
      leadSource: payload.leadSource || lead.leadSource || "",

      scope: payload.scope,
      inclusions: payload.inclusions,
      exclusions: payload.exclusions,
      assumptions: payload.assumptions || "",

      materialCost: Number(payload.materialCost || 0),
      laborCost: Number(payload.laborCost || 0),
      installCost: Number(payload.installCost || 0),
      totalAmount: Number(payload.totalAmount),

      expectedDraftHours: Number(payload.expectedDraftHours || 0),
      expectedFabHours: Number(payload.expectedFabHours || 0),
      expectedInstallHours: Number(payload.expectedInstallHours || 0),
      crewSize: Number(payload.crewSize || 1),

      status: payload.status || "Draft",
    });

    await Lead.findByIdAndUpdate(payload.leadId, { status: "Quoted" }, { new: true });

    return res.json({ success: true, result: quote, message: "Quote created" });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// ✅ PATCH /api/quote/update/:id
exports.updateQuote = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ success: false, message: "Quote not found" });

    if (quote.status === "Converted to Job") {
      return res.status(400).json({ success: false, message: "Quote already converted to job" });
    }

    const updated = await Quote.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.json({ success: true, result: updated, message: "Quote updated" });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// ✅ DELETE /api/quote/delete/:id
exports.deleteQuote = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ success: false, message: "Quote not found" });

    if (quote.status === "Converted to Job") {
      return res.status(400).json({ success: false, message: "Converted quote cannot be deleted" });
    }

    await Quote.findByIdAndDelete(req.params.id);
    return res.json({ success: true, result: null, message: "Quote deleted" });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// ✅ POST /api/quote/approve/:id
// Approve => create/find Customer (CRM customer record) => create Job with schema fields (customer/site) => update Quote + Lead
exports.approveQuoteAndCreateJob = async (req, res) => {
  try {
    const quoteId = req.params.id;

    const quote = await Quote.findById(quoteId);
    if (!quote) return res.status(404).json({ success: false, message: "Quote not found" });

    // already converted
    if (quote.status === "Converted to Job" || quote.jobId) {
      return res.json({
        success: true,
        result: { jobId: quote.jobId, customerId: quote.customerId },
        message: "Quote already converted",
      });
    }

    // 1) Create / find customer record (separate collection)
    let customer = null;

    if (quote.email) customer = await Customer.findOne({ email: quote.email });
    if (!customer && quote.phone) customer = await Customer.findOne({ phone: quote.phone });

    if (!customer) {
      customer = await Customer.create({
        name: quote.customerName,
        phone: quote.phone,
        email: quote.email,
        address: quote.siteAddress,
        contactPerson: quote.contactPerson,
      });
    }

    // 2) Generate required jobId (unique)
    let jobCode = generateJobId();
    let exists = await Job.findOne({ jobId: jobCode });
    while (exists) {
      jobCode = generateJobId();
      exists = await Job.findOne({ jobId: jobCode });
    }

    // 3) Create Job according to your Job schema
    const job = await Job.create({
      jobId: jobCode, // ✅ required

      // ✅ These are the correct field names in Job.js
      customer: quote.customerName || customer?.name || "",
      site: quote.siteAddress || customer?.address || "",

      // ✅ keep lead reference
      leadId: quote.leadId || null,

      // stage + status defaults are already in schema,
      // but we can keep status explicitly
      status: "Backlog",
    });

    // 4) Update Quote (mark converted)
    quote.status = "Converted to Job";
    quote.approvedAt = new Date();
    quote.customerId = customer._id;
    quote.jobId = job._id; // store created job _id
    await quote.save();

    // 5) Update Lead
    await Lead.findByIdAndUpdate(quote.leadId, { status: "Converted" }, { new: true });

    return res.json({
      success: true,
      result: {
        jobId: job._id,
        jobCode, // ✅ jobId string
        customerId: customer._id,
        quoteId: quote._id,
      },
      message: "Quote approved. Job created.",
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// ✅ GET /api/quote/download/:id (PDF)
exports.downloadQuotePdf = async (req, res) => {
  try {
    const PDFDocument = require("pdfkit");
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({ success: false, message: "Quote not found" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Quote-${quote.quoteNumber || quote._id}.pdf`
    );

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    doc.pipe(res);

    doc.fontSize(18).text("Bright Balustrading", { align: "left" });
    doc.fontSize(10).fillColor("#555").text("Quote Document", { align: "left" });
    doc.moveDown(1);

    doc.fillColor("#000");
    doc.fontSize(12).text(`Quote No: ${quote.quoteNumber || "-"}`);
    doc.text(`Date: ${new Date(quote.createdAt).toLocaleDateString()}`);
    doc.text(`Status: ${quote.status || "Draft"}`);
    doc.moveDown(1);

    doc.fontSize(12).text("Client Details", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Client Name: ${quote.customerName || "-"}`);
    doc.text(`Contact Person: ${quote.contactPerson || "-"}`);
    doc.text(`Phone: ${quote.phone || "-"}`);
    doc.text(`Email: ${quote.email || "-"}`);
    doc.moveDown(1);

    doc.fontSize(12).text("Project Details", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Site Address: ${quote.siteAddress || "-"}`);
    doc.text(`Project Type: ${quote.projectType || "-"}`);
    doc.text(`Balustrade Type: ${quote.balustradeType || "-"}`);
    doc.text(`Lead Source: ${quote.leadSource || "-"}`);
    doc.moveDown(1);

    doc.fontSize(12).text("Scope", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).text(quote.scope || "-", { width: 515 });
    doc.moveDown(1);

    doc.fontSize(12).text("Inclusions", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).text(quote.inclusions || "-", { width: 515 });
    doc.moveDown(1);

    doc.fontSize(12).text("Exclusions", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).text(quote.exclusions || "-", { width: 515 });
    doc.moveDown(1);

    if (quote.assumptions) {
      doc.fontSize(12).text("Assumptions", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).text(quote.assumptions, { width: 515 });
      doc.moveDown(1);
    }

    doc.fontSize(12).text("Cost Summary", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Material Cost: ${quote.materialCost ?? 0}`);
    doc.text(`Labor Cost: ${quote.laborCost ?? 0}`);
    doc.text(`Install Cost: ${quote.installCost ?? 0}`);
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Total: ${quote.totalAmount ?? 0}`, { align: "right" });

    doc.moveDown(2);
    doc.fontSize(9).fillColor("#777").text(
      "Note: This quote is subject to final site verification and standard terms & conditions.",
      { width: 515 }
    );

    doc.end();
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};