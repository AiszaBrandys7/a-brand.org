#!/bin/bash
set -euo pipefail

# 1. Init git if not exists
if [ ! -d .git ]; then
  echo "🚀 Initializing git repo..."
  git init
  git config user.name "A-Brand Bot"
  git config user.email "hello@a-brand.org"
fi

# 2. Ensure .gitignore exists
if [ ! -f .gitignore ]; then
  cat > .gitignore <<'EOGIT'
# macOS
.DS_Store
.AppleDouble
.LSOverride

# Node / npm / build
node_modules/
dist/
build/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Backups systemowe
*~
*.swp
*.swo

# Python cache
__pycache__/
*.py[cod]

# Netlify cache
.netlify/

# Ignore all hidden files
.*
# Except gitignore itself
!.gitignore

# --- Keep backups ---
!/backups/
!/backups/*
EOGIT
  echo "✅ .gitignore created"
fi

# 3. Ensure testimonials-backup.html exists
if [ ! -f testimonials-backup.html ]; then
  cat > testimonials-backup.html <<'EOBACKUP'
<section id="testimonials" class="container">
  <h2>Testimonials</h2>
  <blockquote>“Brought strategic clarity and shipped fast.”<br><small>(under NDA)</small></blockquote>
  <blockquote>“SEO + AI ops that cut costs and boosted results.”<br><small>(under NDA)</small></blockquote>
  <blockquote>“Delivered measurable growth across markets.”<br><small>(under NDA)</small></blockquote>
</section>
EOBACKUP
  echo "✅ testimonials-backup.html created"
fi

# 4. Ensure backups folder + first snapshot
mkdir -p backups
ts=$(date +"%Y-%m-%d-%H-%M-%S")
if [ -f index.html ]; then
  cp index.html "backups/index-$ts.html"
  echo "🗂 First snapshot saved → backups/index-$ts.html"
else
  echo "⚠️ index.html not found, skipping snapshot"
fi

# 5. First commit if none exists
if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  git add .
  git commit -m "Initial commit: project setup (.gitignore + testimonials-backup + backups snapshot)"
  echo "📦 First commit created"
else
  echo "ℹ️ Repo already has commits"
fi

# 6. Make scripts executable
chmod +x update.sh restore.sh || true

# 7. Show last 5 commits
echo
echo "📜 Recent git log (last 5 commits):"
git log --oneline --graph -5 || true

echo
echo "🎉 Init done! You can now run ./update.sh and ./restore.sh"
