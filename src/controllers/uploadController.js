const fs = require("fs");
const fsPromises = require("fs").promises;
const csv = require("csv-parser");
const Product = require("../models/productModel");
const logger = require("../logger");
const { fields } = require("../middlewares/upload");

const uploadCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      logger.warn("Please select file");
      return res.status(400).json({ message: "CSV file is required" });
    }
    const filePath = req.file.path;
    const results = [];
    const stream = fs.createReadStream(filePath);

    stream
      .pipe(csv())
      .on("data", (row) => {
        results.push({
          campaignid: row["Campaign ID"],
          campaignname: row["Campaign Name"],
          adgroupid: row["Ad Group ID"],
          fsnid: row["FSN ID"],
          productname: row["Product Name"],
          adspend: parseFloat(row["Ad Spend"]),
          views: parseInt(row["Views"]),
          clicks: parseInt(row["Clicks"]),
          directunits: parseInt(row["Direct Units"]),
          indirectunits: parseInt(row["Indirect Units"]),
          directrevenue: parseInt(row["Direct Revenue"]),
          indirectrevenue: parseInt(row["Indirect Revenue"]),
        });
      })
      .on("end", async () => {
        //For large scale applications we can seperate some chunks and insert ignoring sqlite busy errors
        //inserting rows to database
        await Product.bulkCreate(results);

        //deleting the file after inserting data
        try {
          await fsPromises.unlink(filePath);
          logger.info(`File deleted: ${filePath}`);
        } catch (err) {
          logger.error("File deletion error:", err);
        }

        res.status(200).json({
          message: "CSV uploaded and saved",
          inserted: results.length,
        });
      })
      .on("error", (err) => {
        fs.unlinkSync(filePath); // delete on error
        next(err);
      });
  } catch (error) {
    next(error);
  }
};

module.exports = uploadCSV;
