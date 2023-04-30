const {Router} = require("express");
const router = Router();
const apiRouter = require("./apiCommon");
const apiRoutesRouter = require("./apiRoutes");

router.use("/api/", apiRouter);
router.use("/api/routes", apiRoutesRouter);


module.exports = router;