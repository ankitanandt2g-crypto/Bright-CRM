const Fabrication = require("@/models/appModels/Fabrication");

// ✅ GET /api/fabrication/list?jobId=xxxx
exports.listFabricationItems = async (req, res) => {
  try {
    const { jobId } = req.query;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        result: null,
        message: "jobId is required",
      });
    }

    const items = await Fabrication.find({ jobId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      result: items,
      message: items.length ? "Fabrication items fetched" : "Collection is Empty",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: null,
      message: err.message || "Server error",
    });
  }
};

// ✅ POST /api/fabrication/create
exports.createFabricationItem = async (req, res) => {
  try {
    const { jobId, itemName, material, qty } = req.body;

    if (!jobId || !itemName || !material || !qty) {
      return res.status(400).json({
        success: false,
        result: null,
        message: "jobId, itemName, material, qty are required",
      });
    }

    const created = await Fabrication.create(req.body);

    return res.status(200).json({
      success: true,
      result: created,
      message: "Fabrication item created",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: null,
      message: err.message || "Server error",
    });
  }
};

// ✅ PATCH /api/fabrication/update/:id
exports.updateFabricationItem = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Fabrication.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        result: null,
        message: "Fabrication item not found",
      });
    }

    return res.status(200).json({
      success: true,
      result: updated,
      message: "Fabrication item updated",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: null,
      message: err.message || "Server error",
    });
  }
};

// ✅ DELETE /api/fabrication/delete/:id
exports.deleteFabricationItem = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Fabrication.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        result: null,
        message: "Fabrication item not found",
      });
    }

    return res.status(200).json({
      success: true,
      result: deleted,
      message: "Fabrication item deleted",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: null,
      message: err.message || "Server error",
    });
  }
};
