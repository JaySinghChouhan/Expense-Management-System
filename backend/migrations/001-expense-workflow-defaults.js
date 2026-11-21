module.exports = {
  id: "001-expense-workflow-defaults",
  async up(mongoose) {
    const collections = mongoose.connection.db.listCollections({ name: "expenses" }, { nameOnly: true });
    if (!(await collections.hasNext())) return;

    const expenses = mongoose.connection.collection("expenses");
    const defaults = {
      status: "pending",
      isDeleted: false,
      version: 0,
      reviewedBy: null,
      reviewedAt: null,
      reviewComment: ""
    };

    for (const [field, value] of Object.entries(defaults)) {
      await expenses.updateMany({ [field]: { $exists: false } }, { $set: { [field]: value } });
    }
  }
};
