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
const authMiddleware = require('../middlewares/auth-middleware')

// TODO: edit controllers names
// TODO: Remove all "..users.." things, update them with auth
routesRouter.get(prefix, authMiddleware, getAllRoutesController);
routesRouter.get(`${prefix}/users`, getAllRoutesUsersController);
routesRouter.put(`${prefix}/:id/lines`, authMiddleware, updateLineByRouteIdController);
routesRouter.put(`${prefix}/users/:id/lines`, updateLinesByUserIdController);
routesRouter.put(`${prefix}/:id`, authMiddleware, updateRouteByIdController);
routesRouter.put(`${prefix}/users/:id`, updateRouteByUserIdController);
routesRouter.post(`${prefix}`, authMiddleware, createRouteController);
routesRouter.post(`${prefix}/users`, createUserRouteController);
routesRouter.put(`${prefix}/:id/dots`, authMiddleware, updateDotsByRouteIdController);
routesRouter.put(`${prefix}/users/:id/dots`, updateDotsByUserIdController);
routesRouter.post(`${prefix}/:id/dots`, authMiddleware, createDotController);
routesRouter.post(`${prefix}/users/:id/dots`, createDotByUserIdController);

module.exports = routesRouter;
