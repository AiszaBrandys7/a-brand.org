const fs = require('fs');
const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

// 1) wyrzuć stare nasze style/skrypty, jeśli były
html = html
  .replace(/<style id="a-brand-roi-layout">[\s\S]*?<\/style>/g, '')
  .replace(/<style id="a-brand-roi-final">[\s\S]*?<\/style>/g, '')
  .replace(/<script id="a-brand-roi-clean">[\s\S]*?<\/script>/g, '')
  .replace(/<script id="a-brand-roi-final">[\s\S]*?<\/script>/g, '');

// 2) nowe style: 2 kolumny, większy calc, mały tekst pod formem
const style = `
<style id="a-brand-roi-final">
  #roi {
    padding: 46px 0 42px;
  }
  #roi .roi-wrap {
    max-width: 1180px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, 0.95fr) minmax(320px, 0.6fr);
    gap: 32px;
    align-items: flex-start;
  }
  #roi .roi-heading {
    grid-column: 1 / -1;
    margin-bottom: 4px;
  }
  /* calc ma być na całą lewą kolumnę */
  #roi .roi-card {
    width: 100%;
    max-width: none;
  }
  /* kontaktowe drobiazgi pod przyciskiem */
  #roi .contact-meta {
    margin-top: 10px;
    font-size: 12.5px;
    line-height: 1.4;
    opacity: .75;
  }
  @media (max-width: 820px) {
    #roi {
      padding: 32px 0 34px;
    }
    #roi .roi-wrap {
      grid-template-columns: 1fr;
      gap: 20px;
      padding: 0 16px;
    }
    #roi .roi-card {
      max-width: 100%;
    }
  }
</style>
`;

// 3) JS: usuń duplikaty i przestaw teksty
const script = `
<script id="a-brand-roi-final">
document.addEventListener('DOMContentLoaded', function(){
  var roi = document.getElementById('roi');
  if (!roi) return;

  // jeśli nie ma wrappera, zrób go
  if (!roi.querySelector('.roi-wrap')) {
    var wrap = document.createElement('div');
    wrap.className = 'roi-wrap';
    while (roi.firstChild) wrap.appendChild(roi.firstChild);
    roi.appendChild(wrap);
  }
  var wrap = roi.querySelector('.roi-wrap');
  if (wrap && wrap.firstElementChild) {
    wrap.firstElementChild.classList.add('roi-heading');
  }

  // 1) w kalkulatorze wywal "READY TO MEASURE..." które siedzi w środku
  var card = roi.querySelector('.roi-card') || roi.querySelector('.calc') || null;
  if (card) {
    card.querySelectorAll('*').forEach(function(el){
      var t = (el.textContent || '').trim();
      if (/^READY TO MEASURE/i.test(t)) {
        el.remove();
      }
    });

    // 2) zostaw tylko 1x "Est. cost per lead"
    var seenCpl = false;
    card.querySelectorAll('*').forEach(function(el){
      var t = (el.textContent || '').trim();
      if (t.indexOf('Est. cost per lead') === 0) {
        if (seenCpl) {
          el.remove();
        } else {
          seenCpl = true;
        }
      }
    });
  }

  // 3) kontakt – przenieś paragrafy pod przycisk
  var contactBox = roi.querySelector('.contact-box, form[action], #contact, .roi-contact');
  if (contactBox) {
    var btn = contactBox.querySelector('button, input[type="submit"]');
    if (btn) {
      // zbierz wszystkie p po przycisku
      var paras = [];
      contactBox.querySelectorAll('p').forEach(function(p){ paras.push(p); });
      if (paras.length) {
        var meta = document.createElement('div');
        meta.className = 'contact-meta';
        paras.forEach(function(p){ meta.appendChild(p); });
        btn.parentNode.insertAdjacentElement('afterend', meta);
      }
    }
  }
});
</script>
`;

// 4) wstrzyknij przed </body>
if (html.includes('</body>')) {
  html = html.replace('</body>', style + script + '\n</body>');
} else {
  html = html + '\n' + style + script + '\n';
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ ROI: powiększony calc, brak duplikatu nagłówka, kontakt z małym tekstem.');
