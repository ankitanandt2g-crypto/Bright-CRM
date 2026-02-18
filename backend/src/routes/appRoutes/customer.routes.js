const express = require("express");
const router = express.Router();

// ✅ controller path is now: backend/src/controllers/customer.controller.js
const controller = require("../../controllers/customer.controller");

router.get("/list", controller.list);
router.post("/create", controller.create);
router.put("/update/:id", controller.update);
router.delete("/delete/:id", controller.delete);

module.exports = router;
