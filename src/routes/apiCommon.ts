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

apiRouter.get("/dot-types", getDotTypesController);
apiRouter.get("/districts", getDistricts);
apiRouter.get("/route-categories", getRouteCategories);
apiRouter.get("/route-difficulties", getRouteDifficulties);
apiRouter.get("/route-types", getRouteTypes);
// apiRouter.delete("/dot/:iddot", deleteDotById);
// apiRouter.delete("/user/route/:id", deleteUserRouteById);

module.exports = apiRouter;
