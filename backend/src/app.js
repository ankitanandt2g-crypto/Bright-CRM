const express = require("express");
const cors = require("cors");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const path = require("path");

const coreAuthRouter = require("./routes/coreRoutes/coreAuth");
const coreApiRouter = require("./routes/coreRoutes/coreApi");
const coreDownloadRouter = require("./routes/coreRoutes/coreDownloadRouter");
const corePublicRouter = require("./routes/coreRoutes/corePublicRouter");

const adminAuth = require("./controllers/coreControllers/adminAuth");

const errorHandlers = require("./handlers/errorHandlers");
const erpApiRouter = require("./routes/appRoutes/appApi");

// 👉 Your custom auth routes
const authRouter = require("./routes/appRoutes/auth.routes");

// 👉 Public settings route
const settingsPublicRoutes = require("./routes/appRoutes/settings.public.routes");

const app = express();

// ============================
// CORS
// ============================

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// ============================
// ✅ PUBLIC ROUTES (NO TOKEN)
// ============================

// Idurar core auth
app.use("/api", coreAuthRouter);

// Your custom auth routes
app.use("/api/auth", authRouter);

// Public settings (logo + company name)
app.use("/api/settings", settingsPublicRoutes);

// Public downloads & public APIs
app.use("/download", coreDownloadRouter);
app.use("/public", corePublicRouter);

// Static uploads (logo access)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ============================
// 🔒 PROTECTED ROUTES (TOKEN REQUIRED)
// ============================

// Core protected APIs
app.use("/api", adminAuth.isValidAuthToken, coreApiRouter);

// ERP / App APIs (lead, job, kanban, settings admin, etc.)
app.use("/api", adminAuth.isValidAuthToken, erpApiRouter);

// ============================
// ERROR HANDLERS
// ============================

app.use(errorHandlers.notFound);
app.use(errorHandlers.productionErrors);

module.exports = app;