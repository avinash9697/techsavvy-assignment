const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Product = sequelize.define(
  "Product",
  {
    campaignid: { type: DataTypes.STRING },
    campaignname: { type: DataTypes.STRING },
    adgroupid: { type: DataTypes.STRING },
    fsnid: {
      type: DataTypes.STRING,
    },
    productname: { type: DataTypes.STRING },
    adspend: { type: DataTypes.FLOAT },
    views: { type: DataTypes.NUMBER },
    clicks: { type: DataTypes.NUMBER },
    directunits: { type: DataTypes.NUMBER },
    indirectunits: { type: DataTypes.NUMBER },
    directrevenue: { type: DataTypes.NUMBER },
    indirectrevenue: { type: DataTypes.NUMBER },
  },
  {
    tableName: "products",
    timestamps: false,
  }
);

module.exports = Product;
