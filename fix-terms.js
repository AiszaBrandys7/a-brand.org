const fs = require('fs');
const tos = 'tos.html';

if (!fs.existsSync(tos)) {
  console.error('Nie znaleziono pliku tos.html');
  process.exit(1);
}

let html = fs.readFileSync(tos, 'utf8');

// usuń pełny site-header z menu
html = html.replace(/<header[^>]*class="[^"]*site[^"]*"[\s\S]*?<\/header>/gi, '');

// zostaw tylko lekki top bar jak w privacy
if (!html.includes('legal-top')) {
  const topBar = `
  <header class="legal-top">
    <div class="top-inner">
      <a class="brand-link" href="index.html">
        <span class="brand-dot" aria-hidden="true"></span>
        <span>a-brand.org</span>
      </a>
      <a class="back-link" href="index.html">Back to site</a>
    </div>
  </header>`;
  html = html.replace(/<body[^>]*>/i, '<body>' + topBar);
}

// wymuś jednolitą szerokość i odstępy jak w privacy
html = html.replace(/<main[^>]*>/i, '<main style="max-width:850px;margin:0 auto;padding:54px 18px 60px;">');

// popraw nagłówek i tytuł
html = html.replace(/<h1[^>]*>.*?<\/h1>/i, '<h1>Terms of Use</h1>');

// usuń błędne odnośniki do siebie, zostaw jednolite linkowanie
html = html.replace(/href="[^"]*privacy[^"]*"/gi, 'href="privacy.html"');
html = html.replace(/href="[^"]*tos[^"]*"/gi, 'href="tos.html"');

// wklej końcówkę stopki jak w privacy
if (!html.includes('<footer')) {
  html += `
  <footer>
    © 2025 A-Brand Marketing. All rights reserved.
  </footer>
</body></html>`;
}

fs.writeFileSync(tos, html, 'utf8');
console.log('✅ Terms of Use ujednolicony z Privacy Policy');
