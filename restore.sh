#!/bin/bash
set -euo pipefail

# === Minimalistyczny restore.sh ===
# Tworzy snapshot index.html, upewnia się że privacy + footer są obecne,
# commit do gita i pokazuje log.

mkdir -p backups
ts=$(date +"%Y-%m-%d-%H-%M-%S")
cp index.html "backups/index-$ts.html"

# Init git jeśli nie istnieje
if [ ! -d .git ]; then
  git init
  git config user.name "A-Brand Bot"
  git config user.email "hello@a-brand.org"
fi

# Dodaj sekcję privacy jeśli jej nie ma
if ! grep -q "We respect your privacy" index.html; then
  sed -i '' '/<\/main>/i\
<section class="container">\
  <h2>We respect your privacy</h2>\
  <p>We respect your privacy. See our full <a href="privacy.html">Privacy Policy</a> and <a href="terms.html">Terms</a>.</p>\
</section>' index.html
fi

# Napraw footer (zawsze nadpisuje istniejący)
sed -i '' '/<footer>/,/<\/footer>/c\
<footer>\
  <div class="container">\
    <div>© 2025 A-Brand Marketing — Worldwide.</div>\
    <div style="margin-top:8px" class="muted">\
      <a href="#contact">Contact</a> · <a href="#roi">ROI</a> · <a href="privacy.html">Privacy Policy</a> · <a href="terms.html">Terms</a>\
    </div>\
  </div>\
</footer>' index.html

# Commit
git add index.html backups/
git commit -m "Restore: privacy + footer ensured ($ts)" || true

echo "✅ Restore done (privacy + footer ensured)"
echo "🗂 Snapshot → backups/index-$ts.html"

echo
echo "📜 Recent git log:"
git log --oneline --graph -5 || true
