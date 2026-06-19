# AfroHR Hub — One-Time Deployment Setup (< 2 minutes)

## Supabase Database: DONE
All 10 migrations + seed data applied. No action needed.

## Vercel Frontend: 3 clicks

### Step 1 — Import repo
1. Open https://vercel.com/new
2. Select **motaha-2020/Afrohrhub**
3. Set **Root Directory** → `apps/web`
4. Set **Framework Preset** → Next.js

### Step 2 — Add environment variables
In the same import screen, expand "Environment Variables" and add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://mgzjvugjcbkhltsrtmyu.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(copy from apps/web/.env.local)* |

### Step 3 — Deploy
Click **Deploy**. Vercel auto-detects the Next.js config.

Every future push to `main` will auto-deploy.
