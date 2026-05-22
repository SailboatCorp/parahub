# ParaHub V1, Cloudflare Pages + D1 + R2

This is a working V1 web app for ParaHub.

It includes:

- Username and password login
- First-launch admin setup
- Admin-created local accounts, no email login
- Investigation creation
- Room creation and base camp selection
- Assigned case access
- Mobile field logger
- Shared timeline
- Manual EMF, temperature, sound, motion, and note logs
- Voice note recording/upload
- Photo note upload/camera capture
- Cloudflare D1 database storage
- Cloudflare R2 media storage

## Binding names you must use

Cloudflare Pages needs these exact bindings:

```text
DB
MEDIA
```

`DB` must point to your Cloudflare D1 database.

`MEDIA` must point to your Cloudflare R2 bucket.

## Files that matter

```text
schema.sql             Database tables for D1
functions/             Cloudflare Pages Functions backend
src/                   React frontend
package.json           Build setup
vite.config.js         Vite config
wrangler.toml.example  Optional local development reference
```

## Step 1, upload this project to GitHub

On your Chromebook:

1. Extract the zip.
2. Go to GitHub.
3. Create a new repository called `parahub`.
4. Upload all extracted files into the repo.
5. Commit the files.

Do not upload the zip itself into the repo. Upload the contents of the extracted folder.

## Step 2, create your D1 database

In Cloudflare:

1. Go to **Workers & Pages**.
2. Go to **D1**.
3. Create a database called:

```text
parahub-db
```

4. Open the database.
5. Go to the SQL console.
6. Open `schema.sql` from this project.
7. Copy all of it.
8. Paste it into the SQL console.
9. Run it.

## Step 3, create your R2 bucket

In Cloudflare:

1. Go to **R2**.
2. Create a bucket called:

```text
parahub-media
```

Use Standard storage.

This is where photo notes and voice notes are stored.

## Step 4, deploy the React app to Cloudflare Pages

In Cloudflare:

1. Go to **Workers & Pages**.
2. Select **Create application**.
3. Choose **Pages**.
4. Choose **Import from GitHub**.
5. Pick your `parahub` repository.
6. Use these build settings:

```text
Framework preset: None or Vite
Build command: npm run build
Build output directory: dist
```

7. Deploy it.

The first deployment may fail until the bindings are added. That is normal.

## Step 5, add Cloudflare bindings

Open your Pages project.

Go to:

```text
Settings → Bindings
```

Add a D1 database binding:

```text
Variable name: DB
Database: parahub-db
```

Add an R2 bucket binding:

```text
Variable name: MEDIA
Bucket: parahub-media
```

Save.

Then redeploy the Pages project.

## Step 6, add your subdomain

Open your Pages project.

Go to:

```text
Custom domains → Set up a domain
```

Use:

```text
parahub.kaidenuk.org
```

Cloudflare should create the DNS record automatically because your domain is already managed by Cloudflare.

## Step 7, first launch

Open your deployed app.

You should see:

```text
Create your ParaHub admin account
```

Create your admin username and password.

Then log in.

## Step 8, create investigator accounts

Inside ParaHub:

1. Click **Team accounts**.
2. Create an account for each investigator.
3. Give each person their username and password.

No email is required.

## Step 9, create an investigation

1. Click **New investigation**.
2. Add case name, location, date, and lead investigator.
3. Add rooms.
4. Mark base camp.
5. Assign investigators.
6. Create the case.

## Step 10, use it live

Admin account:

- Opens the admin hub.
- Watches incoming timeline logs.
- Uses control checks.
- Can add notes too.

Investigator account:

- Logs in on phone.
- Opens assigned case.
- Selects current room.
- Logs readings.
- Records voice notes.
- Uploads or takes photo notes.

Viewer account:

- Can view assigned timelines.
- Cannot edit or add events.

## Important V1 limitations

- This version uses polling every few seconds, not true live websockets.
- Event deletion is intentionally disabled in the frontend to preserve evidence history.
- Video upload is not included yet.
- Hardware camera panels and USB sensor bridges are not included yet.
- File uploads are limited to 25 MB each.

## Best practice during investigations

Use short audio clips. Avoid uploading huge files. For V1, voice notes and photos are intended as quick evidence markers, not full video archival storage.
