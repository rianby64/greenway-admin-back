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

const {body} = require("express-validator")
const authMiddleware = require('../middlewares/auth-middleware')

const apiRouter = Router();

apiRouter.get("/dot_types", getDotTypesController);
apiRouter.get("/districts", getDistricts);
apiRouter.get("/route_categories", getRouteCategories);
apiRouter.get("/route_difficulties", getRouteDifficulties);
apiRouter.get("/route_types", getRouteTypes);

apiRouter.post("/registration",
	body('email').isEmail(),
	body('password').isLength({min: 3, max: 32}),
	registration);
apiRouter.post("/login", login);
apiRouter.post("/logout", logout);
apiRouter.get("/refresh", refresh);
apiRouter.get("/users", authMiddleware, getUsers);
// apiRouter.delete("/dot/:iddot", deleteDotById);
// apiRouter.delete("/user/route/:id", deleteUserRouteById);

module.exports = apiRouter;
