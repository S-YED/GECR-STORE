# GitHub Pages Deployment Guide

## Automatic Deployment (Recommended)

The project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Setup Steps:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Setup GitHub Pages deployment"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Under "Source", select "GitHub Actions"
   - The workflow will automatically deploy on every push to main

3. **Access Your Site**:
   - Your site will be available at: `https://yourusername.github.io/GECR-STORE/`
   - Wait 2-3 minutes for the first deployment to complete

## Manual Deployment (Alternative)

If you prefer manual deployment:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Deploy**:
   ```bash
   npm run deploy
   ```

## Important Notes

- The app runs in **demo mode** by default (no database setup required)
- All features work with sample data
- Login with any email/password combination
- The deployment is configured for the `/GECR-STORE/` base path

## Troubleshooting

- If pages don't load correctly, check that GitHub Pages is enabled
- Ensure the repository name matches the base path in `vite.config.js`
- Check the Actions tab for deployment status and errors