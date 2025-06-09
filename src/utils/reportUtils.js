const Product = require("../models/productModel");
const { reverseFieldMappings } = require("./fieldMappings");

//function to calculate the records
const calculateStats = (records) => {
  const AdSpend = records.reduce((sum, r) => sum + (r.adspend || 0), 0);
  const Views = records.reduce((sum, r) => sum + (r.views || 0), 0);
  const Clicks = records.reduce((sum, r) => sum + (r.clicks || 0), 0);
  const directRevenue = records.reduce(
    (sum, r) => sum + (r.directrevenue || 0),
    0
  );
  const indirectRevenue = records.reduce(
    (sum, r) => sum + (r.indirectrevenue || 0),
    0
  );
  const directUnits = records.reduce((sum, r) => sum + (r.directunits || 0), 0);
  const indirectUnits = records.reduce(
    (sum, r) => sum + (r.indirectunits || 0),
    0
  );

  //checking if the views value > 0
  const CTR = Views > 0 ? (Clicks / Views) * 100 : 0;

  const TotalRevenue = directRevenue + indirectRevenue;
  const TotalOrders = directUnits + indirectUnits;

  //checking if the ad spend > 0
  const ROAS = AdSpend > 0 ? TotalRevenue / AdSpend : 0;

  return {
    AdSpend: parseFloat(AdSpend.toFixed(2)),
    Views,
    Clicks,
    CTR: parseFloat(CTR.toFixed(2)),
    TotalRevenue: parseFloat(TotalRevenue.toFixed(2)),
    TotalOrders,
    ROAS: parseFloat(ROAS.toFixed(2)),
  };
};

//function that prpeare filters and query the DB
const getReport = async (mainKey, mainValue, filters) => {
  const whereClause = {
    [mainKey]: mainValue,
    ...filters,
  };

  const records = await Product.findAll({ where: whereClause });
  if (records.length === 0) return null;

  const stats = calculateStats(records);

  return [
    {
      [reverseFieldMappings[mainKey]]: mainValue,
      ...stats,
    },
  ];
};

module.exports = { getReport };
