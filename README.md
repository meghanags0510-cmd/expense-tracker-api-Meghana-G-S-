# Smart Expense Tracker API

A small REST API for tracking personal expenses: add an expense, list/filter them by category, get overall and per-category totals, and delete an expense. Built with **Node.js + Express**, data is stored in-memory and persisted to a local JSON file (no database).

**Bonus feature implemented:** interactive OpenAPI/Swagger docs at `/api-docs`.

## Tech stack

- Node.js (v18+ recommended; developed/tested on Node v22) + Express
- In-memory array backed by a JSON file (`data/expenses.json`) for persistence across restarts
- `swagger-jsdoc` + `swagger-ui-express` for the OpenAPI/Swagger docs bonus
- Jest + Supertest for testing

## Project structure

expense-tracker-api/
  src/
    server.js                    # entry point
    app.js                       # Express app, middleware, route mounting
    data/store.js                # JSON file load/save
    services/expenses.service.js # business logic (add/list/filter/totals/delete)
    controllers/expenses.controller.js
    routes/expenses.routes.js
    validators/expense.validator.js
    docs/openapi.js              # Swagger spec generation
  tests/
    expenses.test.js
    helpers/testServer.js        # spins up an isolated app + temp data file per test
  data/expenses.json             # runtime data file (created automatically if missing)


## Install

```bash
npm install
```

## Run the server

```bash
npm start
```

The server starts on `http://localhost:3000` by default. Swagger UI is available at `http://localhost:3000/api-docs`, and the raw OpenAPI JSON at `http://localhost:3000/api-docs.json`.

Optional environment variables:
- `PORT` — port to listen on (default `3000`)
- `DATA_FILE` — path to the JSON file used for persistence (default `data/expenses.json`)

//Run the tests//
```bash
npm test
```

This runs the full Jest + Supertest suite (`tests/expenses.test.js`). Each test spins up the app against its own temporary JSON file in the OS temp directory, so tests are isolated from each other and never touch `data/expenses.json`.

## API reference

All request/response bodies are JSON. Base URL: `http://localhost:3000`.

### Add an expense

`POST /expenses`

Request body:

```json
{ "title": "Coffee", "amount": 4.5, "category": "Food", "date": "2026-07-01" }
```

- `title`, `category`: non-empty strings
- `amount`: positive number
- `date`: string in `YYYY-MM-DD` format

Responses:
- `201 Created` with the created expense (includes a generated `id`)
- `400 Bad Request` with `{ "errors": [...] }` if validation fails

### View all expenses / filter by category

`GET /expenses`
`GET /expenses?category=Food`

Returns `200 OK` with an array of expenses. Passing `?category=` filters to expenses whose `category` exactly matches the given value; omitting it returns every expense.

### Totals (overall and by category)

`GET /expenses/total`

Returns `200 OK`:

```json
{ "overall": 16.75, "byCategory": { "Food": 14.75, "Transport": 2 } }
```

### Delete an expense

`DELETE /expenses/:id`

- `200 OK` with the deleted expense if it existed
- `404 Not Found` if no expense with that id exists

### Health check

`GET /health` → `{ "status": "ok" }`

### Swagger / OpenAPI docs (bonus)

- `GET /api-docs` — interactive Swagger UI
- `GET /api-docs.json` — raw OpenAPI 3.0 spec

## Manual smoke test (optional)

With the server running (`npm start`), in another terminal:

```bash
curl -X POST http://localhost:3000/expenses \
  -H "Content-Type: application/json" \
  -d '{"title":"Coffee","amount":4.5,"category":"Food","date":"2026-07-01"}'

curl http://localhost:3000/expenses
curl "http://localhost:3000/expenses?category=Food"
curl http://localhost:3000/expenses/total
curl -X DELETE http://localhost:3000/expenses/<id-from-above>
```

## Notes on design decisions

- `GET /expenses` doubles as both "view all" and "filter by category" via an optional `?category=` query param, which is the idiomatic REST way to express this rather than two separate endpoints.
- `GET /expenses/total` returns both the overall total and the per-category breakdown in one response, since the assignment describes them as one combined requirement.
- IDs are generated with Node's built-in `crypto.randomUUID()` — no extra dependency needed.
- Category filtering/grouping is exact-match (case-sensitive) on the stored string; categories are trimmed on input but not case-normalized. This is documented here as the single source of truth for that behavior.
- See `AI_NOTES.md` for how AI tools were used while building this.
