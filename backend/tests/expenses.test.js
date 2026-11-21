const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");

let mongo;

const claim = {
  title: "Airport cab",
  amount: 450,
  category: "Travel",
  date: "2026-11-20",
  paymentMethod: "UPI",
  description: "Drop to the terminal"
};

beforeAll(async () => {
  process.env.JWT_SECRET = "test_secret_at_least_32_characters_long";
  mongo = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongo.getUri();
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

async function tokenFor(email, role = "user") {
  await request(app).post("/api/v1/auth/register").send({
    name: "Test User", email, password: "StrongPass123"
  });
  if (role === "admin") await User.updateOne({ email }, { role: "admin" });
  const login = await request(app).post("/api/v1/auth/login").send({
    email, password: "StrongPass123"
  });
  return login.body.data.token;
}

function auth(token) {
  return { Authorization: `Bearer ${token}` };
}

describe("Expense API", () => {
  test("requires authentication", async () => {
    const response = await request(app).get("/api/v1/expenses");
    expect(response.status).toBe(401);
  });

  test("creates, lists, updates, and soft-deletes a pending expense", async () => {
    const token = await tokenFor("owner@example.com");
    const created = await request(app).post("/api/v1/expenses").set(auth(token)).send(claim);
    expect(created.status).toBe(201);
    expect(created.body.data.status).toBe("pending");
    const id = created.body.data._id;

    const fetched = await request(app).get(`/api/v1/expenses/${id}`).set(auth(token));
    expect(fetched.status).toBe(200);
    expect(fetched.body.data._id).toBe(id);

    const listed = await request(app).get("/api/v1/expenses").set(auth(token)).query({ search: "Airport", sortBy: "amount", order: "asc" });
    expect(listed.status).toBe(200);
    expect(listed.body.meta.total).toBe(1);
    expect(listed.body.data[0].title).toBe("Airport cab");

    const updated = await request(app).patch(`/api/v1/expenses/${id}`).set(auth(token)).send({
      amount: 500, version: created.body.data.version
    });
    expect(updated.status).toBe(200);
    expect(updated.body.data.amount).toBe(500);

    const missingVersion = await request(app).patch(`/api/v1/expenses/${id}`).set(auth(token)).send({ amount: 600 });
    expect(missingVersion.status).toBe(400);

    const staleVersion = await request(app).patch(`/api/v1/expenses/${id}`).set(auth(token)).send({
      amount: 600, version: created.body.data.version
    });
    expect(staleVersion.status).toBe(409);

    const removed = await request(app).delete(`/api/v1/expenses/${id}`).set(auth(token));
    expect(removed.status).toBe(200);
    const afterDelete = await request(app).get(`/api/v1/expenses/${id}`).set(auth(token));
    expect(afterDelete.status).toBe(404);
  });

  test("accepts the frontend's empty status filter", async () => {
    const token = await tokenFor("empty-filter@example.com");
    const response = await request(app)
      .get("/api/v1/expenses?search=&status=&category=&sortBy=date&order=desc&page=1&limit=8")
      .set(auth(token));

    expect(response.status).toBe(200);
    expect(response.body.meta.total).toBe(0);
  });

  test("rejects a claim that is missing a description", async () => {
    const token = await tokenFor("owner@example.com");
    const response = await request(app).post("/api/v1/expenses").set(auth(token)).send({ ...claim, description: " " });
    expect(response.status).toBe(400);
  });

  test("isolates records so one user cannot read another user's expense", async () => {
    const owner = await tokenFor("owner@example.com");
    const other = await tokenFor("other@example.com");
    const created = await request(app).post("/api/v1/expenses").set(auth(owner)).send(claim);
    const hidden = await request(app).get(`/api/v1/expenses/${created.body.data._id}`).set(auth(other));
    expect(hidden.status).toBe(404);
    const list = await request(app).get("/api/v1/expenses").set(auth(other));
    expect(list.body.meta.total).toBe(0);
  });

  test("lets an admin approve once and records the audit fields", async () => {
    const owner = await tokenFor("owner@example.com");
    const admin = await tokenFor("admin@example.com", "admin");
    const member = await tokenFor("member@example.com");
    const created = await request(app).post("/api/v1/expenses").set(auth(owner)).send(claim);
    const id = created.body.data._id;

    const forbidden = await request(app).post(`/api/v1/expenses/${id}/approve`).set(auth(member)).send({ comment: "nope" });
    expect(forbidden.status).toBe(403);

    const approved = await request(app).post(`/api/v1/expenses/${id}/approve`).set(auth(admin)).send({ comment: "Looks valid" });
    expect(approved.status).toBe(200);
    expect(approved.body.data.status).toBe("approved");
    expect(approved.body.data.reviewComment).toBe("Looks valid");
    expect(approved.body.data.reviewedAt).toBeTruthy();

    const again = await request(app).post(`/api/v1/expenses/${id}/approve`).set(auth(admin)).send({});
    expect(again.status).toBe(409);

    const editAfterReview = await request(app).patch(`/api/v1/expenses/${id}`).set(auth(owner)).send({
      title: "Changed", version: created.body.data.version
    });
    expect(editAfterReview.status).toBe(409);
  });

  test("lets only an admin reject once and records the rejection audit fields", async () => {
    const owner = await tokenFor("reject-owner@example.com");
    const admin = await tokenFor("reject-admin@example.com", "admin");
    const member = await tokenFor("reject-member@example.com");
    const created = await request(app).post("/api/v1/expenses").set(auth(owner)).send(claim);
    const id = created.body.data._id;

    const forbidden = await request(app).post(`/api/v1/expenses/${id}/reject`).set(auth(member)).send({ comment: "Not approved" });
    expect(forbidden.status).toBe(403);

    const missingComment = await request(app).post(`/api/v1/expenses/${id}/reject`).set(auth(admin)).send({});
    expect(missingComment.status).toBe(400);

    const rejected = await request(app).post(`/api/v1/expenses/${id}/reject`).set(auth(admin)).send({ comment: "Missing receipt" });
    expect(rejected.status).toBe(200);
    expect(rejected.body.data.status).toBe("rejected");
    expect(rejected.body.data.reviewedBy).toBeTruthy();
    expect(rejected.body.data.reviewedAt).toBeTruthy();
    expect(rejected.body.data.reviewComment).toBe("Missing receipt");

    const again = await request(app).post(`/api/v1/expenses/${id}/reject`).set(auth(admin)).send({ comment: "Not approved" });
    expect(again.status).toBe(409);
  });

  test("returns yearly totals and a CSV export for the caller's own rows", async () => {
    const owner = await tokenFor("owner@example.com");
    await request(app).post("/api/v1/expenses").set(auth(owner)).send(claim);
    await request(app).post("/api/v1/expenses").set(auth(owner)).send({
      ...claim, title: "Lunch", amount: 300, category: "Meals", description: "Team lunch"
    });

    const summary = await request(app).get("/api/v1/dashboard/summary").set(auth(owner)).query({ year: 2026 });
    expect(summary.status).toBe(200);
    expect(summary.body.data.total).toBe(750);
    expect(summary.body.data.highest.amount).toBe(450);
    expect(summary.body.data.monthly.find((month) => month.month === "Nov").total).toBe(750);
    expect(summary.body.data.statuses.find((row) => row._id === "pending").count).toBe(2);

    const csv = await request(app).get("/api/v1/reports/expenses/export").set(auth(owner)).query({ category: "Travel" });
    expect(csv.status).toBe(200);
    expect(csv.headers["content-type"]).toMatch(/text\/csv/);
    expect(csv.text).toContain("Airport cab");
    expect(csv.text).not.toContain("Team lunch");
  });

  test("rejects malformed expense list filters", async () => {
    const token = await tokenFor("filter-owner@example.com");
    const response = await request(app)
      .get("/api/v1/expenses?page=0&status=unknown")
      .set(auth(token));

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
