const express = require("express");
const router = express.Router();
const { getStats, getActivity } = require("./dashboard.controller");
const { verifyToken } = require("../../middleware/auth.middleware");
const { adminOnly } = require("../../middleware/role.middleware");

const auth = [verifyToken, adminOnly];

router.get("/stats", ...auth, getStats);
router.get("/activity", ...auth, getActivity);

module.exports = router;
