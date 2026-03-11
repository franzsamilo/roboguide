# Setup Guide

## NextAuth (Google OAuth)

1. In [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application) if needed
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google` (and your production URL)
4. Set in `.env.local`:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_URL` (e.g. `http://localhost:3000`)
   - `NEXTAUTH_SECRET` (random string)

## Firebase (Firestore + Storage)

## Manual steps (one-time)

### 1. Deploy Firestore rules (fixes "Missing or insufficient permissions")

**Option A – Firebase CLI** (project already configured)
```bash
firebase login
firebase deploy --only firestore
```

**Option B – Firebase Console** (no CLI needed)
1. Open [Firebase Console](https://console.firebase.google.com/) → select project **xtsweb-ed4c0**
2. **Firestore Database** → **Rules** tab
3. Replace the rules with the contents of `firestore.rules` from this project
4. Click **Publish**

### 2. Set first admin in env

Add to `.env.local`:
```
ADMIN_EMAIL=your@email.com
```

Use the Google account email you’ll sign in with. The first admin is added automatically when that user signs in.

---

## What happens automatically

- **First admin** – When you sign in with the email in `ADMIN_EMAIL`, you’re added as admin on first login. No manual seed step.
- **Promote others** – In Admin → Admins tab, enter an email and click **Promote**.
