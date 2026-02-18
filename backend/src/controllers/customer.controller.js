const mongoose = require("mongoose");

// ✅ Idurar loads models via glob, so use already registered model
const Customer = mongoose.models.Customer;

if (!Customer) {
  throw new Error(
    "Customer model not loaded. Ensure backend loads models before controllers (globSync in server.js)."
  );
}

// ================= LIST =================
exports.list = async (req, res) => {
  try {
    const result = await Customer.find().sort({ createdAt: -1 });
    return res.json({ success: true, result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ================= CREATE =================
exports.create = async (req, res) => {
  try {
    const payload = req.body || {};

    if (!payload.name || !payload.companyName || !payload.email) {
      return res.status(400).json({
        success: false,
        message: "name, companyName, email are required",
      });
    }

    payload.email = String(payload.email).toLowerCase().trim();

    const exists = await Customer.findOne({ email: payload.email });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Customer already exists with this email",
      });
    }

    const result = await Customer.create(payload);

    return res.json({
      success: true,
      result,
      message: "Customer created successfully",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ================= UPDATE =================
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body || {};

    if (payload.email) payload.email = String(payload.email).toLowerCase().trim();

    const result = await Customer.findByIdAndUpdate(id, payload, { new: true });

    return res.json({
      success: true,
      result,
      message: "Customer updated successfully",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ================= DELETE =================
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    await Customer.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
