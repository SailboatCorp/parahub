# ParaHub Worker Build Fix

This version is for the Cloudflare project that requires a Deploy command.
It deploys as a Cloudflare Worker with static assets, not as a normal Pages-only project.

Cloudflare build settings:

Build command:
`npm run build`

Deploy command:
`npx wrangler deploy`

Non-production branch deploy command:
leave blank if Cloudflare allows it. If it is required, use:
`npx wrangler deploy`

Path:
`/`

Before pushing, open `wrangler.toml` and replace:
`REPLACE_WITH_YOUR_D1_DATABASE_ID`

with your real D1 database ID from:
Cloudflare -> Workers & Pages -> D1 -> parahub-db -> Settings -> Database ID

No R2 is used. Only D1 is required.
