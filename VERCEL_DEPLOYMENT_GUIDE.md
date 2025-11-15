# Vercel Deployment Guide for FlowSight Frontend

This guide explains how to deploy the FlowSight frontend to Vercel.

## Project Structure

FlowSight is a monorepo with the following structure:
```
flowsight/
├── frontend/          # Next.js application (this is what we're deploying)
├── backend/          # Python FastAPI backend
├── contracts/        # Solidity smart contracts
└── vercel.json       # Vercel configuration
```

## Deployment Options

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Add Vercel configuration"
   git push origin main
   ```

2. **Import Project in Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your repository
   - Vercel should automatically detect the `vercel.json` file

3. **Configure Project Settings**
   - **Root Directory**: Set to `frontend` (or leave blank if using vercel.json)
   - **Framework Preset**: Next.js (should auto-detect)
   - **Build Command**: `yarn build` (runs in frontend directory)
   - **Output Directory**: `.next` (default for Next.js)
   - **Install Command**: `yarn install` (runs in frontend directory)

4. **Environment Variables**
   Add these in Vercel Dashboard → Project Settings → Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-api.com
   NEXT_PUBLIC_WS_URL=wss://your-backend-api.com
   ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your frontend

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from Root Directory**
   ```bash
   cd flowsight
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? **Yes**
   - Which scope? (Select your account)
   - Link to existing project? **No** (first time) or **Yes** (subsequent)
   - Project name: **flowsight-frontend**
   - Directory: **frontend**
   - Override settings? **No**

5. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   vercel env add NEXT_PUBLIC_WS_URL
   ```

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Option 3: Deploy from Frontend Directory Directly

If Vercel still doesn't detect the frontend folder:

1. **Navigate to frontend directory**
   ```bash
   cd flowsight/frontend
   ```

2. **Deploy using Vercel CLI**
   ```bash
   vercel
   ```

3. **Or use Vercel Dashboard:**
   - When importing, manually set:
     - **Root Directory**: Leave as root (`.`)
     - **Build Command**: `yarn build`
     - **Output Directory**: `.next`

## Troubleshooting

### Issue: Vercel doesn't detect Next.js

**Solution**: The `vercel.json` file should handle this. If not:
1. Make sure `next` is in `frontend/package.json` dependencies
2. Check that `frontend/next.config.js` exists
3. Verify the root directory is set to `frontend` in Vercel settings

### Issue: Build fails with "Cannot find module"

**Solution**: 
1. Ensure `installCommand` runs in the frontend directory
2. Check that all dependencies are listed in `frontend/package.json`
3. Verify `node_modules` is not in `.gitignore` for the frontend folder

### Issue: Environment variables not working

**Solution**:
1. Make sure variables start with `NEXT_PUBLIC_` for client-side access
2. Redeploy after adding environment variables
3. Check Vercel logs for errors

## Alternative Deployment Options

If Vercel doesn't work for your setup, consider:

### 1. **Netlify**
- Similar to Vercel, supports monorepos
- Create `netlify.toml` in root:
  ```toml
   [build]
     base = "frontend"
     command = "yarn build"
     publish = "frontend/.next"
   ```

### 2. **Railway**
- Good for full-stack apps
- Can deploy frontend and backend together
- Supports Docker deployments

### 3. **AWS Amplify**
- Supports Next.js out of the box
- Configure build settings to use `frontend` directory

### 4. **Docker + Any Platform**
- Use the existing `frontend/Dockerfile`
- Deploy to:
  - AWS ECS/Fargate
  - Google Cloud Run
  - Azure Container Instances
  - DigitalOcean App Platform
  - Heroku (with Docker support)

## Post-Deployment Checklist

- [ ] Verify the site loads correctly
- [ ] Test Web3 wallet connections
- [ ] Check API connections (if backend is deployed)
- [ ] Verify environment variables are set
- [ ] Test on mobile devices
- [ ] Check browser console for errors
- [ ] Verify SSL certificate is active
- [ ] Test all major routes/pages

## Need Help?

If you encounter issues:
1. Check Vercel build logs
2. Review `frontend/package.json` for missing dependencies
3. Verify `next.config.js` settings
4. Check environment variables in Vercel dashboard

