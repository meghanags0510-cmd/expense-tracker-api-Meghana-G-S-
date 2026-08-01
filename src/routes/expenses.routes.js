const express = require('express');
const controller = require('../controllers/expenses.controller');

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Expense:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         amount:
 *           type: number
 *         category:
 *           type: string
 *         date:
 *           type: string
 *           example: "2026-07-15"
 *     NewExpense:
 *       type: object
 *       required: [title, amount, category, date]
 *       properties:
 *         title:
 *           type: string
 *         amount:
 *           type: number
 *         category:
 *           type: string
 *         date:
 *           type: string
 *           example: "2026-07-15"
 *     Totals:
 *       type: object
 *       properties:
 *         overall:
 *           type: number
 *         byCategory:
 *           type: object
 *           additionalProperties:
 *             type: number
 */

/**
 * @openapi
 * /expenses:
 *   post:
 *     summary: Add a new expense
 *     tags: [Expenses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewExpense'
 *     responses:
 *       201:
 *         description: Expense created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *       400:
 *         description: Validation error
 *   get:
 *     summary: List all expenses, optionally filtered by category
 *     tags: [Expenses]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter expenses to a single category (exact match)
 *     responses:
 *       200:
 *         description: List of expenses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Expense'
 */
router.post('/', controller.createExpense);
router.get('/', controller.listExpenses);

/**
 * @openapi
 * /expenses/total:
 *   get:
 *     summary: Get the overall total and per-category totals
 *     tags: [Expenses]
 *     responses:
 *       200:
 *         description: Totals
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Totals'
 */
router.get('/total', controller.getTotals);

/**
 * @openapi
 * /expenses/{id}:
 *   delete:
 *     summary: Delete an expense by id
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The deleted expense
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *       404:
 *         description: Expense not found
 */
router.delete('/:id', controller.removeExpense);

module.exports = router;
