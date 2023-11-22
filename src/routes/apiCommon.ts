export {};
const { Router } = require("express");
const {
  getDotTypesController,
  getDistricts,
  getRouteCategories,
  getRouteDifficulties,
  getRouteTypes,
} = require("../controllers/commonController");

const {
	registration,
	login,
	logout,
	refresh,
	getUsers
} = require("../controllers/userController");

const apiRouter = Router();

apiRouter.get("/dot_types", getDotTypesController);
apiRouter.get("/districts", getDistricts);
apiRouter.get("/route_categories", getRouteCategories);
apiRouter.get("/route_difficulties", getRouteDifficulties);
apiRouter.get("/route_types", getRouteTypes);
apiRouter.post("/registration", registration);
apiRouter.post("/login", login);
apiRouter.post("/logout", logout);
apiRouter.get("/refresh", refresh);
apiRouter.get("/users", getUsers);
// apiRouter.delete("/dot/:iddot", deleteDotById);
// apiRouter.delete("/user/route/:id", deleteUserRouteById);

module.exports = apiRouter;
