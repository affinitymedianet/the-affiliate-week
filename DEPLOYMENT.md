# Deploying The Affiliate Week to your own server

The app is a TanStack Start (React 19 + Vite) site with Firebase (Firestore,
Auth, Cloud Storage) as the backend. There is no other database and no
server-side secret required to run the site.

---

## 1. Finish the Firebase setup (do this first)

In the [Firebase console](https://console.firebase.google.com) for project
`the-affiliate-week`:

1. **Firestore Database** → Create database → *Production mode* → pick a region
   (e.g. `eur3` or `nam5`). Region cannot be changed later.
2. **Authentication** → Get started → enable **Email/Password** only.
   Leave every other provider disabled (the site has no public signup).
3. **Storage** → Get started → same region. The `brand/` folder holds logos and
   cover images.
4. **Authentication → Settings → Authorized domains** → add
   `theaffiliateweek.com`, `www.theaffiliateweek.com` and your server's
   temporary hostname.
5. **Project settings → General → Your apps → Web API key** → restrict it
   (Google Cloud console → Credentials → API key → Website restrictions) to
   your domains. The key is publishable, but restricting it stops abuse.
6. **Create your admin user**: Authentication → Users → Add user (email +
   strong password). Copy the UID.
7. **Create the role record** so that user can reach `/a6b8` and `/admin`.
   You can do this manually in Firestore, or use the included seed script:

   **Manual:** Firestore → Start collection `roles` → Document ID = *the UID* → fields:

   | field         | type    | value             |
   | ------------- | ------- | ----------------- |
   | `role`        | string  | `admin`           |
   | `active`      | boolean | `true`            |
   | `email`       | string  | your email        |
   | `display_name`| string  | your name         |

   **Script:** Generate a service account key in Firebase console → Project
   settings → Service accounts, then run:

   ```sh
   FIREBASE_SERVICE_ACCOUNT_JSON='$(cat service-account.json)' \
     node scripts/seed-admin-role.mjs <UID> <email> "Your Name"
   ```

8. **Deploy the rules and indexes** from your machine (they are in this repo):

   ```sh
   npm i -g firebase-tools
   firebase login
   firebase use the-affiliate-week
   firebase deploy --only firestore:rules,firestore:indexes,storage
   ```

   `firestore.rules` is what protects the data — the deploy in step 8 is
   mandatory, not optional.

---

## 2. Configure the environment on the server

```sh
cp .env.example .env
# fill in VITE_FIREBASE_API_KEY and VITE_SITE_URL
chmod 600 .env          # readable only by the app user
```

Rules of thumb:

- Anything prefixed `VITE_` is **compiled into the browser bundle** — only put
  publishable values there.
- Real secrets (service-account JSON, provider keys used by server jobs) go in
  `.env` without the `VITE_` prefix, `chmod 600`, and are never committed.
- `.env` is already git-ignored. Never commit it.

---

## 3. Build and run

```sh
npm ci
npm run build     # emits .output/ (Nitro server bundle + static assets)
node .output/server/index.mjs
```

The server listens on `PORT` (default 3000). Keep it alive with systemd:

```ini
# /etc/systemd/system/taw.service
[Unit]
Description=The Affiliate Week
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/theaffiliateweek
EnvironmentFile=/var/www/theaffiliateweek/.env
ExecStart=/usr/bin/node .output/server/index.mjs
Restart=always
User=www-data

[Install]
WantedBy=multi-user.target
```

```sh
sudo systemctl enable --now taw
```

### Nginx reverse proxy + TLS

```nginx
server {
  server_name theaffiliateweek.com www.theaffiliateweek.com;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

```sh
sudo certbot --nginx -d theaffiliateweek.com -d www.theaffiliateweek.com
```

Point the domain's A record at the server, then re-run the Firebase
*Authorized domains* step if you added a new hostname.

---

## 4. After the first deploy

1. Visit `/a6b8`, sign in with the admin account.
2. **Admin → Settings** — logo, favicon, contact email, privacy/T&C content,
   SEO defaults.
3. **Admin → Integrations & APIs** — newsletter provider key, transactional
   email key, reCAPTCHA, Slack webhook. Stored in Firestore under
   `private_settings/integrations`, readable by admins only.
4. **Admin → Team & roles** — add the rest of the editorial team.
5. Publish a first issue, a few jobs, deals and events so the homepage boards
   are not empty.
6. Check `https://theaffiliateweek.com/sitemap.xml` and submit it in Google
   Search Console (verification tag field is in Admin → Settings).

---

## Checklist before going live

- [ ] Firestore, Auth (Email/Password) and Storage enabled
- [ ] `firebase deploy --only firestore:rules,firestore:indexes,storage` run
- [ ] Admin user created **and** matching `roles/{uid}` document added
- [ ] `.env` created on the server, `chmod 600`, API key restricted by domain
- [ ] Production build runs behind Nginx with HTTPS
- [ ] Domain added to Firebase authorized domains
- [ ] Settings + Integrations filled in from the admin UI
- [ ] Backups: Firestore → scheduled export to a Cloud Storage bucket
