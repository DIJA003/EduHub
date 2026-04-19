const express = require("express");
const router = express.Router();
const {
  register,
  getMe,
  verifyEmailExists,
  logPasswordChange,
} = require("./auth.controller");
const {
  verifyToken,
  verifyRegistration,
} = require("../../middleware/auth.middleware");
const {
  validate,
  validators,
} = require("../../middleware/validate.middleware");

router.post(
  "/register",
  verifyRegistration,
  validate({
    name: [validators.required, validators.string, validators.minLength(2)],
  }),
  register,
);

router.get("/me", verifyToken, getMe);

router.post(
  "/verify-email",
  validate({ email: [validators.required, validators.email] }),
  verifyEmailExists,
);

router.post("/password-changed", verifyToken, logPasswordChange);

module.exports = router;
