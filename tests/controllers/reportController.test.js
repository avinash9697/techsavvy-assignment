jest.mock("../../src/models/productModel", () => ({
  findAll: jest.fn(),
}));
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

// Mocking logger to stop console statements
jest.mock("../../src/logger/index", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

const request = require("supertest");
const app = require("../../src/app");
const jwt = require("jsonwebtoken");
const Product = require("../../src/models/productModel");

beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "info").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /products/report/ProductName", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //test to check if token is passed or not for product name api
  it("should return 401 if there is no token provided", async () => {
    const res = await request(app).post("/products/report/productName"); // no Authorization header

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Access Denied");
  });

  //testing campaign api
  it("should return 200 and calculated stats when data found", async () => {
    jwt.verify.mockReturnValue({ userId: 1, username: "admin" });
    Product.findAll.mockResolvedValue([
      {
        campaign: "TestCampaign",
        AdSpend: 871.32,
        Views: 123222,
        Clicks: 16448,
        CTR: 1.45,
        TotalRevenue: 225118988,
        TotalOrders: 16626,
        ROAS: 25.92,
        statusCode: 200,
      },
    ]);

    const res = await request(app)
      .post("/products/report/campaign")
      .set("Authorization", "Bearer faketoken")
      .send({ "Campaign Name": "TestCampaign" });

    expect(res.statusCode).toBe(200);
    expect(Product.findAll).toHaveBeenCalled();
  });
  //to test if there no data for fsn id api
  it("should return 404 when no matching records found for campaign", async () => {
    jwt.verify.mockReturnValue({ userId: 1, username: "admin" });

    Product.findAll.mockResolvedValue([]);

    const res = await request(app)
      .post("/products/report/fsnID")
      .set("Authorization", "Bearer faketoken")
      .send({ "FSN ID": "NonExistentId" });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("No data found");
  });

  //test if the main key is not getting passed for ad group id api
  it("should return 400 if FSN ID is missing in request body", async () => {
    jwt.verify.mockReturnValue({ userId: 1, username: "admin" });

    const res = await request(app)
      .post("/products/report/adGroupID")
      .set("Authorization", "Bearer faketoken")
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Ad Group ID is required");
  });
});
