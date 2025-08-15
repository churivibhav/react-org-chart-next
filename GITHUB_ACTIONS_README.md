# GitHub Actions for NPM Publishing

This repository includes GitHub Actions workflows to automatically publish your `react-org-chart-next` package to npm.

## Workflows

### 1. `npm-publish.yml` (Recommended)
- **Triggers**: GitHub releases and manual workflow dispatch
- **Features**: Build verification, dry-run capability, npm publishing
- **Use case**: Primary workflow for publishing to npm

### 2. `ci-cd.yml`
- **Triggers**: Pull requests, pushes to main/master, releases
- **Features**: Testing, building, publishing, and git tagging
- **Use case**: Comprehensive CI/CD pipeline

### 3. `publish.yml`
- **Triggers**: GitHub releases and manual workflow dispatch
- **Features**: Basic npm publishing workflow
- **Use case**: Simple publishing workflow

## Setup Instructions

### 1. Create NPM Token
1. Go to [npmjs.com](https://www.npmjs.com) and sign in
2. Click on your profile → Access Tokens
3. Create a new token with "Automation" type
4. Copy the token (you won't see it again)

### 2. Add NPM Token to GitHub Secrets
1. Go to your GitHub repository
2. Click Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `NPM_TOKEN`
5. Value: Paste your npm token
6. Click "Add secret"

### 3. Update Package.json (if needed)
Ensure your `package.json` has the correct:
- `name`: Your npm package name
- `version`: Current version
- `repository.url`: Your GitHub repository URL

## Usage

### Automatic Publishing on Release
1. Create a new GitHub release
2. Tag it with version (e.g., `v1.0.0`)
3. Publish the release
4. The workflow will automatically:
   - Build the package
   - Publish to npm
   - Verify the build

### Manual Publishing
1. Go to Actions → NPM Publish
2. Click "Run workflow"
3. Enter the version you want to publish
4. Choose whether to do a dry run
5. Click "Run workflow"

### Dry Run
Use the dry run option to:
- Test the build process
- Verify the build output
- Check for any issues before publishing

## Workflow Details

### Build Process
- Installs dependencies with `npm ci`
- Builds the package with `npm run build`
- Verifies `dist/index.js` exists
- Publishes to npm (if not dry run)

### Environment
- **Node.js**: 18.x
- **OS**: Ubuntu Latest
- **Cache**: npm dependencies are cached for faster builds

### Security
- Uses `NPM_TOKEN` secret for authentication
- No sensitive data is logged
- Build verification prevents publishing broken packages

## Troubleshooting

### Common Issues

1. **Build fails**
   - Check that `npm run build` works locally
   - Verify webpack configuration
   - Check for missing dependencies

2. **Publish fails**
   - Verify `NPM_TOKEN` secret is set correctly
   - Check npm package name availability
   - Ensure version number is unique

3. **Permission denied**
   - Verify you have publish access to the npm package
   - Check npm organization settings if applicable

### Debug Mode
Enable debug logging by adding this secret:
- Name: `ACTIONS_STEP_DEBUG`
- Value: `true`

## Best Practices

1. **Version Management**: Always bump version before publishing
2. **Testing**: Test builds locally before triggering workflows
3. **Releases**: Use GitHub releases for version tracking
4. **Dry Runs**: Use dry run option for testing changes
5. **Monitoring**: Check workflow runs for any failures

## Support

If you encounter issues:
1. Check the Actions tab for workflow logs
2. Verify all secrets are set correctly
3. Test the build process locally
4. Check npm package permissions
