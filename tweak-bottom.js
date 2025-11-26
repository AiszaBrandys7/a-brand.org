const fs = require('fs');
const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

/* 1) CSS: równy dół sekcji ROI + kontakt, mniej luftu, ładny tytułik nad tym */
const css = `
<style id="a-brand-bottom-fixes">
  /* box na ROI + kontakt */
  #roi .roi-layout {
    display: grid;
    grid-template-columns: 1.05fr 0.95fr;
    gap: 26px;
    align-items: stretch;
  }
  #roi .roi-card,
  #roi .contact-card {
    background: rgba(4, 17, 25, 0.35);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.03);
    border-radius: 18px;
    min-height: 360px;
    display: flex;
    flex-direction: column;
  }
  /* w środku kalkulatora: dół przyklejony */
  #roi .roi-card .roi-meta {
    margin-top: auto;
    padding-top: 14px;
    border-top: 1px solid rgba(255,255,255,0.04);
    font-size: 12px;
    line-height: 1.5;
    color: rgba(230,242,255,.6);
  }
  /* troszkę ciaśniej sekcja na dole strony */
  #roi {
    padding-bottom: 44px;
  }
  footer,
  .site-foot,
  #contact + footer {
    padding-top: 28px !important;
    margin-top: 0 !important;
  }
  /* mobile: jeden pod drugim i mniejsze przerwy */
  @media (max-width: 900px) {
    #roi .roi-layout {
      grid-template-columns: 1fr;
      gap: 18px;
    }
    #roi {
      padding-top: 32px;
      padding-bottom: 32px;
    }
  }
</style>
`;

if (!html.includes('a-brand-bottom-fixes')) {
  if (html.includes('</head>')) {
    html = html.replace('</head>', css + '\n</head>');
  } else {
    html = css + '\n' + html;
  }
}

/* 2) jeśli w #roi nie ma wrappera roi-layout, to go wstawiamy wokół dwóch boxów */
if (html.includes('<section id="roi"')) {
  html = html.replace(
    /(<section id="roi"[^>]*>\s*)(?!.*roi-layout)/,
    '$1<div class="roi-layout">\n'
  );
  // domknij przed końcem sekcji, jeżeli jeszcze nie domknięte
  html = html.replace('</section>\n', '</div>\n</section>\n');
}

/* 3) JS: deduplikacja linijek w kalkulatorze (ten problem "Est. cost per lead" 2x) */
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
      // zostawiamy tylko pierwsze wystąpienia takich samych linijek
      if (seen.has(t)) {
        el.remove();
      } else {
        seen.add(t);
      }
    });
  }
  // pierwszy raz od razu
  dedupe();
  // i gdy kalkulator prze-liczy
  var target = document.querySelector('#roi');
  if (target) {
    new MutationObserver(dedupe).observe(target, { childList: true, subtree: true });
  }
});
</script>
`;

if (!html.includes('a-brand-roi-clean')) {
  if (html.includes('</body>')) {
    html = html.replace('</body>', cleaner + '\n</body>');
  } else {
    html = html + '\n' + cleaner;
  }
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ layout ROI+Contact dociśnięty, duplikaty tekstu w kalkulatorze będą usuwane.');
