const router = require("express").Router();

const {
  listJobs,
  createJob,
  deleteJob,
  createJobFromLead,
} = require("../../controllers/job.controller");
const { updateJob } = require("../../controllers/job.controller");



router.get("/list", listJobs);
router.post("/create", createJob);
router.delete("/delete/:id", deleteJob);
router.patch("/update/:id", updateJob);

// ✅ Lead -> Job conversion
router.post("/from-lead/:leadId", createJobFromLead);

module.exports = router;
