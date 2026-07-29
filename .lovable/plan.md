## Goal
Deploy your local Firestore/Storage security rules and finish the production server configuration so the live site can read/write data securely.

## Step 1 — Deploy Firebase rules and indexes from your local machine
Your repo already contains the correct rules (`firestore.rules`, `storage.rules`) and indexes (`firestore.indexes.json`). You only need to push them to Firebase.

Run these commands in your project directory on your local computer:

```bash
# 1. Install Firebase CLI if you haven't already
npm install -g firebase-tools

# 2. Sign in
firebase login

# 3. Link to your project
firebase use the-affiliate-week

# 4. Deploy rules + indexes + storage rules
firebase deploy --only firestore:rules,firestore:indexes,storage
```

Expected result: you should see confirmation that `firestore.rules`, `firestore.indexes.json`, and `storage.rules` were deployed.

## Step 2 — Create your first admin user and role record
After rules are deployed, the admin area still needs a role document to let you in.

1. In the Firebase console, go to **Authentication → Users → Add user** and create your admin email + strong password. Copy the **UID**.
2. In **Firestore Database**, create a document at path `roles/{uid}` with these fields:
   - `role`: string = `admin`
   - `active`: boolean = `true`
   - `email`: string = your email
   - `display_name`: string = your name

Without this document, `/a6b8` will reject your login.

## Step 3 — Add your production domain to Firebase authorized domains
In Firebase console: **Authentication → Settings → Authorized domains**.
Add:
- `theaffiliateweek.com`
- `www.theaffiliateweek.com`
- your server's temporary hostname (if any)

## Step 4 — Configure and start the production server
On your server, inside the app directory:

```bash
# Create and secure the environment file
cp .env.example .env
nano .env   # fill VITE_FIREBASE_API_KEY and VITE_SITE_URL
chmod 600 .env

# Install dependencies and build
npm ci
npm run build

# Start the server (use PM2 for persistence)
node .output/server/index.mjs
```

Recommended PM2 setup:
```bash
npm install -g pm2
pm2 start .output/server/index.mjs --name "the-affiliate-week"
pm2 save
pm2 startup
```

## Step 5 — Nginx reverse proxy + HTTPS
Create an Nginx server block:

```nginx
server {
  server_name theaffiliateweek.com www.theaffiliateweek.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
  }
}
```

Then obtain SSL:
```bash
sudo certbot --nginx -d theaffiliateweek.com -d www.theaffiliateweek.com
```

## Verification checklist
- [ ] `firebase deploy` completed successfully
- [ ] Firestore database has the `roles/{uid}` admin document
- [ ] Production domain added to Firebase authorized domains
- [ ] `.env` created on server with `VITE_FIREBASE_API_KEY` and `VITE_SITE_URL`
- [ ] `npm run build` succeeds with no errors
- [ ] Site loads over HTTPS and public pages show content
- [ ] `/a6b8` login works with your admin credentials
- [ ] Admin → Integrations & APIs is accessible after login

## Notes
- Do not skip the rules deploy — the current locked-down rules are blocking all reads/writes, which is why the site appears empty/broken right now.
- The API key in `.env` is publishable by design; real secrets (service account JSON, ESP keys, etc.) should be entered later via **Admin → Integrations & APIs**, not hardcoded in `.env`.
- Once the admin panel is reachable, publish a first issue plus a few jobs/deals/events so the homepage boards are not empty.

## Optional follow-ups
If you want, I can also:
- Add a PM2 ecosystem file (`ecosystem.config.cjs`) to the repo.
- Add a sample Nginx config file to the repo for easier copy-paste.
- Build a small seed script that creates the admin role document automatically once you provide the UID.