const fs = require('fs');
const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

// 1) CSS – ładniejszy układ ROI + Contact
const css = `
<style id="a-brand-roi-layout">
  /* kontener całej sekcji ROI */
  #roi .roi-wrap {
    max-width: 1180px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.65fr);
    gap: 32px;
    align-items: flex-start;
  }
  /* lewy box z kalkiem niech będzie na 100% tego lewego grida */
  #roi .roi-card {
    width: 100%;
  }
  /* nagłówek nad dwiema kolumnami */
  #roi .roi-heading {
    grid-column: 1 / -1;
    margin-bottom: 6px;
  }

  /* trochę ciaśniej w sekcji */
  #roi {
    padding-top: 48px;
    padding-bottom: 44px;
  }

  /* mobile – jedna kolumna, mniejsze gapy, mniejszy margines nad services */
  @media (max-width: 820px) {
    #roi .roi-wrap {
      grid-template-columns: 1fr;
      gap: 20px;
      padding: 0 18px;
    }
    #roi {
      padding-top: 34px;
      padding-bottom: 36px;
    }
  }
</style>
`;

// 2) JS – usuń duplikaty nagłówków/leadów w tej sekcji
const js = `
<script id="a-brand-roi-clean">
document.addEventListener('DOMContentLoaded', function(){
  var roi = document.getElementById('roi');
  if (!roi) return;

  // helper: usuń wszystkie elementy z danym tekstem oprócz pierwszego
  function keepFirstByText(texts){
    texts.forEach(function(txt){
      var firstFound = false;
      roi.querySelectorAll('*').forEach(function(el){
        var t = (el.textContent || '').trim();
        if (!t) return;
        if (t === txt) {
          if (firstFound) {
            el.remove();
          } else {
            firstFound = true;
          }
        }
      });
    });
  }

  keepFirstByText([
    'READY TO MEASURE & TALK?',
    'READY TO MEASURE & TALK.',
    'Estimate your ROI',
    'Directional — to decide if now is the right moment.'
  ]);

  // w środku boxa – zostaw tylko 1 "Est. cost per lead"
  var cplSeen = false;
  roi.querySelectorAll('.roi-card *').forEach(function(el){
    var t = (el.textContent || '').trim();
    if (t.indexOf('Est. cost per lead') === 0) {
      if (cplSeen) {
        el.remove();
      } else {
        cplSeen = true;
      }
    }
  });

  // jeśli nie ma wrappera, to niech obecne dzieciak roia dostaną klasę
  if (!roi.querySelector('.roi-wrap')) {
    var inner = document.createElement('div');
    inner.className = 'roi-wrap';
    // przenieś wszystkie dzieci do środka
    while (roi.firstChild) {
      inner.appendChild(roi.firstChild);
    }
    roi.appendChild(inner);
  }

  // pierwszy nagłówek (h2/h3/p z eyebrow) oznacz jako heading
  var wrap = roi.querySelector('.roi-wrap');
  if (wrap) {
    var firstBlock = wrap.firstElementChild;
    if (firstBlock) firstBlock.classList.add('roi-heading');
  }
});
</script>
`;

// wyczyść stare wersje jeśli były
html = html
  .replace(/<style id="a-brand-roi-layout">[\s\S]*?<\/style>/g, '')
  .replace(/<script id="a-brand-roi-clean">[\s\S]*?<\/script>/g, '');

// wstrzyknij przed </body>
if (html.includes('</body>')) {
  html = html.replace('</body>', css + js + '\n</body>');
} else {
  html = html + '\n' + css + js + '\n';
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ ROI layout + cleanup wstrzyknięty.');
