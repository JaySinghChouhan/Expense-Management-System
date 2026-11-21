const { query } = require("express-validator");
const validate = require("../middleware/validate.middleware");

module.exports = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("search").optional().trim().isLength({ max: 80 }),
  query("status").optional({ values: "falsy" }).isIn(["pending", "approved", "rejected"]),
  query("category").optional().trim().isLength({ max: 60 }),
  query("from").optional().isISO8601(),
  query("to").optional().isISO8601(),
  query("sortBy").optional().isIn(["date", "amount", "title", "createdAt"]),
  query("order").optional().isIn(["asc", "desc"]),
  validate
];
