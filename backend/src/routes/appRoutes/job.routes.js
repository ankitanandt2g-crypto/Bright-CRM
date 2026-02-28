const router = require("express").Router();

const {
  listJobs,
  createJob,
  deleteJob,
  createJobFromLead,
  updateJob,
  readJob, // ✅ NEW
} = require("../../controllers/job.controller");

router.get("/list", listJobs);
router.post("/create", createJob);

// ✅ NEW: read single job by id
router.get("/read/:id", readJob);

router.delete("/delete/:id", deleteJob);
router.patch("/update/:id", updateJob);

// ✅ Lead -> Job conversion
router.post("/from-lead/:leadId", createJobFromLead);

module.exports = router;