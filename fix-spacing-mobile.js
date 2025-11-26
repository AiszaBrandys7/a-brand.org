const fs = require('fs');
const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

// żeby nie wstrzykiwać 100 razy
if (!html.includes('/* a-brand mobile spacing fix */')) {
  const style = `
  <style>
  /* a-brand mobile spacing fix */
  :root{
    --section-pad-desktop:56px;
    --section-gap-desktop:46px;
    --section-pad-mobile:34px;
    --section-gap-mobile:22px;
  }
  main section,
  section {
    padding: var(--section-pad-desktop) 0 var(--section-pad-desktop);
  }
  section + section {
    margin-top: var(--section-gap-desktop);
  }
  /* hero trochę ciaśniej, żeby Services nie uciekało */
  .hero,
  section#hero {
    padding-bottom: 40px;
  }

  /* MOBILE */
  @media (max-width: 768px){
    main section,
    section {
      padding: var(--section-pad-mobile) 0 var(--section-pad-mobile);
    }
    section + section {
      margin-top: var(--section-gap-mobile);
    }
    /* te linie-separator, które ci się robiły pod sekcjami – wyzeruj */
    section::after {
      margin-top: 0;
    }
    /* hero jeszcze troszkę bliżej menu */
    .hero,
    section#hero {
      padding-top: 26px;
      padding-bottom: 30px;
    }
  }

  /* bardzo wąskie, np. iPhone SE */
  @media (max-width: 430px){
    main section,
    section {
      padding: 28px 0 30px;
    }
    section + section {
      margin-top: 16px;
    }
  }
  </style>
  `;

  if (html.includes('</head>')) {
    html = html.replace('</head>', style + '\n</head>');
  } else {
    html = style + '\n' + html;
  }

  fs.writeFileSync(FILE, html, 'utf8');
  console.log('✅ spacing CSS injected');
} else {
  console.log('ℹ️ spacing CSS already present – nothing to do');
}
