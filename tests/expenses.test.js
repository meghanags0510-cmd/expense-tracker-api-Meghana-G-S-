const request = require('supertest');
const fs = require('fs');
const { createTestContext } = require('./helpers/testServer');

describe('Expense Tracker API', () => {
  let ctx;

  beforeEach(() => {
    ctx = createTestContext();
  });

  afterEach(() => {
    ctx.cleanup();
  });

  describe('POST /expenses', () => {
    test('creates a valid expense and returns 201', async () => {
      const res = await request(ctx.app).post('/expenses').send({
        title: 'Coffee',
        amount: 4.5,
        category: 'Food',
        date: '2026-07-01',
      });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        title: 'Coffee',
        amount: 4.5,
        category: 'Food',
        date: '2026-07-01',
      });
      expect(res.body.id).toBeDefined();
    });

    const invalidCases = [
      ['missing title', { amount: 4.5, category: 'Food', date: '2026-07-01' }],
      ['missing amount', { title: 'Coffee', category: 'Food', date: '2026-07-01' }],
      ['negative amount', { title: 'Coffee', amount: -5, category: 'Food', date: '2026-07-01' }],
      ['zero amount', { title: 'Coffee', amount: 0, category: 'Food', date: '2026-07-01' }],
      ['missing category', { title: 'Coffee', amount: 4.5, date: '2026-07-01' }],
      ['invalid date', { title: 'Coffee', amount: 4.5, category: 'Food', date: 'not-a-date' }],
      ['blank title', { title: '   ', amount: 4.5, category: 'Food', date: '2026-07-01' }],
    ];

    test.each(invalidCases)('rejects invalid input: %s', async (_label, body) => {
      const res = await request(ctx.app).post('/expenses').send(body);
      expect(res.status).toBe(400);
      expect(Array.isArray(res.body.errors)).toBe(true);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('GET /expenses', () => {
    test('lists all expenses', async () => {
      await request(ctx.app)
        .post('/expenses')
        .send({ title: 'Coffee', amount: 4.5, category: 'Food', date: '2026-07-01' });
      await request(ctx.app)
        .post('/expenses')
        .send({ title: 'Bus', amount: 2, category: 'Transport', date: '2026-07-02' });

      const res = await request(ctx.app).get('/expenses');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    test('filters by category via ?category= query param', async () => {
      await request(ctx.app)
        .post('/expenses')
        .send({ title: 'Coffee', amount: 4.5, category: 'Food', date: '2026-07-01' });
      await request(ctx.app)
        .post('/expenses')
        .send({ title: 'Bus', amount: 2, category: 'Transport', date: '2026-07-02' });

      const res = await request(ctx.app).get('/expenses?category=Food');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe('Coffee');
    });

    test('returns an empty array for a category with no matches', async () => {
      const res = await request(ctx.app).get('/expenses?category=Nonexistent');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('GET /expenses/total', () => {
    test('computes the overall total and per-category totals', async () => {
      await request(ctx.app)
        .post('/expenses')
        .send({ title: 'Coffee', amount: 4.5, category: 'Food', date: '2026-07-01' });
      await request(ctx.app)
        .post('/expenses')
        .send({ title: 'Lunch', amount: 10.25, category: 'Food', date: '2026-07-02' });
      await request(ctx.app)
        .post('/expenses')
        .send({ title: 'Bus', amount: 2, category: 'Transport', date: '2026-07-03' });

      const res = await request(ctx.app).get('/expenses/total');

      expect(res.status).toBe(200);
      expect(res.body.overall).toBeCloseTo(16.75);
      expect(res.body.byCategory.Food).toBeCloseTo(14.75);
      expect(res.body.byCategory.Transport).toBeCloseTo(2);
    });

    test('returns zeroed totals when there are no expenses yet', async () => {
      const res = await request(ctx.app).get('/expenses/total');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ overall: 0, byCategory: {} });
    });
  });

  describe('DELETE /expenses/:id', () => {
    test('deletes an existing expense', async () => {
      const created = await request(ctx.app)
        .post('/expenses')
        .send({ title: 'Coffee', amount: 4.5, category: 'Food', date: '2026-07-01' });
      const { id } = created.body;

      const res = await request(ctx.app).delete(`/expenses/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(id);

      const listRes = await request(ctx.app).get('/expenses');
      expect(listRes.body).toHaveLength(0);
    });

    test('returns 404 when deleting a non-existent id', async () => {
      const res = await request(ctx.app).delete('/expenses/does-not-exist');
      expect(res.status).toBe(404);
    });
  });

  describe('persistence', () => {
    test('flushes the in-memory store to the JSON data file after a mutation', async () => {
      await request(ctx.app)
        .post('/expenses')
        .send({ title: 'Coffee', amount: 4.5, category: 'Food', date: '2026-07-01' });

      const onDisk = JSON.parse(fs.readFileSync(ctx.dataFile, 'utf8'));
      expect(onDisk).toHaveLength(1);
      expect(onDisk[0].title).toBe('Coffee');
    });
  });

  describe('GET /api-docs.json', () => {
    test('serves a generated OpenAPI spec', async () => {
      const res = await request(ctx.app).get('/api-docs.json');

      expect(res.status).toBe(200);
      expect(res.body.openapi).toBeDefined();
      expect(res.body.paths['/expenses']).toBeDefined();
    });
  });
});
