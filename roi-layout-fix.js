const fs = require('fs');
const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

/* 1) wyrzuć poprzedni styl, jeśli był */
html = html.replace(/<style id="a-brand-bottom-fixes">[\s\S]*?<\/style>\s*/g, '');

/* 2) nowy, wygodniejszy układ: lewy szerzej, prawy wężej */
const css = `
<style id="a-brand-bottom-fixes">
  #roi {
    padding-top: 38px;
    padding-bottom: 44px;
  }
  #roi .roi-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.22fr) minmax(280px, 0.78fr);
    gap: 26px;
    align-items: start;
  }
  #roi .roi-card,
  #roi .contact-card {
    background: rgba(4, 17, 25, 0.35);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.03);
    border-radius: 18px;
  }
  #roi .roi-card {
    padding: 18px 18px 14px;
    min-height: 360px;
    display: flex;
    flex-direction: column;
  }
  #roi .roi-card h2,
  #roi .roi-card h3 {
    margin-bottom: 10px;
  }
  /* opis pod wynikiem – jeden blok */
  #roi .roi-card .roi-meta {
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid rgba(255,255,255,0.04);
    font-size: 12px;
    line-height: 1.5;
    color: rgba(230,242,255,.6);
  }
  #roi .contact-card {
    padding: 18px 18px 14px;
    min-height: 360px;
  }
  #roi .contact-card form {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  #roi .contact-card input,
  #roi .contact-card textarea {
    width: 100%;
  }
  /* mobile: jeden pod drugim i ciaśniej */
  @media (max-width: 900px) {
    #roi {
      padding-top: 30px;
      padding-bottom: 30px;
    }
    #roi .roi-layout {
      grid-template-columns: 1fr;
      gap: 18px;
    }
    #roi .roi-card,
    #roi .contact-card {
      min-height: auto;
    }
  }
</style>
`;

if (html.includes('</head>')) {
  html = html.replace('</head>', css + '\n</head>');
} else {
  html = css + '\n' + html;
}

/* 3) zostawiamy deduplikator z poprzedniej wersji – jeśli go nie ma, to wstrzykujemy */
if (!html.includes('a-brand-roi-clean')) {
  const cleaner = `
<script id="a-brand-roi-clean">
document.addEventListener('DOMContentLoaded', function () {
  function dedupe() {
    var card = document.querySelector('#roi .roi-card');
    if (!card) return;
    var seen = new Set();
    card.querySelectorAll('p, div').forEach(function (el) {
      var t = (el.textContent || '').trim();
      if (!t) return;
      if (seen.has(t)) {
        el.remove();
      } else {
        seen.add(t);
      }
    });
  }
  dedupe();
  var target = document.querySelector('#roi');
  if (target) {
    new MutationObserver(dedupe).observe(target, { childList: true, subtree: true });
  }
});
</script>
`;
  if (html.includes('</body>')) {
    html = html.replace('</body>', cleaner + '\n</body>');
  } else {
    html = html + '\n' + cleaner;
  }
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ ROI layout: lewy szerzej, prawy wężej, padding poprawiony.');
