//creting mock database to not effect the real db
jest.mock("../../src/models/userModel", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
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
const User = require("../../src/models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  createUser,
  getUsers,
} = require("../../src/controllers/userController");

beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "info").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /users - creating user", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //to test if there is any validation errors
  it("should return 422 if validation fails", async () => {
    //passing empty body to check validation is working or not
    const res = await request(app).post("/users").send({});
    expect(res.statusCode).toBe(422);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  //to test if the email already exists
  it("should return 409 if user already exists", async () => {
    User.findOne.mockResolvedValue({ id: 1, email: "existing@example.com" });

    const res = await request(app).post("/users").send({
      username: "existinguser",
      password: "password123",
      email: "existing@example.com",
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe("Username or email already in use");
  });

  //to test user creation
  it("should create a new user successfully", async () => {
    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashedpassword123");
    User.create.mockResolvedValue({
      id: 10,
      username: "newuser",
      email: "newuser@example.com",
    });

    const res = await request(app).post("/users").send({
      username: "newuser",
      password: "password123",
      email: "newuser@example.com",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("User Created");
    expect(res.body.user).toEqual({
      id: 10,
      username: "newuser",
    });

    expect(User.create).toHaveBeenCalledWith({
      username: "newuser",
      password: "hashedpassword123",
      email: "newuser@example.com",
    });
  });

  //to test if any error happend
  it("should call next(error) on unexpected error", async () => {
    const error = new Error("DB failure");
    User.findOne.mockRejectedValue(error);

    // Call controller directly instead of calling api route
    const next = jest.fn();
    const req = {
      body: {
        username: "user",
        password: "pass123",
        email: "user@example.com",
      },
    };
    const res = {};

    await createUser(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe("GET /users - fetching user based on id or complete users", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //to test whether the token is passed or not
  it("should return 401 if no token is provided", async () => {
    const res = await request(app).get("/users");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Access Denied");
  });

  //test if id is passed and there is no user
  it("should return 404 if user not found by ID", async () => {
    jwt.verify.mockImplementation(() => ({ userId: 1, username: "admin" }));

    User.findByPk.mockResolvedValue(null); //no user output

    const res = await request(app)
      .get("/users/22")
      .set("Authorization", "Bearer faketoken");

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("User Not Found");
  });

  //test for single user retrival
  it("should return a single user when userId is passed and token is valid", async () => {
    jwt.verify.mockImplementation(() => ({ userId: 1, username: "admin" }));

    User.findByPk.mockResolvedValue({
      id: 1,
      username: "user1",
      email: "user1@example.com",
    });

    const res = await request(app)
      .get("/users/1")
      .set("Authorization", "Bearer faketoken");

    expect(res.statusCode).toBe(200);
    expect(res.body.user).toEqual({
      id: 1,
      username: "user1",
      email: "user1@example.com",
    });
  });

  //test for all users retrival
  it("should return list of users when token is valid", async () => {
    jwt.verify.mockImplementation(() => ({ userId: 1, username: "admin" }));

    User.findAll.mockResolvedValue([
      { id: 1, username: "user1", email: "user1@example.com" },
      { id: 2, username: "user2", email: "user2@example.com" },
    ]);

    const res = await request(app)
      .get("/users")
      .set("Authorization", "Bearer faketoken");

    expect(res.statusCode).toBe(200);
    expect(res.body.users[0]).toEqual({
      id: 1,
      username: "user1",
      email: "user1@example.com",
    });
  });
});

describe("PUT /users updating user", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //to test whether the token is passed or not
  it("should return 401 if no token is provided", async () => {
    const res = await request(app).get("/users");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Access Denied");
  });

  //to test if there is any validation errors
  it("should return 422 if validation fails", async () => {
    //passing username as empty string to check validation is working or not
    jwt.verify.mockImplementation(() => ({ userId: 1, username: "admin" }));
    const res = await request(app)
      .put("/users/1")
      .set("Authorization", `Bearer faketoken`)
      .send({ username: "av" }); //username too short
    expect(res.statusCode).toBe(422);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  //test if id is passed and there is no user
  it("should return 404 if user not found by ID", async () => {
    jwt.verify.mockImplementation(() => ({ userId: 1, username: "admin" }));

    User.findByPk.mockResolvedValue(null); //no user output

    const res = await request(app)
      .put("/users/22")
      .set("Authorization", "Bearer faketoken")
      .send({ username: "newuser" });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("User not found");
  });

  //test to check whether the user new info was already taken
  it("should return 409 if username or email is already in use", async () => {
    jwt.verify.mockReturnValue({ userId: 1, username: "admin" });

    const fakeUser = {
      id: 1,
      username: "olduser",
      email: "old@example.com",
      update: jest.fn(),
    };

    User.findByPk.mockResolvedValue(fakeUser);
    User.findOne.mockResolvedValue({ id: 2 }); // Showing that there is a user already with new username or password

    const res = await request(app)
      .put("/users/1")
      .set("Authorization", "Bearer faketoken")
      .send({ username: "existinguser" });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe("Username or email already in use");
  });

  //to test user updation if the password is not given for change
  it("should update user successfully without password change", async () => {
    jwt.verify.mockReturnValue({ userId: 1, username: "admin" });

    const fakeUser = {
      id: 1,
      username: "olduser",
      email: "old@example.com",
      update: jest.fn().mockResolvedValue(),
    };

    User.findByPk.mockResolvedValue(fakeUser);
    User.findOne.mockResolvedValue(null); // No user with changing username or email

    const res = await request(app)
      .put("/users/1")
      .set("Authorization", "Bearer faketoken")
      .send({ username: "newuser", email: "new@example.com" });

    expect(res.body.message).toBe("User updated");
    expect(fakeUser.update).toHaveBeenCalledWith({
      username: "newuser",
      email: "new@example.com",
    });
  });

  it("should update user with new password", async () => {
    jwt.verify.mockReturnValue({ userId: 1 });

    const fakeUser = {
      id: 1,
      username: "olduser",
      email: "old@example.com",
      update: jest.fn().mockResolvedValue(),
    };

    User.findByPk.mockResolvedValue(fakeUser);
    User.findOne.mockResolvedValue(null); // No user using given username or password
    bcrypt.hash.mockResolvedValue("hashednewpassword");

    const res = await request(app)
      .put("/users/1")
      .set("Authorization", "Bearer faketoken")
      .send({
        username: "updateduser",
        password: "newpassword",
        email: "updated@example.com",
      });

    expect(res.body.message).toBe("User updated");
    expect(fakeUser.update).toHaveBeenCalledWith({
      username: "updateduser",
      email: "updated@example.com",
      password: "hashednewpassword",
    });
  });
});

describe("DELETE /users/:id deleting users", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //to test whether the token is passed or not
  it("should return 401 if no token is provided", async () => {
    const res = await request(app).delete("/users/1");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Access Denied");
  });

  //test if id is passed and there is no user
  it("should return 404 if user not found by ID", async () => {
    jwt.verify.mockImplementation(() => ({ userId: 1, username: "admin" }));

    User.findByPk.mockResolvedValue(null); //no user output

    const res = await request(app)
      .delete("/users/22")
      .set("Authorization", "Bearer faketoken");

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("User not found");
  });

  //test to delete user
  it("should delete user successfully", async () => {
    jwt.verify.mockReturnValue({ userId: 1, username: "admin" });

    const fakeUser = {
      id: 1,
      username: "deleteUser",
      email: "deleteUser@gmail.com",
      destroy: jest.fn(),
    };

    User.findByPk.mockResolvedValue(fakeUser);

    const res = await request(app)
      .delete("/users/1")
      .set("Authorization", "Bearer faketoken");

    expect(fakeUser.destroy).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User deleted successfully");
  });
});
