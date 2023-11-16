export {};
const { Router } = require("express");
const {
  getDotTypesController,
  getDistricts,
  getRouteCategories,
  getRouteDifficulties,
  getRouteTypes,
} = require("../controllers/commonController");

const apiRouter = Router();

apiRouter.get("/dot_types", getDotTypesController);
apiRouter.get("/districts", getDistricts);
apiRouter.get("/route_categories", getRouteCategories);
apiRouter.get("/route_difficulties", getRouteDifficulties);
apiRouter.get("/route_types", getRouteTypes);
// apiRouter.delete("/dot/:iddot", deleteDotById);
// apiRouter.delete("/user/route/:id", deleteUserRouteById);

module.exports = apiRouter;
