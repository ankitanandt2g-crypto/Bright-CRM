const mongoose = require("mongoose");
const User = mongoose.models.User;

const getUserIdFromReq = (req) => {
  // your auth middleware may attach user info differently
  return (
    req.admin?._id ||
    req.user?._id ||
    req.auth?._id ||
    req.auth?.id ||
    req.userId ||
    null
  );
};

exports.getMe = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const me = await User.findById(userId).select(
      "-password -resetPasswordTokenHash -resetPasswordExpires"
    );

    if (!me) return res.status(404).json({ success: false, message: "User not found" });

    return res.json({ success: true, result: me });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const allowed = ["name", "companyName", "email", "mobile"];
    const update = {};

    allowed.forEach((k) => {
      if (req.body[k] !== undefined) update[k] = req.body[k];
    });

    const updated = await User.findByIdAndUpdate(userId, update, { new: true }).select(
      "-password -resetPasswordTokenHash -resetPasswordExpires"
    );

    return res.json({ success: true, result: updated, message: "Profile updated" });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};