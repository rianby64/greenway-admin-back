export {};
const { Router } = require("express");
const {
  getAllDotTypesController,
  getDistricts,
  getRouteCatrgiries,
  getRouteDifficulties,
  getRouteTypes,
} = require("../controllers/commonController");

const apiRouter = Router();

apiRouter.get("/dot-types", getAllDotTypesController);
apiRouter.get("/districts", getDistricts);
apiRouter.get("/route-categories", getRouteCatrgiries);
apiRouter.get("/route-difficulties", getRouteDifficulties);
apiRouter.get("/route-types", getRouteTypes);
// apiRouter.delete("/dot/:iddot", deleteDotById);
// apiRouter.delete("/user/route/:id", deleteUserRouteById);

module.exports = apiRouter;
