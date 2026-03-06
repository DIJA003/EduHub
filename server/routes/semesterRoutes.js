const express = require("express");
const router = express.Router();
const semesterController = require("../controllers/semesterController");

const { verifyToken, adminOnly } = require("../middleware/authMiddleware");
//router.use(verifyToken, adminOnly);

router.get("/by-year/:yearId", semesterController.getByYear);

router.post("/", semesterController.create);
router.get("/", semesterController.getAll);
router.get("/:id", semesterController.getOne);

module.exports = router;
