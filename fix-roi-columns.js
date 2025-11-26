const fs = require('fs');
const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

// usuń duplikat dolnej sekcji ROI (czasem po wklejeniu JS)
html = html.replace(/<section id="roi"[\s\S]*?<\/section>\s*<\/section>/g, '</section>');

// dodaj poprawkę CSS na równą wysokość kolumn
const patch = `
<style id="roi-column-fix">
  #roi .roi-grid {
    align-items: stretch !important;
  }
  #roi .roi-calc, #roi .roi-contact {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    min-height: 480px;
  }
  #roi .roi-contact form {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }
  #roi .roi-contact textarea {
    flex-grow: 1;
  }
</style>
`;

if (!html.includes('id="roi-column-fix"')) {
  html = html.replace('</head>', patch + '\n</head>');
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ ROI layout naprawiony: kolumny równej wysokości, duplikat usunięty.');
