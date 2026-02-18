const express = require('express');
const { catchErrors } = require('@/handlers/errorHandlers');
const router = express.Router();

const authRoutes = require("./auth.routes");
router.use("/auth", authRoutes);

const leadRoutes = require("./lead.routes");
router.use("/lead", leadRoutes);

const kanbanRoutes = require("./kanban.routes");
router.use("/kanban", kanbanRoutes);

const jobRoutes = require("./job.routes");
router.use("/job", jobRoutes);

const planningRoutes = require("./planning.routes");
router.use("/planning", planningRoutes);

const fabricationRoutes = require("./fabrication.routes");
router.use("/fabrication", fabricationRoutes);

const qcRoutes = require("./qc.routes");
router.use("/qc", qcRoutes);

const customerRouter = require("./customer.routes");
router.use("/customer", customerRouter);

const appControllers = require('@/controllers/appControllers');
const { routesList } = require('@/models/utils');

const routerApp = (entity, controller) => {
  router.route(`/${entity}/create`).post(catchErrors(controller['create']));
  router.route(`/${entity}/read/:id`).get(catchErrors(controller['read']));
  router.route(`/${entity}/update/:id`).patch(catchErrors(controller['update']));
  router.route(`/${entity}/delete/:id`).delete(catchErrors(controller['delete']));
  router.route(`/${entity}/search`).get(catchErrors(controller['search']));
  router.route(`/${entity}/list`).get(catchErrors(controller['list']));
  router.route(`/${entity}/listAll`).get(catchErrors(controller['listAll']));
  router.route(`/${entity}/filter`).get(catchErrors(controller['filter']));
  router.route(`/${entity}/summary`).get(catchErrors(controller['summary']));

  if (entity === 'invoice' || entity === 'quote' || entity === 'payment') {
    router.route(`/${entity}/mail`).post(catchErrors(controller['mail']));
  }

  if (entity === 'quote') {
    router.route(`/${entity}/convert/:id`).get(catchErrors(controller['convert']));
  }
};

routesList.forEach(({ entity, controllerName }) => {
  const controller = appControllers[controllerName];
  routerApp(entity, controller);
});

module.exports = router;
