# GarmentOS

Garment Manufacturing & Export Management Platform (university project).
React + Vite + Tailwind frontend, Node + Express REST API. All factory data is fictional demo data.

## Status

| Working now (demo data) | Not built yet |
| --- | --- |
| Dashboard KPIs calculated from the records | Orders & Merchandising page (Stage 2) |
| Production, Inventory, Quality Control, Shipment & Export, Reports & Analytics, Delay Risk Analysis pages | Dashboard charts (Stage 2) |
| Add/receive/issue/record forms with validation (changes reset on reload) | Saving to PostgreSQL and REST endpoints for these modules (Stages 6-7) |
| Light/dark theme toggle, collapsible sidebar, reusable components | Deployment guide and full documentation (Stages 9-10) |
| Express API with `/api/health`, dotenv, CORS, error handling, tests | |

The module pages read fictional records from `client/src/data/demoData.js` through
`client/src/api/moduleApi.js`. This is a demo-data adapter, not a database. Later stages replace
that one file with Fetch calls to the REST API; the pages stay the same.

## Run locally

```bash
npm run install:all                      # installs root, client and server packages
cp server/.env.example server/.env       # backend settings (never commit .env)
cp client/.env.example client/.env       # VITE_API_BASE_URL
npm test                                 # backend tests
npm run dev                              # API on :5000, website on :5173
npm run build                            # production build of the client
```

## Folder structure

```
client/   React frontend (Member 1)    src/api, components/layout, components/ui, context, hooks, pages
server/   Express API (Member 2)       src/config, middleware, routes, utils, test
```

## Where the required JavaScript topics appear

| Topic | Example file |
| --- | --- |
| Arrow functions, `map()` | `client/src/components/layout/Sidebar.jsx`, `ui/DataTable.jsx` |
| `filter()` | `client/src/pages/DesignSystemPage.jsx` (search + status filter) |
| Destructuring | `NAV_ITEMS.map(({ label, path, icon: Icon }) => ...)` in `Sidebar.jsx` |
| `find()` | added with order details in Stage 2 |
| dotenv | `server/src/config/env.js` |
| REST + response shape | `server/src/routes`, `server/src/utils/response.js` |
| Fetch, async/await, `response.ok`, try/catch | `client/src/api/client.js` |
| State management | `client/src/context/AppContext.jsx`, `hooks/useFetch.js` |
| Semantic HTML | `<aside>`, `<nav>`, `<header>`, `<main>`, `<footer>`, `<section>`, `<article>` in layout and UI components |
