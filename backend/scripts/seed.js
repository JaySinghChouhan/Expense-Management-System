require("dotenv").config();
const mongoose = require("mongoose");
const seedDemo = require("../src/config/seedDemo");

(async () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");
  await mongoose.connect(process.env.MONGO_URI);
  await seedDemo();
  console.log("Seed complete. Admin: admin@example.com / Admin@12345. User: user@example.com / User@12345");
  await mongoose.disconnect();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
