const expensesService = require('../services/expenses.service');
const { validateNewExpense } = require('../validators/expense.validator');

function createExpense(req, res) {
  const errors = validateNewExpense(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const { title, amount, category, date } = req.body;
  const expense = expensesService.addExpense({ title, amount, category, date });
  return res.status(201).json(expense);
}

function listExpenses(req, res) {
  const { category } = req.query;
  const expenses = expensesService.getExpenses(category);
  return res.status(200).json(expenses);
}

function getTotals(req, res) {
  const totals = expensesService.getTotals();
  return res.status(200).json(totals);
}

function removeExpense(req, res) {
  const { id } = req.params;
  const removed = expensesService.deleteExpense(id);
  if (!removed) {
    return res.status(404).json({ error: `Expense with id ${id} was not found.` });
  }
  return res.status(200).json(removed);
}

module.exports = { createExpense, listExpenses, getTotals, removeExpense };
