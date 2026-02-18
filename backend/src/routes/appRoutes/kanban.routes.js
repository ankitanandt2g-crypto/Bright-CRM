const router = require("express").Router();

const {
  listByJob,
  create,
  update,
  remove,
} = require("../../controllers/kanban.controller");

router.get("/list/:jobId", listByJob);
router.post("/create", create);
router.patch("/update/:id", update);
router.delete("/delete/:id", remove);

module.exports = router;
