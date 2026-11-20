require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/database");
const seedDemo = require("./src/config/seedDemo");

const PORT = process.env.PORT || 5000;
connectDB()
  .then(async () => {
    if (process.env.SEED_DEMO === "true") {
      await seedDemo();
      console.log("Demo accounts ready (admin@example.com / Admin@12345, user@example.com / User@12345)");
    }
    app.listen(PORT, () => console.log(`API listening on ${PORT}`));
  })
  .catch((err) => { console.error("Startup failed:", err); process.exit(1); });
