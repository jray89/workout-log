#!/bin/bash
set -e

echo "========================================"
echo "Building React Frontend for Production"
echo "========================================"

# Navigate to frontend directory
cd "$(dirname "$0")/../frontend"

echo "Installing dependencies..."
pnpm install

echo "Building production bundle..."
pnpm build

echo "Copying build to Rails public directory..."
rm -rf ../backend/public/*
cp -r dist/* ../backend/public/

echo "========================================"
echo "✅ Frontend build complete!"
echo "Files deployed to backend/public/"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Test locally: cd backend && RAILS_ENV=production rails server"
echo "2. Visit http://localhost:3000 to verify"
echo "3. Commit changes: git add backend/public && git commit -m 'Build frontend for production'"
echo "4. Deploy to: workoutlog.jasonray.me"
