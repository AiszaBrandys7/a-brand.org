const fs = require('fs');
const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

// 1) wywal zbłąkane notki, które mogły się wkleić poza kartę
html = html
  .replace(/<p class="roi-footnote-single"[\s\S]*?<\/p>/g, '')
  .replace(/<p class="roi-cpl"[\s\S]*?<\/p>/g, '')
  // czasem wylądował goły tekst na dole strony
  .replace(/Live calc: user traffic wins, budget fills gaps, ROI capped at 320%\./g, '');

// 2) dopnij krótki skrypt, który PRZY ŁADOWANIU przeniesie notki do środka kalkulatora
const fixScript = `
<script id="roi-dom-fix">
document.addEventListener('DOMContentLoaded', function(){
  var roi = document.querySelector('#roi');
  if (!roi) return;
  var calc = roi.querySelector('.roi-calc');
  if (!calc) return;

  // wszystko co wygląda jak notka o ROI przenosimy do środka kalkulatora
  ['.roi-footnote-single','.roi-cpl','.roi-note','.small.muted'].forEach(function(sel){
    roi.querySelectorAll(sel).forEach(function(el){
      if (!calc.contains(el)) {
        calc.appendChild(el);
      }
    });
  });

  // upewnij się, że tekst jest mały i w jednej kolumnie
  calc.querySelectorAll('.roi-footnote-single, .roi-cpl, .roi-note, .small, .small.muted').forEach(function(el){
    el.style.fontSize = '0.68rem';
    el.style.lineHeight = '1.35';
    el.style.marginTop = '6px';
  });
});
</script>
`;

if (html.includes('</body>')) {
  html = html.replace('</body>', fixScript + '\n</body>');
} else {
  html = html + '\n' + fixScript + '\n';
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ ROI layout naprawiony: notki w środku karty, CAP=320%.');
