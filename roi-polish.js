const fs = require('fs');
const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

// JS, który sprząta duplikaty w sekcji ROI po załadowaniu strony
const polish = `
<script id="a-brand-roi-polish">
document.addEventListener('DOMContentLoaded', function(){
  var roi = document.getElementById('roi');
  if (!roi) return;

  // 1) zostaw tylko pierwszy eyebrow
  var eyebrows = roi.querySelectorAll('.roi-eyebrow');
  for (var i = 1; i < eyebrows.length; i++) {
    eyebrows[i].remove();
  }

  // 2) zostaw tylko pierwsze "Directional — to decide if now is the right moment."
  var dirSeen = false;
  roi.querySelectorAll('*').forEach(function(el){
    var t = (el.textContent || '').trim();
    if (!t) return;
    if (
      t === 'Directional — to decide if now is the right moment.' ||
      t === 'Directional — to decide if now is the right moment'
    ) {
      if (dirSeen) {
        el.remove();
      } else {
        dirSeen = true;
      }
    }
  });

  // 3) w boksie z kalkiem zostaw tylko jeden "Est. cost per lead"
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
});
</script>
`;

// usuń poprzednią wersję jeśli była
html = html.replace(/<script id="a-brand-roi-polish">[\s\S]*?<\/script>\s*/g, '');

// wstrzyknij przed </body>
if (html.includes('</body>')) {
  html = html.replace('</body>', polish + '\n</body>');
} else {
  html = html + '\n' + polish + '\n';
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ ROI polish dopisany (usuwa duplikaty nagłówków i CPL).');
