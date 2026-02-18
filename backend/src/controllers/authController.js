const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = mongoose.models.User;

if (!User) {
  throw new Error("User model not loaded.");
}

// ================= TOKEN =================
const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ================= AUTO CREATE DEFAULT ADMIN =================
exports.ensureDefaultAdmin = async () => {
  try {
    const exists = await User.findOne({ role: "admin", email: "admin@crm.com" });

    if (!exists) {
      const hash = await bcrypt.hash("Admin@123", 10);

      await User.create({
        name: "System Admin",
        email: "admin@crm.com",
        password: hash,
        role: "admin",
        isActive: true,
      });

      console.log("✅ Default admin created:");
      console.log("Email: admin@crm.com");
      console.log("Password: Admin@123");
    }
  } catch (err) {
    console.log("Admin creation error:", err.message);
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { role, identifier, password } = req.body;

    if (!role || !identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "role, identifier, password required",
      });
    }

    let query = {};

    if (role === "worker") {
      query = { role: "worker", workerId: identifier };
    } else {
      query = { role, email: String(identifier).toLowerCase().trim() };
    }

    const user = await User.findOne(query);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = signToken(user);

    return res.json({
      success: true,
      result: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          workerId: user.workerId || null,
        },
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ================= CUSTOMER REGISTER =================
exports.customerRegister = async (req, res) => {
  try {
    const { name, companyName, email, password, mobile } = req.body;

    if (!name || !companyName || !email || !password || !mobile) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const emailLower = String(email).toLowerCase().trim();

    const exists = await User.findOne({
      email: emailLower,
      role: "customer",
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Customer already exists with this email",
      });
    }

    // password hash
    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      companyName,
      email: emailLower,
      mobile,
      password: hash,
      role: "customer",
      isActive: true,
    });

    return res.json({
      success: true,
      result: {
        _id: user._id,
        name: user.name,
        companyName: user.companyName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
      message: "Customer registered successfully",
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ================= ADMIN CREATE WORKER =================
exports.createWorker = async (req, res) => {
  try {
    const { name, email, workerId, password } = req.body;

    const exists = await User.findOne({
      $or: [{ email }, { workerId }],
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Worker already exists",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const worker = await User.create({
      name,
      email,
      workerId,
      password: hash,
      role: "worker",
      isActive: true,
    });

    return res.json({
      success: true,
      result: worker,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ================= AUTO CREATE DEFAULT WORKER =================
exports.ensureDefaultWorker = async () => {
  try {
    const exists = await User.findOne({
      role: "worker",
      workerId: "W-1001",
    });

    if (!exists) {
      const hash = await bcrypt.hash("Worker@123", 10);

      await User.create({
        name: "Default Worker",
        email: "worker@crm.com",
        workerId: "W-1001",
        password: hash,
        role: "worker",
        isActive: true,
      });

      console.log("✅ Default worker created:");
      console.log("Worker ID: W-1001");
      console.log("Password: Worker@123");
    }
  } catch (err) {
    console.log("Worker creation error:", err.message);
  }
};

// ================= FORGOT PASSWORD =================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: true,
        message: "If email exists, reset link sent",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    return res.json({
      success: true,
      result: { resetToken: token },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.json({
      success: true,
      message: "Password updated",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
