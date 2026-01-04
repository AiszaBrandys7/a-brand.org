#!/bin/bash

echo "🔍 A-BRAND — SAFE PREFLIGHT CHECK"
echo "--------------------------------"

cd ~/Desktop/a-brand.org || {
  echo "❌ Folder a-brand.org nie istnieje na Desktopie"
  exit 1
}

# Backup
mkdir -p backups
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
cp index.html backups/index.$TIMESTAMP.html
echo "🛟 Backup index.html → backups/index.$TIMESTAMP.html"

# File checks
echo ""
echo "📁 Checking required files:"

FILES=(
  "index.html"
  "robots.txt"
  "sitemap.xml"
  "assets/hero-a-brand.webp"
  "assets/favicon-a.svg"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "⚠️  MISSING: $file"
  fi
done

# Quick content checks
echo ""
echo "🔎 Quick sanity checks:"

grep -q "G-VRPBHJ05ZL" index.html && echo "✅ GA4 Measurement ID present" || echo "⚠️ GA4 ID missing"
grep -q "hero-wrap::after" index.html && echo "✅ Planet CSS present" || echo "⚠️ Planet CSS missing"
grep -q "og:image" index.html && echo "⚠️ OG image already defined" || echo "ℹ️ OG image not yet defined"

# Local server
echo ""
echo "🌍 Starting local server at http://localhost:8080"
echo "⛔ Press CTRL+C to stop"
python3 -m http.server 8080
