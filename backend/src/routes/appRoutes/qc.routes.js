const express = require("express");
const router = express.Router();

const {
  listQcItems,
  createQcItem,
  updateQcItem,
  deleteQcItem,
} = require("@/controllers/qc.controller");

router.get("/list", listQcItems);
router.post("/create", createQcItem);
router.patch("/update/:id", updateQcItem);
router.delete("/delete/:id", deleteQcItem);

module.exports = router; // ✅ MUST be this


