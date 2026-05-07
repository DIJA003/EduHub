const express = require("express");
const router = express.Router();
const c = require("./academic-years.controller");
const { verifyToken } = require("../../middleware/auth.middleware");
const { adminOnly } = require("../../middleware/role.middleware");

router.get("/", verifyToken, c.getAll);
router.get("/year/:year", verifyToken, c.getByYear);
router.get("/:id", verifyToken, c.getById);
router.post("/", verifyToken, adminOnly, c.create);
router.put("/:id", verifyToken, adminOnly, c.update);

module.exports = router;
