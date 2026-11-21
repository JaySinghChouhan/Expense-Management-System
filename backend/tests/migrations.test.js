const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const migration = require("../migrations/001-expense-workflow-defaults");

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

test("adds missing workflow defaults without overwriting existing values", async () => {
  const expenses = mongoose.connection.collection("expenses");
  const legacyId = new mongoose.Types.ObjectId();
  const existingId = new mongoose.Types.ObjectId();
  const base = {
    title: "Test expense",
    amount: 10,
    category: "Other",
    date: new Date(),
    paymentMethod: "Cash",
    description: "Test",
    createdBy: new mongoose.Types.ObjectId()
  };

  await expenses.insertMany([
    { ...base, _id: legacyId },
    {
      ...base,
      _id: existingId,
      status: "approved",
      isDeleted: true,
      version: 3,
      reviewComment: "Already reviewed"
    }
  ]);

  await migration.up(mongoose);
  await migration.up(mongoose);

  const legacy = await expenses.findOne({ _id: legacyId });
  expect(legacy).toMatchObject({
    status: "pending",
    isDeleted: false,
    version: 0,
    reviewedBy: null,
    reviewedAt: null,
    reviewComment: ""
  });

  const existing = await expenses.findOne({ _id: existingId });
  expect(existing).toMatchObject({
    status: "approved",
    isDeleted: true,
    version: 3,
    reviewComment: "Already reviewed"
  });
});
