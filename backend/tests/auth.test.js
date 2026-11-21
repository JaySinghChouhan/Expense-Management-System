const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const app = require("../src/app");

let mongo;
beforeAll(async () => {
  process.env.JWT_SECRET = "test_secret_at_least_32_characters_long";
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) await collections[key].deleteMany({});
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe("Authentication API", () => {
  test("allows the deployed frontend to call the login API", async () => {
    const response = await request(app)
      .options("/api/v1/auth/login")
      .set("Origin", "https://expense-management-system-57v.vercel.app")
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "content-type");

    expect(response.headers["access-control-allow-origin"])
      .toBe("https://expense-management-system-57v.vercel.app");
  });

  test("reports the API version root as available", async () => {
    const response = await request(app).get("/api/v1");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test("registers a user and returns a JWT", async () => {
    const response = await request(app).post("/api/v1/auth/register").send({
      name: "Test User", email: "test@example.com", password: "StrongPass123"
    });
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeTruthy();
    expect(response.body.data.user.role).toBe("user");
  });

  test("rejects duplicate email registration", async () => {
    const payload = { name: "Test User", email: "test@example.com", password: "StrongPass123" };
    await request(app).post("/api/v1/auth/register").send(payload);
    const response = await request(app).post("/api/v1/auth/register").send(payload);
    expect(response.status).toBe(409);
  });

  test("logs in with valid credentials", async () => {
    const payload = { name: "Test User", email: "test@example.com", password: "StrongPass123" };
    await request(app).post("/api/v1/auth/register").send(payload);
    const response = await request(app).post("/api/v1/auth/login").send({
      email: payload.email, password: payload.password
    });
    expect(response.status).toBe(200);
    expect(response.body.data.token).toBeTruthy();
  });

  test("rejects invalid login credentials", async () => {
    const response = await request(app).post("/api/v1/auth/login").send({
      email: "nobody@example.com", password: "wrongpassword"
    });
    expect(response.status).toBe(401);
  });
});
