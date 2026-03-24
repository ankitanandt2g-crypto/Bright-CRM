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
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `J-${y}${m}${day}-${rand}`;
};

// ✅ GET /api/quote/list
exports.listQuotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page || req.query.current || "1", 10);
    const items = parseInt(req.query.items || req.query.pageSize || "10", 10);
    const skip = (page - 1) * items;

    const q = (req.query.q || "").trim();
    const equal = (req.query.equal || "").toString().trim();
    const filterKey = (req.query.filter || "").toString().trim();

    let filter = {};

    if (equal && filterKey) {
      filter = {
        $or: [
          { quoteNumber: { $regex: equal, $options: "i" } },
          { customerName: { $regex: equal, $options: "i" } },
          { status: { $regex: equal, $options: "i" } },
        ],
      };
    } else if (q) {
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
      .select("_id quoteNumber customerName status totalAmount validUntil createdAt");

    const formatted = result.map((x) => ({
      _id: x._id,
      name: `${x.quoteNumber || "Q"} - ${x.customerName || ""}`.trim(),
      quoteNumber: x.quoteNumber,
      customerName: x.customerName,
      status: x.status,
      totalAmount: x.totalAmount,
      validUntil: x.validUntil,
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
    if (!quote) {
      return res.status(404).json({ success: false, message: "Quote not found" });
    }
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

    if (
      payload.totalAmount === undefined ||
      payload.totalAmount === null ||
      payload.totalAmount === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "totalAmount is required",
      });
    }

    if (!payload.validUntil) {
      return res.status(400).json({
        success: false,
        message: "validUntil is required",
      });
    }

    const quote = await Quote.create({
      leadId: payload.leadId,

      customerName: payload.customerName || lead.clientName || "",
      contactPerson: payload.contactPerson || lead.contactPerson || "",
      phone: payload.phone || lead.phone || "",
      email: payload.email || lead.email || "",

      siteAddress: payload.siteAddress || lead.siteAddress || "",
      projectType: payload.projectType || lead.projectType || "",
      balustradeType: payload.balustradeType || lead.balustradeType || "",
      leadSource: payload.leadSource || lead.leadSource || "",

      scope: payload.scope,
      inclusions: payload.inclusions,
      exclusions: payload.exclusions,
      assumptions: payload.assumptions || "",

      totalAmount: Number(payload.totalAmount),
      validUntil: new Date(payload.validUntil),

      status: payload.status || "Draft",
    });

    await Lead.findByIdAndUpdate(
      payload.leadId,
      { status: "Quoted" },
      { new: true }
    );

    return res.json({
      success: true,
      result: quote,
      message: "Quote created",
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// ✅ PATCH /api/quote/update/:id
exports.updateQuote = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ success: false, message: "Quote not found" });
    }

    if (quote.status === "Converted to Job") {
      return res.status(400).json({
        success: false,
        message: "Quote already converted to job",
      });
    }

    const payload = { ...req.body };

    if (payload.totalAmount !== undefined) {
      payload.totalAmount = Number(payload.totalAmount);
    }

    if (payload.validUntil) {
      payload.validUntil = new Date(payload.validUntil);
    }

    const updated = await Quote.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    return res.json({
      success: true,
      result: updated,
      message: "Quote updated",
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// ✅ DELETE /api/quote/delete/:id
exports.deleteQuote = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ success: false, message: "Quote not found" });
    }

    if (quote.status === "Converted to Job") {
      return res.status(400).json({
        success: false,
        message: "Converted quote cannot be deleted",
      });
    }

    await Quote.findByIdAndDelete(req.params.id);
    return res.json({ success: true, result: null, message: "Quote deleted" });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// ✅ POST /api/quote/approve/:id
exports.approveQuoteAndCreateJob = async (req, res) => {
  try {
    const quoteId = req.params.id;

    const quote = await Quote.findById(quoteId);
    if (!quote) {
      return res.status(404).json({ success: false, message: "Quote not found" });
    }

    if (quote.status === "Converted to Job" || quote.jobId) {
      return res.json({
        success: true,
        result: { jobId: quote.jobId, customerId: quote.customerId },
        message: "Quote already converted",
      });
    }

    let customer = null;

    if (quote.email) customer = await Customer.findOne({ email: quote.email });
    if (!customer && quote.phone) {
      customer = await Customer.findOne({ phone: quote.phone });
    }

    if (!customer) {
      customer = await Customer.create({
        name: quote.customerName,
        phone: quote.phone,
        email: quote.email,
        address: quote.siteAddress,
        contactPerson: quote.contactPerson,
      });
    }

    let jobCode = generateJobId();
    let exists = await Job.findOne({ jobId: jobCode });

    while (exists) {
      jobCode = generateJobId();
      exists = await Job.findOne({ jobId: jobCode });
    }

    const job = await Job.create({
      jobId: jobCode,
      customer: quote.customerName || customer?.name || "",
      site: quote.siteAddress || customer?.address || "",
      leadId: quote.leadId || null,
      status: "Backlog",
    });

    quote.status = "Converted to Job";
    quote.approvedAt = new Date();
    quote.customerId = customer._id;
    quote.jobId = job._id;
    await quote.save();

    await Lead.findByIdAndUpdate(
      quote.leadId,
      { status: "Converted" },
      { new: true }
    );

    return res.json({
      success: true,
      result: {
        jobId: job._id,
        jobCode,
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
    doc.text(
      `Valid Until: ${
        quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : "-"
      }`
    );
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

    doc.fontSize(12).text("Quote Summary", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Total Quote Value: ${quote.totalAmount ?? 0}`, {
      align: "right",
    });

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