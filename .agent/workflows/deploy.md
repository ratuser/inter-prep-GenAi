---
description: How to deploy InterPrep to Vercel (frontend), Render (backend), and MongoDB Atlas (database)
---

# Deployment Guide: InterPrep

// turbo-all

## Step 1: MongoDB Atlas (Database)

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and sign in / create an account
2. Click **"Build a Database"** → Choose **Free (M0)** → Select a region close to you
3. Set a **database user** (username + password) — save these credentials
4. Under **Network Access** → Click **"Add IP Address"** → Select **"Allow Access from Anywhere"** (0.0.0.0/0)
5. Under **Database** → Click **"Connect"** → Choose **"Drivers"** → Copy the connection string
6. It will look like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
7. Replace `<username>` and `<password>` with your actual credentials
8. Add a database name to the URI: `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/interprep?retryWrites=true&w=majority`

**Save this URI — you'll need it for Render.**

---

## Step 2: Render (Backend)

1. Go to [https://render.com](https://render.com) and sign in with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo: `ratuser/inter-prep-GenAi`
4. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `interprep-backend` |
| **Region** | Choose closest to your Atlas region |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | Free |

5. Under **Environment Variables**, add:

| Key | Value |
|-----|-------|
| `PORT` | `10000` |
| `MONGODB_URI` | Your Atlas connection string from Step 1 |
| `JWT_SECRET` | A strong random string (e.g. `interprep_prod_jwt_2026_xxxx`) |
| `GROQ_API_KEY` | Your Groq API key |
| `CORS_ORIGIN` | `https://your-app-name.vercel.app` (update after Vercel deploy) |

6. Click **"Create Web Service"** — wait for the build to finish
7. Copy the service URL (e.g. `https://interprep-backend.onrender.com`)
8. Verify it works: visit `https://interprep-backend.onrender.com/api/health`

**Save this backend URL — you'll need it for Vercel.**

---

## Step 3: Vercel (Frontend)

1. Go to [https://vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"** → Import `ratuser/inter-prep-GenAi`
3. Configure the project:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

4. Under **Environment Variables**, add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://interprep-backend.onrender.com/api` |

5. Click **"Deploy"** — wait for the build to finish
6. Copy your Vercel URL (e.g. `https://your-app-name.vercel.app`)

---

## Step 4: Update Render CORS

1. Go back to Render → Your backend service → **Environment**
2. Update `CORS_ORIGIN` to your actual Vercel URL: `https://your-app-name.vercel.app`
3. Click **"Save Changes"** — Render will auto-redeploy

---

## Step 5: Verify Everything Works

1. Visit your Vercel URL
2. Create an account / log in
3. Upload a resume and start an interview
4. Complete the interview and check if dashboard updates

---

## Troubleshooting

- **CORS errors**: Make sure `CORS_ORIGIN` on Render exactly matches your Vercel URL (no trailing slash)
- **Backend not starting**: Check Render logs for errors (  missing env vars, MongoDB connection issues)
- **Frontend blank**: Check browser console (F12) for API errors
- **Free tier cold starts**: Render free tier sleeps after 15 min of inactivity — first request may take ~30s
- **MongoDB connection fails**: Ensure Atlas Network Access allows 0.0.0.0/0
