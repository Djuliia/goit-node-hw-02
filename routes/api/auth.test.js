const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../../app");
const bcrypt = require("bcrypt");

const { DB_HOST_TEST, PORT = 3000 } = process.env;

describe("test /users/login route", () => {
  let server = null;
  let response = null;

  beforeAll(async () => {
    await mongoose.connect(DB_HOST_TEST);
    server = app.listen(PORT);
  });

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash("122345", 10);
    const testUser = {
      email: "iv@mail.com",
      password: hashedPassword,
      verify: true,
      _id: "someid",
      subscription: "starter",
    };

    await mongoose.connection.collection("users").insertOne(testUser);

    response = await request(app).post("/users/login").send({
      email: "iv@mail.com",
      password: "122345",
    });
  });

  afterEach(async () => {
    await mongoose.connection.collection("users").deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
    server.close();
  });

  test("response - statusCode(200)", async () => {
    expect(response.statusCode).toBe(200);
  });

  it("response - token", async () => {
    expect(response.body.token).toBeDefined();
  });

  it("response - user={email, subscription}", async () => {
    expect(response.body.user).toEqual({
      email: "iv@mail.com",
      subscription: "starter",
    });
  });

  it("typeOf of email and subscription - string", async () => {
    const { email, subscription } = response.body.user;
    expect(typeof email).toBe("string");
    expect(typeof subscription).toBe("string");
  });
});
