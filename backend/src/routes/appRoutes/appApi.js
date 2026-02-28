const express = require("express");
const { catchErrors } = require("@/handlers/errorHandlers");
const router = express.Router();

/**
 * ✅ Normalize route exports.
 * Fixes: Router.use() requires middleware function but got Object
 *
 * Supports exports like:
 * - module.exports = router
 * - module.exports = { router }
 * - exports.router = router
 * - exports.default = router
 */
const asRouter = (mod, name) => {
  const r = mod?.default || mod?.router || mod;

  // Express Router is callable function with .use
  if (!r || typeof r.use !== "function") {
    console.error(`❌ Invalid router export in ${name}. Got:`, r);
    throw new Error(`Invalid router export in ${name}. It must export an express.Router() instance.`);
  }
  return r;
};

// ✅ Safe mounts
router.use("/auth", asRouter(require("./auth.routes"), "auth.routes"));
router.use("/lead", asRouter(require("./lead.routes"), "lead.routes"));
router.use("/quote", asRouter(require("./quote.routes"), "quote.routes"));
router.use("/kanban", asRouter(require("./kanban.routes"), "kanban.routes"));
router.use("/job", asRouter(require("./job.routes"), "job.routes"));
router.use("/planning", asRouter(require("./planning.routes"), "planning.routes"));
router.use("/user", asRouter(require("./user.routes"), "user.routes"));
router.use("/fabrication", asRouter(require("./fabrication.routes"), "fabrication.routes"));
router.use("/qc", asRouter(require("./qc.routes"), "qc.routes"));

// ✅ SETTINGS (ONLY ONCE)
router.use("/settings", asRouter(require("./settings.routes"), "settings.routes"));

// ✅ CUSTOMER
router.use("/customer", asRouter(require("./customer.routes"), "customer.routes"));

// ✅ Dynamic entities (existing system)
const appControllers = require("@/controllers/appControllers");
const { routesList } = require("@/models/utils");

const routerApp = (entity, controller) => {
  router.route(`/${entity}/create`).post(catchErrors(controller["create"]));
  router.route(`/${entity}/read/:id`).get(catchErrors(controller["read"]));
  router.route(`/${entity}/update/:id`).patch(catchErrors(controller["update"]));
  router.route(`/${entity}/delete/:id`).delete(catchErrors(controller["delete"]));
  router.route(`/${entity}/search`).get(catchErrors(controller["search"]));
  router.route(`/${entity}/list`).get(catchErrors(controller["list"]));
  router.route(`/${entity}/listAll`).get(catchErrors(controller["listAll"]));
  router.route(`/${entity}/filter`).get(catchErrors(controller["filter"]));
  router.route(`/${entity}/summary`).get(catchErrors(controller["summary"]));

  if (entity === "invoice" || entity === "quote" || entity === "payment") {
    router.route(`/${entity}/mail`).post(catchErrors(controller["mail"]));
  }

  if (entity === "quote") {
    router.route(`/${entity}/convert/:id`).get(catchErrors(controller["convert"]));
  }
};

routesList.forEach(({ entity, controllerName }) => {
  const controller = appControllers[controllerName];
  routerApp(entity, controller);
});

module.exports = router;