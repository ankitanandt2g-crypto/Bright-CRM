const Planning = require("@/models/appModels/Planning");

// ✅ GET /api/planning/list?jobId=xxxx
exports.listPlanningTasks = async (req, res) => {
  try {
    const { jobId } = req.query;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        result: null,
        message: "jobId is required",
      });
    }

    const tasks = await Planning.find({ jobId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      result: tasks,
      message: tasks.length ? "Planning tasks fetched" : "Collection is Empty",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || "Server error",
    });
  }
};

// ✅ POST /api/planning/create
exports.createPlanningTask = async (req, res) => {
  try {
    const { jobId, task, start, end, workers, hours, status } = req.body;

    if (!jobId || !task || !start || !end || !workers || !hours) {
      return res.status(400).json({
        success: false,
        result: null,
        message: "Missing required fields",
      });
    }

    const created = await Planning.create({
      jobId,
      task,
      start,
      end,
      workers,
      hours,
      status,
    });

    return res.status(201).json({
      success: true,
      result: created,
      message: "Planning task created",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || "Server error",
    });
  }
};

// ✅ PATCH /api/planning/update/:id
exports.updatePlanningTask = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Planning.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        result: null,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      result: updated,
      message: "Planning task updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || "Server error",
    });
  }
};

// ✅ DELETE /api/planning/delete/:id
exports.deletePlanningTask = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Planning.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        result: null,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      result: deleted,
      message: "Planning task deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || "Server error",
    });
  }
};
