# How to Host Mochii on Render (or other Cloud Platforms)

**Mochii** is already built as a complete full-stack web application:
- **Frontend**: React 19 + TypeScript + Tailwind CSS (Vite SPA)
- **Backend**: Node.js + Express + WebSocket (`ws`) server for real-time WebRTC signaling and matchmaking.

---

## 🚀 3-Minute Deployment to Render (Free Tier)

Render provides a **free Web Service** tier that fully supports Node.js, WebSockets, and custom domains with free automatic SSL.

### Step 1: Push your project to GitHub
If you haven't already:
```bash
git add .
git commit -m "feat: configure for render deployment"
git push origin main
```

### Step 2: Create a Web Service on Render
1. Go to [dashboard.render.com](https://dashboard.render.com/) and sign up or log in.
2. Click **New +** (top right) ➔ Select **Web Service**.
3. Choose **Build and deploy from a Git repository** ➔ Select your `Chat-app-` repository.

### Step 3: Configure Settings (Or let `render.yaml` configure it automatically)
If filling in manually, use these exact settings:
- **Name**: `mochii`
- **Region**: Any close to your users (e.g., *Frankfurt*, *Oregon*, or *Ohio*)
- **Language**: `Node`
- **Branch**: `main` (or `master`)
- **Build Command**:
  ```bash
  npm install && npm run build
  ```
- **Start Command**:
  ```bash
  npm start
  ```
- **Instance Type**: `Free`

### Step 4: Environment Variables (Advanced tab)
Add these two environment variables:
| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |

*(Optional Health Check Path: `/api/stats`)*

### Step 5: Click "Create Web Service"
Render will:
1. Clone your repo.
2. Run `npm install` and compile the React bundle into `/dist`.
3. Launch `server.ts` to host your site and WebSocket signaling.
4. Give you a live URL like: `https://mochii-video-chat.onrender.com`.

---

## 🌐 Adding Your Own Custom Domain (e.g., `mochii.com`)

1. In Render, open your service ➔ Click **Settings** in the left sidebar.
2. Scroll to **Custom Domains** ➔ Click **Add Custom Domain**.
3. Type your domain (e.g., `mochii.com` or `chat.mochii.com`).
4. Add the CNAME / ANAME record shown by Render in your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.).
5. Render automatically issues a free, auto-renewing Let's Encrypt SSL certificate within 2 minutes!

---

## ⚡ Alternative Free / Low-Cost Hosts

Because `server.ts` handles both static file serving and WebSockets, you can also deploy with 1 command to:
- **Railway** (`railway up`) - supports WebSockets and automatically detects `npm run build` and `npm start`.
- **Fly.io** (`fly launch`) - uses the existing `Dockerfile` in the root of the project.
- **Google Cloud Run** (`gcloud run deploy`) - uses the existing `Dockerfile` with 2 million free requests/month.
