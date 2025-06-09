const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const {
  reportByCampaign,
  reportByAdGroupID,
  reportByFSNID,
  reportByProductName,
} = require("../controllers/reportController");

const router = express.Router();

router.post("/products/report/campaign", authenticate, reportByCampaign);
router.post("/products/report/adGroupID", authenticate, reportByAdGroupID);
router.post("/products/report/fsnID", authenticate, reportByFSNID);
router.post("/products/report/productName", authenticate, reportByProductName);

module.exports = router;
