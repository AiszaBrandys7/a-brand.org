#!/bin/bash
set -euo pipefail

mkdir -p backups
ts=$(date +"%Y-%m-%d-%H-%M-%S")

# 1. Dodaj privacy block jeśli brak
if ! grep -q "We respect your privacy" index.html; then
  sed -i '' '/<\/main>/i\
<section class="container">\
  <h2>We respect your privacy</h2>\
  <p>We respect your privacy. See our full <a href="privacy_policy_a_brand.pdf" download>Privacy Policy (PDF)</a> and <a href="terms_service_a_brand.pdf" download>Terms (PDF)</a>.</p>\
</section>' index.html
  echo "✅ Privacy note ensured"
fi

# 2. Nadpisz footer
sed -i '' '/<footer>/,/<\/footer>/c\
<footer>\
  <div class="container">\
    <div>© 2025 A-Brand Marketing — Worldwide.</div>\
    <div style="margin-top:8px" class="muted">\
      <a href="#contact">Contact</a> · \
      <a href="#roi">ROI</a> · \
      <a href="privacy_policy_a_brand.pdf" download>Privacy Policy</a> · \
      <a href="terms_service_a_brand.pdf" download>Terms</a>\
    </div>\
  </div>\
</footer>' index.html
echo "✅ Footer ensured"

# 3. Snapshot + commit
cp index.html "backups/index-$ts.html"
if [ ! -d .git ]; then
  git init
  git config user.name "A-Brand Bot"
  git config user.email "hello@a-brand.org"
fi
git add index.html backups/
git commit -m "Fix: privacy + footer ensured ($ts)" || true
echo "🗂 Snapshot saved → backups/index-$ts.html"

# 4. Otwórz stronę w przeglądarce
open index.html || xdg-open index.html || true

echo "🎉 Done! Page opened in browser."
