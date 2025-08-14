#!/bin/bash

# Publish script for react-org-chart-next
# Usage: ./scripts/publish.sh [patch|minor|major]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
    print_warning "Git working directory is not clean. Please commit or stash your changes first."
    git status --short
    exit 1
fi

# Check if we're on main/master branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
    print_warning "You're not on main/master branch. Current branch: $CURRENT_BRANCH"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Determine version bump type
BUMP_TYPE=${1:-patch}
if [[ ! "$BUMP_TYPE" =~ ^(patch|minor|major)$ ]]; then
    print_error "Invalid bump type: $BUMP_TYPE. Use patch, minor, or major."
    exit 1
fi

print_status "Starting publish process for $BUMP_TYPE version bump..."

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_status "Current version: $CURRENT_VERSION"

# Bump version
print_status "Bumping $BUMP_TYPE version..."
npm version $BUMP_TYPE --no-git-tag-version

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")
print_status "New version: $NEW_VERSION"

# Build the package
print_status "Building package..."
npm run build

# Verify build
if [ ! -f "dist/index.js" ]; then
    print_error "Build failed - dist/index.js not found"
    exit 1
fi
print_success "Build successful"

# Commit version bump
print_status "Committing version bump..."
git add package.json package-lock.json
git commit -m "chore: bump version to $NEW_VERSION"

# Create git tag
print_status "Creating git tag v$NEW_VERSION..."
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

# Push changes and tags
print_status "Pushing changes and tags..."
git push origin $CURRENT_BRANCH
git push origin "v$NEW_VERSION"

print_success "Version $NEW_VERSION has been prepared and pushed!"
print_status "Next steps:"
echo "  1. Create a GitHub release with tag v$NEW_VERSION"
echo "  2. The GitHub Action will automatically publish to npm"
echo "  3. Or run the workflow manually from GitHub Actions tab"
echo ""
print_status "To publish manually to npm, run: npm publish"
