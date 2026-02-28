const express = require("express");
const router = express.Router();

const userController = require("../../controllers/user.controller");

// ✅ GET /api/user/me
router.get("/me", userController.getMe);

// ✅ PATCH /api/user/me
router.patch("/me", userController.updateMe);

module.exports = router;