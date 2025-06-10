# AWS Amplify Deployment Guide for Next.js Application

## Prerequisites
- AWS Account
- Git repository (GitHub, GitLab, Bitbucket, or AWS CodeCommit)
- Your Next.js application code

## Step 1: Prepare Your Repository

### 1.1 Push Your Code to Git
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit for Amplify deployment"
git branch -M main
git remote add origin <your-repository-url>
git push -u origin main
```

### 1.2 Verify Configuration Files
Ensure these files are in your repository root:
- `amplify.yml` (build specification)
- `package.json` (dependencies)
- `next.config.js` (if you have custom Next.js config)

## Step 2: Set Up AWS Amplify

### 2.1 Access AWS Amplify Console
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Sign in to your AWS account
3. Click "New app" → "Host web app"

### 2.2 Connect Your Repository
1. Choose your Git provider (GitHub, GitLab, Bitbucket, or AWS CodeCommit)
2. Authorize AWS Amplify to access your repository
3. Select your repository and branch (usually `main` or `master`)
4. Click "Next"

### 2.3 Configure Build Settings
1. **Build settings** should auto-detect from `amplify.yml`
2. **Environment variables** (if needed):
   - Add any environment variables your app requires
   - Common ones: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_ENV`
3. Click "Save and deploy"

## Step 3: Monitor Deployment

### 3.1 Build Process
Amplify will automatically:
1. Clone your repository
2. Install dependencies (`npm ci`)
3. Build your application (`npm run build`)
4. Deploy to CDN

### 3.2 Check Build Logs
- Monitor the build process in the Amplify console
- Check for any build errors
- Verify the deployment URL

## Step 4: Custom Domain (Optional)

### 4.1 Add Custom Domain
1. In Amplify console, go to "Domain management"
2. Click "Add domain"
3. Enter your domain name
4. Follow DNS verification steps
5. Configure SSL certificate (automatic with Amplify)

## Step 5: Environment Variables

### 5.1 Add Environment Variables
1. Go to "App settings" → "Environment variables"
2. Add variables like:
   ```
   NEXT_PUBLIC_API_URL=https://your-api-domain.com
   NODE_ENV=production
   ```

### 5.2 Update Environment Variables
- Changes trigger automatic rebuilds
- Use different values for different branches

## Step 6: Preview Deployments

### 6.1 Pull Request Deployments
- Amplify automatically creates preview deployments for PRs
- Each PR gets a unique URL for testing
- Perfect for code reviews and testing

## Step 7: Monitoring and Analytics

### 7.1 Access Analytics
- View page views, sessions, and user behavior
- Monitor performance metrics
- Track conversion goals

## Troubleshooting Common Issues

### Build Failures
1. **Node.js version**: Ensure compatibility (Amplify uses Node.js 18 by default)
2. **Dependencies**: Check `package.json` and `package-lock.json`
3. **Build commands**: Verify `amplify.yml` configuration

### Environment Variables
1. **Missing variables**: Add required environment variables
2. **Naming**: Use `NEXT_PUBLIC_` prefix for client-side variables

### Performance Issues
1. **Image optimization**: Use Next.js Image component
2. **Bundle size**: Analyze with `npm run build` locally
3. **CDN**: Amplify automatically provides global CDN

## Cost Optimization

### Free Tier
- 1,000 build minutes per month
- 15 GB storage per month
- 15 GB data transfer per month

### Beyond Free Tier
- Build minutes: $0.01 per minute
- Storage: $0.023 per GB per month
- Data transfer: $0.085 per GB

## Security Best Practices

1. **Environment Variables**: Never commit sensitive data
2. **Access Control**: Use IAM roles and policies
3. **HTTPS**: Always enabled by default
4. **CORS**: Configure properly for API calls

## Next Steps

1. Set up monitoring and alerts
2. Configure CI/CD pipelines
3. Implement staging environments
4. Set up backup and disaster recovery

## Support Resources

- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [AWS Support](https://aws.amazon.com/support/) 