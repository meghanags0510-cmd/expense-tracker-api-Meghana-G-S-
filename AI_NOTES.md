# AI Notes

I used Copilot throughout this project. This document is my honest account of what the AI generated, what I reviewed/changed, and what I decided not to use.

> **Before submitting:** I added a short "in my own words" note at the end of each section below, based on what I actually saw when I ran the app myself.

## 1. What was AI-generated vs. written by me

Decisions I made myself first:
- Stack: Node.js + Express, over the FastAPI/Flask/Spring Boot/Go alternatives.
- Storage: in-memory array as the source of truth, snapshotted to a local JSON file on every mutation, instead of pure in-memory or a real database.
- API shape: `GET /expenses?category=` doing double duty for "view all" and "filter by category", and a single `GET /expenses/total` returning both the overall total and the per-category breakdown, instead of four separate endpoints. I chose this because the assignment describes "view all" + "filter" and "overall" + "by category" as paired requirements, and combining them is more idiomatic REST than adding near-duplicate routes.
- Bonus: OpenAPI/Swagger docs.
- ID strategy: Node's built-in `crypto.randomUUID()` instead of pulling in the `uuid` package.




- Designed the project structure using a layered architecture with the flow:

routes → controllers → services → data/store.js.
Created src/data/store.js to handle reading and writing expense data in a JSON file. The module also reloads the DATA_FILE environment variable whenever needed instead of storing it when the application starts, allowing tests to use separate temporary data files.

Implemented src/services/expenses.service.js, which contains the main business logic for:

adding expenses,

listing all expenses,
filtering expenses,
calculating totals,
deleting expenses, and
rounding total values to two decimal places to avoid JavaScript floating-point precision issues.

Wrote src/validators/expense.validator.js with custom validation logic instead of using any external validation libraries.
Developed the request handling and routing components:
src/controllers/expenses.controller.js
src/routes/expenses.routes.js
src/app.js
src/server.js

>  Personal note: The file I spent the most time on was src/data/store.js,src/data/service.js together with the ensureLoaded() function in expenses.service.js. "Lazy loading" didn't make sense to me at first I thought the JSON file would get read as soon as the server started. To actually see it, I added a temporary console.log inside load()and watched the terminal: it stayed quiet when the server started, only printed the first time I sent a request, and then stayed quiet again on every request after that. Seeing that with my own eyes is what made it click. I also did two separate endpoints for "view all" and "filter by category,but it explained  to combinine them behind one optional query parameter is the more better REST approach which i learnt. Along the way I also learned what is Jest (the test runner that runs tests/expenses.test.js and checks pass/fail), Swagger (the interactive /api-docs page), and OpenAPI (the underlying JSON spec format that Swagger UI reads) actually are, since none of those were things I'd used hands-on before this project and still want to learn more on jest.


## 2. What I validated, tested, or changed, and why

- Ran the full test suite (`npm test`) — all 17 tests passed on a clean `npm install`:
  - valid add → `201`; 7 distinct invalid-input cases (missing title/amount/category, negative amount, zero amount, invalid date, blank title) → `400` with a populated `errors` array
  - list all, filter by category, and the "no matches" empty-array case
  - totals with multiple expenses across two categories, and the zero-expenses case (`{ overall: 0, byCategory: {} }`)
  - delete existing (`200`) and delete non-existent (`404`)
  - confirmed the on-disk JSON file actually reflects the in-memory state after a mutation, not just the HTTP response
  - confirmed `GET /api-docs.json` returns a spec containing the `/expenses` path
- Manually exercised the running server with `curl`: started `npm start`, then walked through add → list → filter → totals → delete → delete-again(404), and inspected `data/expenses.json` on disk after each mutation to make sure persistence wasn't just working "in theory" in the tests.
- Checked the floating-point edge case by hand: `4.5 + 10.25 + 2` totals correctly as `16.75` (not `16.749999999999998`) because of the rounding step I asked the AI to add in `getTotals()`.

- Reset `data/expenses.json` to `[]` before treating the repo as submission-ready, since it had test data in it from my manual `curl` walkthrough.

> Personal note: I ran the server myself with npm start and hit real problems that taught me things the tests alone didn't. First, I got an EADDRINUSE: address already in use :::3000 error I learned this means another process is already listening on that port, usually a server I'd started earlier and not actually stopped (running npm start again doesn't replace the old one; you have to stop it first or use a different port). Second, I accidentally typed a URL directly into the terminal instead of using curl and got zsh: no such file or directory I learned a terminal doesn't know to "fetch" a URL unless you tell it to with a tool like curl, or you paste it into a browser instead. Third, I pressed Ctrl+C while trying to type into the same terminal that had npm start running , which killed my own server I learned npm start blocks that terminal until you stop it, so you need a second terminal window/tab open to send curl requests while the server keeps running in the first one. After fixing all three, I used Swagger UI (/api-docs) to add a couple of real expenses by hand, then confirmed with curl http://localhost:3000/expenses, ?category=Food, and /expenses/totalthat the responses matched what I calculated myself by hand, and I also verified those same expenses were sitting in data/ expenses.json` on disk.

## 3. AI suggestions I considered and did not use

- A validation library (Joi or Zod) instead of hand-rolled validators. The AI's first instinct for input validation would typically reach for a schema library. I kept it as a small, dependency-free function in `src/validators/expense.validator.js` instead — for an API this size, a library adds a dependency and a bit of indirection for validation rules I can read in ten lines, and it keeps `npm install` smaller and faster to audit.

- **Auto-incrementing integer IDs.** This would have been simpler to eyeball in tests, but it doesn't survive deletes well (reused/gappy ids) and doesn't reflect how a real API would generate ids. `crypto.randomUUID()` avoided the tradeoff for free.
