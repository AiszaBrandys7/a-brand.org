const fs = require('fs');

// 1) skróć stopkę w index.html
if (fs.existsSync('index.html')) {
  let idx = fs.readFileSync('index.html', 'utf8');
  idx = idx.replace(/<footer[\s\S]*?<\/footer>/i, `
  <footer>
    <p>© 2025 A-Brand Marketing. All rights reserved.</p>
  </footer>
  `);
  fs.writeFileSync('index.html', idx, 'utf8');
  console.log('✅ index.html footer -> tylko copyright');
}

// 2) do privacy.html dopychamy Terms (zachowamy twój styl)
if (fs.existsSync('privacy.html')) {
  let pp = fs.readFileSync('privacy.html', 'utf8');

  // upewnij się, że mamy główny wrapper
  if (!pp.includes('class="legal-shell"')) {
    pp = pp.replace(/<body[^>]*>/i, `<body>\n  <div class="legal-shell">`);
    pp = pp.replace(/<\/body>/i, `  </div>\n</body>`);
  }

  // jeśli nie ma jeszcze sekcji Terms, to ją dodaj
  if (!pp.includes('id="terms-inline"')) {
    pp = pp.replace(/<\/div>\s*<\/body>/i, `
    <h2 id="terms-inline">Terms of Use (summary)</h2>
    <p>By using this website, you agree to use it for lawful, informational, and professional purposes only.</p>
    <h3>1. Intellectual property</h3>
    <p>All text, images, graphics, code, and design elements on this site are the intellectual property of A-Brand Marketing unless otherwise noted.</p>
    <h3>2. Disclaimer</h3>
    <p>Content is provided “as is”, without warranties of any kind. A-Brand Marketing is not liable for decisions made based on the website content.</p>
    <h3>3. Contact</h3>
    <p>For questions about this policy or terms, email <a href="mailto:hello@a-brand.org">hello@a-brand.org</a>.</p>
  </div>
</body>`);
  }

  fs.writeFileSync('privacy.html', pp, 'utf8');
  console.log('✅ privacy.html -> dopisany blok Terms');
}

// 3) tos.html robi przekierowanie do privacy.html
const tosRedirect = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Terms of Use – A-Brand</title>
  <meta http-equiv="refresh" content="0; url=privacy.html">
  <meta name="robots" content="noindex">
</head>
<body>
  <p>Redirecting to <a href="privacy.html">Privacy Policy & Terms</a>…</p>
</body>
</html>
`;
fs.writeFileSync('tos.html', tosRedirect, 'utf8');
console.log('✅ tos.html -> redirect to privacy.html');
