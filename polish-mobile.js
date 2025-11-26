const fs = require('fs');
const FILE = 'index.html';

if (!fs.existsSync(FILE)) {
  console.error('❌ Nie znaleziono index.html – upewnij się, że jesteś w katalogu projektu.');
  process.exit(1);
}

let html = fs.readFileSync(FILE, 'utf8');

const css = `
<style id="a-brand-mobile-polish-final">
@media (max-width: 780px) {
  body { background-attachment: scroll; }
  header.site .nav { height: 60px; gap: 10px; }
  header.site #topnav { gap: 16px; }

  .hero, section#hero { padding-top: 30px !important; padding-bottom: 26px !important; }
  .hero h1 { font-size: clamp(30px, 10vw, 36px); line-height: 1.02; }
  .hero .sub { max-width: 100%; }
  .btn-row { flex-direction: column; align-items: flex-start; width: 100%; gap: 10px; }
  .btn-row .cta, .cta { width: 100%; justify-content: center; border-radius: 999px; }

  section { padding-top: 40px !important; padding-bottom: 42px !important; margin-top: 0 !important; }

  .card, .process .step {
    border-radius: 18px;
    padding: 18px 16px 18px;
    box-shadow: 0 10px 32px rgba(0,0,0,.28);
  }

  #roi .roi-grid { gap: 16px; }
  #roi .roi-card, #roi .roi-calc, #roi .roi-contact {
    padding: 18px 14px 20px !important;
    border-radius: 18px !important;
  }
  #roi .roi-input, #roi textarea.roi-input, #roi input.roi-input {
    border-radius: 12px;
    padding: 10px 12px;
  }
  #roi .roi-btn, #roi .roi-contact button {
    width: 100%;
    border-radius: 999px;
    min-height: 36px;
  }
  #roi .roi-out { word-break: break-word; }

  #contact, section#contact { padding-top: 40px !important; }
  form.contact { border-radius: 18px; padding: 18px 14px 20px; }
  form.contact input, form.contact textarea { border-radius: 12px; }
  form.contact button, form.contact .cta { width: 100%; border-radius: 999px; }

  footer {
    margin-top: 30px;
    padding-top: 28px;
    padding-bottom: 50px;
    text-align: center;
    font-size: .73rem;
  }
}
@media (max-width: 390px) {
  header.site #topnav { gap: 12px; }
  .hero h1 { font-size: 29px; }
  section { padding-left: 0; padding-right: 0; }
}
</style>
`;

// usuń poprzednią wersję jeśli była
html = html.replace(/<style id="a-brand-mobile-polish-final">[\s\S]*?<\/style>/, '');

// wklejamy nowy styl tuż przed </body>
html = html.replace('</body>', `${css}\n</body>`);

fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ Styl mobilny dodany poprawnie przed </body>.');
