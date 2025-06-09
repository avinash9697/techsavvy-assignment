const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");
const uploadCSV = require("../controllers/uploadController");

const router = express.Router();
router.post("/", authenticate, upload.single("file"), uploadCSV);

module.exports = router;
