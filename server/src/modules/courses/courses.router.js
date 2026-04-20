const express = require("express");
const router = express.Router();
const c = require("./courses.controller");
const { verifyToken } = require("../../middleware/auth.middleware");
const { adminOnly } = require("../../middleware/role.middleware");
const {
  validate,
  validators,
} = require("../../middleware/validate.middleware");

router.get("/", verifyToken, c.getAll);
router.get("/year/:yearId", verifyToken, c.getByYear);
router.get("/:id", verifyToken, c.getById);

router.post(
  "/",
  verifyToken,
  adminOnly,
  validate({
    code: [validators.required, validators.string],
    title: [validators.required, validators.string],
  }),
  c.create,
);
router.put("/:id", verifyToken, adminOnly, c.update);
router.delete("/:id", verifyToken, adminOnly, c.remove);
router.patch("/:id/restore", verifyToken, adminOnly, c.restore);

module.exports = router;
