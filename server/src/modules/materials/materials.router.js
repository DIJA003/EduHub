const express = require("express");
const router = express.Router();
const c = require("./materials.controller");
const { verifyToken } = require("../../middleware/auth.middleware");
const { mentorOrAdmin } = require("../../middleware/role.middleware");

router.use(verifyToken);

router.get("/", c.getAll);
router.post("/", c.createMaterial);
router.get("/pending", mentorOrAdmin, c.getPending);
router.patch("/:id/approve", mentorOrAdmin, c.approve);
router.patch("/:id/reject", mentorOrAdmin, c.reject);
router.delete("/:id", c.remove);
router.get("/my", c.getMyMaterials);

module.exports = router;
