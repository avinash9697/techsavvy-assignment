//to check in database
const fieldMappings = {
  "Campaign Name": "campaignname",
  "Ad Group ID": "adgroupid",
  "FSN ID": "fsnid",
  "Product Name": "productname",
};

//conversion back to send in response
const reverseFieldMappings = {
  campaignname: "campaign",
  adgroupid: "adGroupID",
  fsnid: "fsnID",
  productname: "product",
};

module.exports = { fieldMappings, reverseFieldMappings };
