const express = require("express");
const router = express.Router();

const controller = require("../../controllers/installation.controller");

router.get("/list/:jobId", controller.listByJob);
router.get("/read/:id", controller.read);
router.post("/create", controller.create);
router.patch("/update/:id", controller.update);
router.patch("/complete/:jobId", controller.completeInstallation);
router.delete("/delete/:id", controller.delete);

module.exports = router;