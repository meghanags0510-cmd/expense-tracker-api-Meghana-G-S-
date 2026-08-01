const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidDate(value) {
  if (!DATE_PATTERN.test(value)) return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

function validateNewExpense(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return ['Request body must be a JSON object.'];
  }

  const { title, amount, category, date } = body;

  if (!isNonEmptyString(title)) {
    errors.push('title is required and must be a non-empty string.');
  }

  if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
    errors.push('amount is required and must be a positive number.');
  }

  if (!isNonEmptyString(category)) {
    errors.push('category is required and must be a non-empty string.');
  }

  if (!isNonEmptyString(date) || !isValidDate(date)) {
    errors.push('date is required and must be a valid date string in YYYY-MM-DD format.');
  }

  return errors;
}

module.exports = { validateNewExpense };
