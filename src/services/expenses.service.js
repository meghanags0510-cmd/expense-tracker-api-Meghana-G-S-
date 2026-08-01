const crypto = require('crypto');
const store = require('../data/store');

let expenses = null;

function ensureLoaded() {
  if (expenses === null) {
    expenses = store.load();
  }
  return expenses;
}

function reset() {
  expenses = null;
}

function addExpense({ title, amount, category, date }) {
  const list = ensureLoaded();
  const expense = {
    id: crypto.randomUUID(),
    title: title.trim(),
    amount,
    category: category.trim(),
    date,
  };
  list.push(expense);
  store.save(list);
  return expense;
}

function getExpenses(category) {
  const list = ensureLoaded();
  if (!category) return [...list];
  return list.filter((expense) => expense.category === category);
}

function getTotals() {
  const list = ensureLoaded();
  const byCategory = {};
  let overall = 0;

  for (const expense of list) {
    overall += expense.amount;
    byCategory[expense.category] = (byCategory[expense.category] || 0) + expense.amount;
  }

  overall = Math.round(overall * 100) / 100;
  for (const key of Object.keys(byCategory)) {
    byCategory[key] = Math.round(byCategory[key] * 100) / 100;
  }

  return { overall, byCategory };
}

function deleteExpense(id) {
  const list = ensureLoaded();
  const index = list.findIndex((expense) => expense.id === id);
  if (index === -1) return null;
  const [removed] = list.splice(index, 1);
  store.save(list);
  return removed;
}

module.exports = { addExpense, getExpenses, getTotals, deleteExpense, reset };
