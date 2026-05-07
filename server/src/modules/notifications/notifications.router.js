const express = require("express");
const router = express.Router();
const c = require("./notifications.controller");
const { verifyToken } = require("../../middleware/auth.middleware");

router.use(verifyToken);

router.get("/", c.getAll);
router.patch("/read-all", c.markAllRead);
router.patch("/:id/read", c.markRead);
router.delete("/", c.deleteAll);
router.delete("/:id", c.deleteOne);

module.exports = router;
