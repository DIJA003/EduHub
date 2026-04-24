const express = require("express");
const router = express.Router();
const c = require("./colleges.controller");
const { verifyToken } = require("../../middleware/auth.middleware");
const { adminOnly } = require("../../middleware/role.middleware");

router.get("/", verifyToken, c.getAll);
router.get("/:id", verifyToken, c.getById);
router.post("/", verifyToken, adminOnly, c.create);
router.put("/:id", verifyToken, adminOnly, c.update);
router.delete("/:id", verifyToken, adminOnly, c.remove);
router.patch("/:id/restore", verifyToken, adminOnly, c.restore);

module.exports = router;
