#!/bin/bash
set -euo pipefail

mkdir -p backups
ts=$(date +"%Y-%m-%d-%H-%M-%S")

# Snapshot index.html
if [ -f index.html ]; then
  cp index.html "backups/index-$ts.html"
  echo "🗂 Snapshot → backups/index-$ts.html"
fi

# Init git if needed
if [ ! -d .git ]; then
  git init
  git config user.name "A-Brand Bot"
  git config user.email "hello@a-brand.org"
fi

# 1. Usuń link do Testimonials z menu
sed -i '' 's/Testimonials//g' index.html

# 2. Dodaj privacy block zawsze przed </body> (usuń stary jeśli był)
sed -i '' '/We respect your privacy/d' index.html
sed -i '' '/<\/body>/i\
<section class="container">\
  <h2>We respect your privacy</h2>\
  <p>We respect your privacy. See our full <a href="privacy.html">Privacy Policy</a> and <a href="terms.html">Terms</a>.</p>\
</section>\
' index.html

# 3. Wstaw footer przed </body> (usuń stary jeśli był)
sed -i '' '/<footer>/,/<\/footer>/d' index.html
sed -i '' '/<\/body>/i\
<footer>\
  <div class="container">\
    <div>© 2025 A-Brand Marketing — Worldwide.</div>\
    <div style="margin-top:8px" class="muted">\
      <a href="#contact">Contact</a> · <a href="#roi">ROI</a> · <a href="privacy.html">Privacy Policy</a> · <a href="terms.html">Terms</a>\
    </div>\
  </div>\
</footer>\
' index.html

# 4. Git commit
git add index.html backups/
git commit -m "Force add: privacy + footer + nav cleaned ($ts)" || true

echo "✅ Update done (privacy + footer forced, nav cleaned)"
echo
echo "📜 Recent git log:"
git log --oneline --graph -5 || true
