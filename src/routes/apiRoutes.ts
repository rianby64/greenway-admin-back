export {};
const { Router } = require("express");
const {
  getAllRoutesController,
  getAllRoutesUsersController,
  updateLineByRouteIdController,
  updateLinesByUserIdController,
  updateRouteByIdController,
  updateRouteByUserIdController,
  createRouteController,
  createUserRouteController,
  updateDotsByRouteIdController,
  updateDotsByUserIdController,
  createDotController,
  createDotByUserIdController,
} = require("../controllers/routesController");

const routesRouter = Router();
const prefix = "";

// TODO: edit controllers names
routesRouter.get(prefix, getAllRoutesController);
routesRouter.get(`${prefix}/users`, getAllRoutesUsersController);
routesRouter.put(`${prefix}/:id/lines`, updateLineByRouteIdController);
routesRouter.put(`${prefix}/users/:id/lines`, updateLinesByUserIdController);
routesRouter.put(`${prefix}/:id`, updateRouteByIdController);
routesRouter.put(`${prefix}/users/:id`, updateRouteByUserIdController);
routesRouter.post(`${prefix}`, createRouteController);
routesRouter.post(`${prefix}/users`, createUserRouteController);
routesRouter.put(`${prefix}/:id/dots`, updateDotsByRouteIdController);
routesRouter.put(`${prefix}/users/:id/dots`, updateDotsByUserIdController);
routesRouter.post(`${prefix}/:id/dots`, createDotController);
routesRouter.post(`${prefix}/users/:id/dots`, createDotByUserIdController);

module.exports = routesRouter;
