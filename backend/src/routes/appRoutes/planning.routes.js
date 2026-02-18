const router = require("express").Router();

const {
  listPlanningTasks,
  createPlanningTask,
  updatePlanningTask,
  deletePlanningTask,
} = require("@/controllers/planningcontroller");

// ✅ matches frontend
router.get("/list", listPlanningTasks);
router.post("/create", createPlanningTask);
router.patch("/update/:id", updatePlanningTask);
router.delete("/delete/:id", deletePlanningTask);

module.exports = router;
