# Railway CLI Deployment (Alternative Method)

If you prefer using the command line:

## Install Railway CLI
```bash
npm install -g @railway/cli
```

## Login and Deploy
```bash
# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up

# Get your URL
railway domain
```

## Set Environment Variables (Optional)
```bash
railway variables set NODE_ENV=production
railway variables set OPENAI_API_KEY=your_key_here
```

Your app will be available at the provided Railway URL!