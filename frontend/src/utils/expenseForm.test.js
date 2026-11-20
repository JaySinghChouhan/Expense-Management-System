import { describe, expect, test } from "vitest";
import { expenseFormErrors, expensePayload } from "./expenseForm";

const valid = {
  title: " Airport cab ",
  amount: "450.5",
  category: " Travel ",
  date: "2026-11-20",
  paymentMethod: "UPI",
  description: " Drop to terminal "
};

describe("expense form", () => {
  test("rejects a blank description and a non-positive amount", () => {
    const errors = expenseFormErrors({ ...valid, amount: "0", description: "   " });
    expect(errors).toContain("Amount must be greater than zero");
    expect(errors).toContain("Description is required");
  });

  test("accepts a complete claim and trims text fields", () => {
    expect(expenseFormErrors(valid)).toEqual([]);
    expect(expensePayload(valid)).toEqual({
      title: "Airport cab",
      amount: 450.5,
      category: "Travel",
      date: "2026-11-20",
      paymentMethod: "UPI",
      description: "Drop to terminal"
    });
  });
});
