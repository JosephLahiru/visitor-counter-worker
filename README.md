# JosephLahiru visitor counter

A Cloudflare Worker that recreates the original `profile-counter.glitch.me`
green-on-black seven-digit counter. It starts at `0000000`, stores the count in
Cloudflare D1, and returns a dynamically generated SVG.

## Endpoints

- `GET /count.svg` increments and displays the counter.
- `HEAD /count.svg` checks availability without incrementing it.
- `GET /preview.svg?count=0` previews the design without incrementing it.
- `GET /health` returns a health check.

## Deploy

1. Install dependencies with `npm install`.
2. Authenticate Wrangler with `npx wrangler login`.
3. Create the database with `npm run db:create`.
4. Confirm the returned database UUID matches the D1 binding in
   `wrangler.jsonc`.
5. Apply the schema with `npm run db:migrate:remote`.
6. Deploy with `npm run deploy`.
7. Verify `/preview.svg?count=0`, then `/count.svg`.

The profile embeds the deployed endpoint at
`https://visitor-counter.joseph-rasanjana1.workers.dev/count.svg`.
