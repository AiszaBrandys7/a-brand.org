const fs = require('fs');
const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

// 1) usuń poprzednią naszą łatkę, jeśli była
html = html.replace(/<script id="roi-final-polish">[\s\S]*?<\/script>\s*/g, '');
html = html.replace(/<style id="roi-final-polish">[\s\S]*?<\/style>\s*/g, '');

// 2) CSS: trochę szerszy calc, kontakt ciut ciaśniej, małe napisy
const css =
'<style id="roi-final-polish">\n'
+ '#roi.roi-shell{padding-top:30px;}\n'
+ '#roi .roi-grid{display:flex;gap:28px;align-items:flex-start;}\n'
+ '#roi .roi-calc{flex:0 0 56%;min-width:480px;}\n'
+ '#roi .roi-contact{flex:1;max-width:360px;}\n'
+ '#roi .roi-contact small, #roi .roi-contact .contact-meta{font-size:0.65rem;line-height:1.25;color:rgba(255,255,255,.45);}\n'
+ '#roi .roi-out{margin-top:12px;font-size:.7rem;line-height:1.35;}\n'
+ '@media (max-width:950px){#roi .roi-grid{flex-direction:column;}#roi .roi-calc{min-width:0;width:100%;}#roi .roi-contact{max-width:100%;}}\n'
+ '</style>\n';

// 3) JS z poprawioną logiką
const js = [
  '<script id="roi-final-polish">',
  "document.addEventListener('DOMContentLoaded', function(){",
  "  var wrap = document.getElementById('roi');",
  "  if (!wrap) return;",
  "  function num(el, defVal){",
  "    if (!el) return defVal;",
  "    var v = (el.value || '').toString().replace(/,/g,'').trim();",
  "    var n = parseFloat(v);",
  "    return isNaN(n) ? defVal : n;",
  "  }",
  "  function fmt(n){",
  "    return n.toLocaleString('en-US', {maximumFractionDigits:0});",
  "  }",
  "  var tEl = wrap.querySelector('[name=\"roi-traffic\"], input[data-roi=\"traffic\"], input[name=\"traffic\"]');",
  "  var crEl = wrap.querySelector('[name=\"roi-cr\"], input[data-roi=\"cr\"], input[name=\"cr\"]');",
  "  var ltvEl = wrap.querySelector('[name=\"roi-ltv\"], input[data-roi=\"ltv\"], input[name=\"ltv\"]');",
  "  var ccyEl = wrap.querySelector('select[name=\"roi-ccy\"], select[data-roi=\"ccy\"]');",
  "  var invEl = wrap.querySelector('[name=\"roi-investment\"], input[data-roi=\"investment\"], input[name=\"investment\"]');",
  "  var btn  = wrap.querySelector('button, input[type=\"submit\"], #calc, #roi-btn, #calc-roi');",
  "  var out  = wrap.querySelector('.roi-out');",
  "  var note = wrap.querySelector('.roi-footnotes');",
  "  function calc(){",
  "    var userTraffic = num(tEl, 0);",
  "    var cr = num(crEl, 1.5);",
  "    var ltv = num(ltvEl, 800);",
  "    var ccy = ccyEl ? ccyEl.value : 'EUR';",
  "    var inv = num(invEl, 0);",
  "    if (inv < 0) inv = 0;",
  "    var usedInv = inv > 0 ? inv : 0;",
  "    if (usedInv > 0 && usedInv < 250) usedInv = 250;",
  "    var budgetTraffic = 800 + usedInv * 0.2;",
  "    if (budgetTraffic > 20000) budgetTraffic = 20000;",
  "    var finalTraffic = userTraffic > 0 ? userTraffic : budgetTraffic;",
  "    if (finalTraffic < 0) finalTraffic = 0;",
  "    var leads = finalTraffic * (cr / 100);",
  "    var revenue = leads * ltv;",
  "    var roi = 0;",
  "    var cpl = null;",
  "    if (usedInv > 0){",
  "      roi = ((revenue - usedInv) / usedInv) * 100;",
  "      if (roi < 0) roi = 0;",
  "      if (roi > 320) roi = 320;",
  "      if (leads > 0) cpl = usedInv / leads;",
  "    }",
  "    if (out){",
  "      out.innerHTML = 'Est. monthly value: ' + fmt(Math.round(revenue)) + ' ' + ccy + ' • Est. ROI: ' + roi.toFixed(1) + '% • Est. leads: ' + Math.round(leads);",
  "    }",
  "    if (note){",
  "      var parts = [];",
  "      parts.push('Live calc: user traffic wins, budget fills gaps, ROI capped at 320%.');",
  "      if (cpl !== null) parts.push('Est. cost per lead: ' + cpl.toFixed(2) + ' ' + ccy);",
  "      note.innerHTML = '<p class=\"small\">' + parts.join(' ') + '</p>';",
  "    }",
  "  }",
  "  [tEl, crEl, ltvEl, ccyEl, invEl].forEach(function(el){",
  "    if (el) el.addEventListener('input', calc);",
  "  });",
  "  if (btn) btn.addEventListener('click', function(e){ e.preventDefault(); calc(); });",
  "  calc();",
  "});",
  '</script>',
  ''
].join('\n');

// 4) wstrzyknij na końcu
if (html.includes('</body>')) {
  html = html.replace('</body>', css + js + '\n</body>');
} else {
  html = html + '\n' + css + js + '\n';
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ ROI podrasowane: layout równy, ROI max 320%, CPL jeden raz, kontakt mniejszy.');
