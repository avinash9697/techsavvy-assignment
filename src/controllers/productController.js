//This is additional bonus implementing pagination and filteration features retriving all products
const { Op } = require("sequelize");
const Product = require("../models/productModel");

const listProducts = async (req, res) => {
  try {
    const {
      campaignname,
      productname,
      fsnid,
      adgroupid,
      page = 1,
      limit = 10,
    } = req.query;
    //set default page values of page 1 and limit 10
    const whereClause = {};

    if (campaignname) {
      whereClause.campaignname = { [Op.like]: `%${campaignname}%` };
    }
    if (productname) {
      whereClause.productname = { [Op.like]: `%${productname}%` };
    }
    if (fsnid) {
      whereClause.fsnid = { [Op.like]: `%${fsnid}%` };
    }
    if (adgroupid) {
      whereClause.adgroupid = { [Op.like]: `%${adgroupid}%` };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      offset,
      limit: parseInt(limit),
    });

    return res.status(200).json({
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalRecords: count,
        totalPages: Math.ceil(count / limit),
      },
      status_code: 200,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { listProducts };
