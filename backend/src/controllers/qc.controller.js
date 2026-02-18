const Qc = require("@/models/appModels/Qc");

// ✅ GET /api/qc/list?jobId=xxxx
exports.listQcItems = async (req, res) => {
  try {
    const { jobId } = req.query;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        result: null,
        message: "jobId is required in query",
      });
    }

    const items = await Qc.find({ jobId }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      result: items,
      message: items.length ? "QC items fetched" : "Collection is Empty",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: null,
      message: err.message || "Failed to fetch QC items",
    });
  }
};

// ✅ POST /api/qc/create
exports.createQcItem = async (req, res) => {
  try {
    const { jobId, item, checked, passed, rejected } = req.body;

    if (!jobId || !item) {
      return res.status(400).json({
        success: false,
        result: null,
        message: "jobId and item are required",
      });
    }

    if (Number(checked || 0) !== Number(passed || 0) + Number(rejected || 0)) {
      return res.status(400).json({
        success: false,
        result: null,
        message: "passed + rejected must equal checked",
      });
    }

    const created = await Qc.create(req.body);

    return res.status(201).json({
      success: true,
      result: created,
      message: "QC item created",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: null,
      message: err.message || "Failed to create QC item",
    });
  }
};

// ✅ PATCH /api/qc/update/:id
exports.updateQcItem = async (req, res) => {
  try {
    const { id } = req.params;

    // optional validation if these three exist
    const hasAll =
      req.body.checked !== undefined &&
      req.body.passed !== undefined &&
      req.body.rejected !== undefined;

    if (hasAll) {
      if (Number(req.body.checked) !== Number(req.body.passed) + Number(req.body.rejected)) {
        return res.status(400).json({
          success: false,
          result: null,
          message: "passed + rejected must equal checked",
        });
      }
    }

    const updated = await Qc.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.json({
      success: true,
      result: updated,
      message: "QC item updated",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: null,
      message: err.message || "Failed to update QC item",
    });
  }
};

// ✅ DELETE /api/qc/delete/:id
exports.deleteQcItem = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Qc.findByIdAndDelete(id);

    return res.json({
      success: true,
      result: deleted,
      message: "QC item deleted",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: null,
      message: err.message || "Failed to delete QC item",
    });
  }
};
