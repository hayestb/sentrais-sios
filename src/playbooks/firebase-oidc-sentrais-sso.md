# FORGE Playbook: Firebase Identity Platform — Sentrais SSO (OIDC)

**Playbook ID:** `firebase-oidc-sentrais-sso`
**NIN Tags:** NIN-FORGE-SSO-001 through NIN-FORGE-SSO-005
**Spoke:** sentrais-forge (forge-bf42d)
**Gate:** Pre-merge gate for PR #5 (sentrais-forge SSO branch)
**Owner:** Tye Hayes
**Status:** Pending execution
**Last Updated:** 2026-07-07

---

## Context

sentrais-forge is a Firebase-hosted Vite app. PR #5 ships `signInWithPopup` via
an OIDC provider (`oidc.sentrais`) that delegates authentication to the Sentrais
Clerk instance. Before PR #5 can merge, three external systems must be configured:

1. Firebase Identity Platform (upgrade + OIDC provider registration)
2. Clerk (OAuth application for Firebase)
3. Vercel (environment variable for the provider ID)

The app code in PR #5 is already complete. No code changes are required by this
playbook — it is purely infrastructure/console configuration.

---

## Reference Values

| Field | Value |
|---|---|
| Firebase project | `forge-bf42d` |
| Clerk instance (issuer) | `https://sought-dolphin-26.clerk.accounts.dev` |
| Firebase callback URL | `https://forge-bf42d.firebaseapp.com/__/auth/handler` |
| OIDC provider ID | `oidc.sentrais` |
| Required scopes | `openid email profile` |
| Grant type | Authorization Code Flow |
| Vercel env var | `REACT_APP_SENTRAIS_OIDC_PROVIDER_ID` |

---

## Gate 1 — Enable Firebase Identity Platform

**Owner:** Tye Hayes (billing-tier change; requires console access)
**Estimated time:** 5 minutes
**Hard block:** Yes — OIDC providers do not exist without this upgrade

### Steps

1. Open [Firebase Console](https://console.firebase.google.com) → project `forge-bf42d`.
2. Navigate to **Authentication** → **Sign-in method**.
3. If an "Upgrade" banner appears, click **Upgrade to Identity Platform** (Google Cloud Identity Platform).
   - This unlocks OIDC and SAML providers.
   - Review pricing before confirming (GCIP has its own free tier; verify it meets project requirements).
4. Confirm upgrade.

### Completion check

Authentication → Sign-in method shows an **OpenID Connect** option in the provider list.

---

## Gate 2 — Create Clerk OAuth Application

**Owner:** Tye Hayes (Clerk Dashboard access required)
**Estimated time:** 5 minutes
**Hard block:** Yes — client ID and secret are required for Gate 3

### Steps

1. Open [Clerk Dashboard](https://dashboard.clerk.com) → **OAuth Applications** → **New application**.
2. Name: `sentrais-forge (Firebase)`.
3. Redirect URI: `https://forge-bf42d.firebaseapp.com/__/auth/handler`
4. Enable scopes: `openid`, `email`, `profile`.
5. In the application settings, enable **"Generate access tokens as JWTs"**.
6. Copy and securely store:
   - **Client ID** (format: `oauth_...`)
   - **Client Secret**

### Completion check

OAuth application appears in Clerk Dashboard with status Active. Client ID and secret stored in 1Password / secure vault under `sentrais-forge OIDC`.

---

## Gate 3 — Register OIDC Provider in Firebase

**Owner:** Tye Hayes (or delegated operator with Firebase IAM access)
**Estimated time:** 5 minutes
**Dependency:** Gate 1 and Gate 2 must be complete
**Hard block:** Yes — app cannot authenticate without this

### Steps

1. Firebase Console → `forge-bf42d` → **Authentication** → **Sign-in method** → **Add new provider** → **OpenID Connect**.
2. Set:
   - **Grant type:** Authorization Code Flow
   - **Name:** `sentrais` *(Firebase will auto-assign Provider ID = `oidc.sentrais`)*
   - **Issuer (URL):** `https://sought-dolphin-26.clerk.accounts.dev`
   - **Client ID:** (from Gate 2)
   - **Client Secret:** (from Gate 2)
3. Click **Save**.
4. Confirm that Firebase displays the callback URL: `https://forge-bf42d.firebaseapp.com/__/auth/handler` — this must match what was entered in Clerk (Gate 2 step 3).

### Completion check

Provider `oidc.sentrais` appears in Authentication → Sign-in method with status Enabled.

---

## Gate 4 — Verify Authorized Domains

**Owner:** Tye Hayes
**Estimated time:** 2 minutes
**Hard block:** Soft block — auth popup will be rejected if domain is missing

### Steps

1. Firebase Console → `forge-bf42d` → **Authentication** → **Settings** → **Authorized domains**.
2. Confirm the following domains are present (add if missing):
   - `forge-bf42d.firebaseapp.com`
   - `forge-bf42d.web.app`
   - Any custom domain serving the app in production

### Completion check

All production and preview domains are listed.

---

## Gate 5 — Set Vercel Environment Variable + Merge PR #5

**Owner:** Tye Hayes (or FORGE operator with Vercel access)
**Estimated time:** 5 minutes
**Dependency:** Gates 1–4 must be complete

### Steps

1. Vercel Dashboard → `sentrais-forge` project → **Settings** → **Environment Variables**.
2. Add:
   - **Key:** `REACT_APP_SENTRAIS_OIDC_PROVIDER_ID`
   - **Value:** `oidc.sentrais`
   - **Environments:** Production, Preview, Development
3. Trigger a redeploy (or the PR merge in step 4 will trigger one automatically).
4. On a preview deployment of PR #5, test end-to-end:
   - Click **Sign in with Sentrais**
   - Clerk popup appears → user authenticates
   - App redirects to `/dashboard`
   - Firestore-backed data loads correctly
5. If test passes: **merge PR #5** in sentrais-forge repository.

### Completion check

- Sign-in flow completes without error in the preview environment.
- PR #5 merged.
- Production deploy is green.

---

## Rollback Plan

If any gate fails and the OIDC provider causes errors in production:

1. Firebase → Authentication → `oidc.sentrais` → **Disable** (does not delete config, just disables).
2. Vercel → remove or blank `REACT_APP_SENTRAIS_OIDC_PROVIDER_ID` env var.
3. Redeploy — app falls back to its existing Firebase auth method (if any).

---

## Evidence Requirements (for Audit Stream)

Each gate completion should be logged to the Evidence Ledger with:

| Gate | Entry Type | Notes |
|---|---|---|
| 1 | `blueprint` | Screenshot of Identity Platform upgrade confirmation |
| 2 | `raci_update` | Clerk OAuth app client ID (not secret) recorded |
| 3 | `blueprint` | Screenshot of `oidc.sentrais` in Firebase provider list |
| 4 | `blueprint` | Screenshot of authorized domains |
| 5 | `blueprint360_assessment` | PR #5 merge SHA + Vercel deploy URL |
