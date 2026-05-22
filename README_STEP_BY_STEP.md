# ParaHub V1, Cloudflare Pages + D1 only

This is the no-R2 version of ParaHub V1.

It keeps the setup simple:

- Cloudflare Pages hosts the web app
- Cloudflare Pages Functions run the backend
- Cloudflare D1 stores accounts, cases, rooms, timeline logs, photo notes, and voice notes
- No R2 bucket needed
- No email login
- Admin creates usernames and passwords inside ParaHub

## Important limitation

Because this version stores media directly in D1, it is designed for small V1 evidence files:

- Photos are compressed in the browser before upload
- Voice/audio files must be short and under 3 MB
- This is good enough for testing and small investigations
- If you later want lots of large audio/video files, move media storage to R2

## Binding name you must use

Cloudflare Pages needs only one binding:

```text
DB
```

`DB` must point to your Cloudflare D1 database.

There is no `MEDIA` binding in this version.

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

On Windows:

1. Extract the zip.
2. Open GitHub Desktop.
3. Add the extracted ParaHub folder as a local repository.
4. Commit the files.
5. Publish or push the repository to GitHub.

Do not upload the zip itself into the repo. Upload the extracted folder contents with folders intact.

## Step 2, connect GitHub to Cloudflare Pages

1. Go to Cloudflare.
2. Click **Workers & Pages**.
3. Click **Create application**.
4. Click **Pages**.
5. Click **Connect to Git**.
6. Select GitHub.
7. Choose your `parahub` repository.
8. Click **Begin setup**.

Use these build settings:

```text
Framework preset: Vite, or None
Build command: npm run build
Build output directory: dist
```

Click **Save and Deploy**.

It may fail until the D1 binding is added. That is fine.

## Step 3, create your D1 database

1. In Cloudflare, go to **Workers & Pages**.
2. Click **D1**.
3. Click **Create database**.
4. Name it:

```text
parahub-db
```

5. Open the database.
6. Open the SQL console.
7. Open `schema.sql` from this project.
8. Copy all of it.
9. Paste it into the SQL console.
10. Click **Execute** or **Run**.

## Step 4, bind D1 to the Pages project

1. Go to **Workers & Pages**.
2. Open your **parahub** Pages project.
3. Click **Settings**.
4. Click **Functions**.
5. Find **Bindings**.
6. Click **Add binding**.
7. Choose **D1 database**.
8. Set:

```text
Variable name: DB
Database: parahub-db
```

9. Save.

Do not add R2. This version does not need it.

## Step 5, redeploy

1. Go to your Pages project.
2. Click **Deployments**.
3. Click the latest deployment.
4. Click **Retry deployment**.

Wait until it says **Success**.

Then open the temporary Cloudflare link, usually something like:

```text
https://parahub.pages.dev
```

You should see the ParaHub setup screen.

## Step 6, create your admin account

On first launch:

1. Create your admin username.
2. Create your display name.
3. Create your password.
4. Log in.

Then you can create investigator/viewer accounts inside ParaHub.

## Step 7, add your custom domain

Only do this after the Pages link works.

1. Open your **parahub** Pages project.
2. Click **Custom domains**.
3. Click **Set up a custom domain**.
4. Enter:

```text
parahub.kaidenuk.org
```

5. Click **Continue**.
6. Click **Activate domain**.

## First live test

1. Log in as admin.
2. Create one investigator account.
3. Create one investigation.
4. Add rooms.
5. Assign the investigator.
6. Log out.
7. Log in as the investigator.
8. Open the case.
9. Add a note, a reading, a short voice note, and a photo note.
10. Log back in as admin and check the timeline.
