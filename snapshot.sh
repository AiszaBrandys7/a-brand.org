#!/bin/bash
set -euo pipefail

# === Ultra-minimalny snapshot.sh ===
# Nie zmienia index.html. Tylko zapisuje kopię i commit.

mkdir -p backups
ts=$(date +"%Y-%m-%d-%H-%M-%S")

if [ -f index.html ]; then
  cp index.html "backups/index-$ts.html"
  echo "🗂 Snapshot saved → backups/index-$ts.html"
else
  echo "⚠️ index.html not found, skipping snapshot"
fi

# Init git jeśli nie istnieje
if [ ! -d .git ]; then
  git init
  git config user.name "A-Brand Bot"
  git config user.email "hello@a-brand.org"
fi

# Commit tylko snapshot
git add backups/ || true
git commit -m "Snapshot only ($ts)" || true

echo
echo "✅ Snapshot-only commit done"
echo
echo "📜 Recent git log:"
git log --oneline --graph -5 || true
