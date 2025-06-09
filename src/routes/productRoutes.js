const express = require("express");
const router = express.Router();
const { listProducts } = require("../controllers/productController");
const authenticate = require("../middlewares/authMiddleware");
router.get("/", authenticate, listProducts);

module.exports = router;
