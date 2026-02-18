const KanbanTask = require("../models/appModels/KanbanTask");

// GET /api/kanban/list/:jobId
exports.listByJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const tasks = await KanbanTask.find({ jobId }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      result: tasks,
      message: tasks.length ? "Tasks fetched" : "No tasks found",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: null,
      message: err.message,
    });
  }
};

// POST /api/kanban/create
exports.create = async (req, res) => {
  try {
    const { jobId, title, description, status } = req.body;

    if (!jobId || !title) {
      return res.status(400).json({
        success: false,
        result: null,
        message: "jobId and title are required",
      });
    }

    const created = await KanbanTask.create({
      jobId,
      title,
      description: description || "",
      status: status || "Backlog",
    });

    return res.status(201).json({
      success: true,
      result: created,
      message: "Task created",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      result: null,
      message: err.message,
    });
  }
};

// PATCH /api/kanban/update/:id
exports.update = async (req, res) => {
  try {
    const updated = await KanbanTask.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    return res.json({
      success: true,
      result: updated,
      message: "Task updated",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      result: null,
      message: err.message,
    });
  }
};

// DELETE /api/kanban/delete/:id
exports.remove = async (req, res) => {
  try {
    await KanbanTask.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      result: null,
      message: "Task deleted",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      result: null,
      message: err.message,
    });
  }
};
