const router = require("express").Router();

const {
  listFabricationItems,
  createFabricationItem,
  updateFabricationItem,
  deleteFabricationItem,
} = require("@/controllers/fabricationcontroller");

// ✅ /api/fabrication/...
router.get("/list", listFabricationItems);
router.post("/create", createFabricationItem);
router.patch("/update/:id", updateFabricationItem);
router.delete("/delete/:id", deleteFabricationItem);

module.exports = router;
