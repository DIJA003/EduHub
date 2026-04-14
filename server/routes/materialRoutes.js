const express = require("express");
const router = express.Router();

const materialController = require("../controllers/MaterialController");
const uploadMaterial = require("../middleware/upload");

// GET ALL MATERIALS
router.get("/", materialController.getAll);

// GET MATERIAL BY ID
router.get("/:id", materialController.getById);

// CREATE MATERIAL (UPLOAD FILE)
router.post("/", uploadMaterial.single("file"), materialController.create);

// UPDATE MATERIAL
router.put("/:id", uploadMaterial.single("file"), materialController.update);

// DELETE MATERIAL
router.delete("/:id", materialController.remove);

module.exports = router;
