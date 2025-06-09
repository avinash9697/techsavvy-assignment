const logger = require("../logger");
const { fieldMappings } = require("../utils/fieldMappings");
const { getReport } = require("../utils/reportUtils");

const handleReport = (inputMainKey) => {
  return async (req, res) => {
    const mainValue = req.body[inputMainKey.trim()];
    const additionalFilters = req.body.filters || {};

    if (!mainValue) {
      logger.warn("main key missing");
      return res.status(400).json({ message: `${inputMainKey} is required` });
    }

    // Convert requested keys to Database column names
    const mainKey = fieldMappings[inputMainKey];
    const filters = {};

    for (const key in additionalFilters) {
      const dbKey = fieldMappings[key];
      if (dbKey) {
        filters[dbKey] = additionalFilters[key];
      } else {
        logger.warn(`Unknown filter ignored: ${key}`);
      }
    }
    const responseData = await getReport(mainKey, mainValue, filters);
    if (!responseData) {
      logger.info("No data found");
      return res.status(404).json({ message: "No data found" });
    }
    return res.status(200).json({
      data: responseData,
      status_code: 200,
    });
  };
};

module.exports = {
  reportByCampaign: handleReport("Campaign Name"),
  reportByAdGroupID: handleReport("Ad Group ID"),
  reportByFSNID: handleReport("FSN ID"),
  reportByProductName: handleReport("Product Name"),
};
