const express = require("express");
const router = express.Router();
const c = require("./users.controller"); // ← fixed (was user.controller)
const { verifyToken } = require("../../middleware/auth.middleware");
const { adminOnly } = require("../../middleware/role.middleware");
const {
  validate,
  validators,
} = require("../../middleware/validate.middleware");
router.put("/profile", verifyToken, c.updateProfile);

router.get("/", verifyToken, adminOnly, c.getAll);
router.get("/:id", verifyToken, adminOnly, c.getById);
router.post(
  "/",
  verifyToken,
  adminOnly,
  validate({
    name: [validators.required, validators.string, validators.minLength(2)],
    email: [validators.required, validators.email],
    password: [validators.required, validators.minLength(8)],
  }),
  c.create,
);
router.put("/:id", verifyToken, adminOnly, c.update);
router.delete("/:id", verifyToken, adminOnly, c.remove);
router.patch("/:id/restore", verifyToken, adminOnly, c.restore);

module.exports = router;
