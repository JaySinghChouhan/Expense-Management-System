require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const mongoose = require("mongoose");

async function runMigrations() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");

  try {
    await mongoose.connect(process.env.MONGO_URI);
    const migrationCollection = mongoose.connection.collection("schema_migrations");
    const directory = path.join(__dirname, "..", "migrations");
    const files = fs.readdirSync(directory).filter((file) => file.endsWith(".js")).sort();

    for (const file of files) {
      const migration = require(path.join(directory, file));
      if (!migration.id || typeof migration.up !== "function") {
        throw new Error(`Invalid migration: ${file}`);
      }

      if (await migrationCollection.findOne({ _id: migration.id })) continue;

      await migration.up(mongoose);
      await migrationCollection.insertOne({ _id: migration.id, appliedAt: new Date() });
      console.log(`Applied migration ${migration.id}`);
    }
  } finally {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  }
}

runMigrations().catch((error) => {
  console.error("Migration failed:", error);
  process.exitCode = 1;
});
