const express = require("express");
const router = express.Router();
const c = require("./materials.controller");
const { verifyToken } = require("../../middleware/auth.middleware");
const { mentorOrAdmin } = require("../../middleware/role.middleware");

router.use(verifyToken);

router.get("/", c.getAll);

router.get("/my", c.getMyMaterials);

router.get("/pending", mentorOrAdmin, c.getPending);

router.post("/", c.createMaterial);

router.patch("/:id/approve", mentorOrAdmin, c.approve);
router.patch("/:id/reject", mentorOrAdmin, c.reject);

router.delete("/:id", c.remove);

module.exports = router;
