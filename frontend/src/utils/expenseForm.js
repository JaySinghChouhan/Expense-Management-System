export function expenseFormErrors(form) {
  const errors = [];
  if (!form.title?.trim()) errors.push("Title is required");
  if (!Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0) errors.push("Amount must be greater than zero");
  if (!form.category?.trim()) errors.push("Category is required");
  if (!form.date) errors.push("Date is required");
  if (!form.paymentMethod) errors.push("Payment method is required");
  if (!form.description?.trim()) errors.push("Description is required");
  return errors;
}

export function expensePayload(form) {
  return {
    title: form.title.trim(),
    amount: Number(form.amount),
    category: form.category.trim(),
    date: form.date,
    paymentMethod: form.paymentMethod,
    description: form.description.trim()
  };
}
