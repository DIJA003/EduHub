const express = require("express");
const router = express.Router();
const { getLogs, getLogById } = require("./log.controller");
const { verifyToken } = require("../../middleware/auth.middleware");
const { adminOnly } = require("../../middleware/role.middleware");

router.use(verifyToken, adminOnly);

router.get("/", getLogs);
router.get("/:id", getLogById);

module.exports = router;
