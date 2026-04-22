const express = require("express");
const router = express.Router();
const c = require("./college.controller");
const { verifyToken } = require("../../middleware/auth.middleware");
const { adminOnly } = require("../../middleware/role.middleware");

const auth = [verifyToken, adminOnly];

router.get("/", ...auth, c.getAll);
router.get("/:id", ...auth, c.getById);
router.post("/", ...auth, c.create);
router.put("/:id", ...auth, c.update);
router.delete("/:id", ...auth, c.remove);
router.patch("/:id/restore", ...auth, c.restore);

module.exports = router;
