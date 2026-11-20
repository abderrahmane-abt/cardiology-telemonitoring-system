#!/usr/bin/env bash
set -e
echo "📦 Building production bundle..."
npm run build
touch dist/.nojekyll
rm -rf /tmp/cardiopulse-gh-pages
git worktree add -B gh-pages /tmp/cardiopulse-gh-pages
rm -rf /tmp/cardiopulse-gh-pages/*
cp -r dist/* /tmp/cardiopulse-gh-pages/
cp dist/.nojekyll /tmp/cardiopulse-gh-pages/
cd /tmp/cardiopulse-gh-pages
git add -A
git commit -m "deploy: update GitHub Pages" || true
git push -f origin gh-pages
cd - > /dev/null
git worktree remove /tmp/cardiopulse-gh-pages
echo "🚀 Deployed successfully to https://abderrahmane-abt.github.io/cardiology-telemonitoring-system/"
