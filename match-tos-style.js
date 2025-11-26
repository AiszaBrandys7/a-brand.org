const fs = require('fs');

const privacy = 'privacy.html';
const tos = 'tos.html';

if (!fs.existsSync(privacy) || !fs.existsSync(tos)) {
  console.error('⚠️ Nie znaleziono privacy.html lub tos.html');
  process.exit(1);
}

let privacyHtml = fs.readFileSync(privacy, 'utf8');
let tosHtml = fs.readFileSync(tos, 'utf8');

// 1️⃣ Pobierz sekcję <style> z privacy
const styleMatch = privacyHtml.match(/<style[^>]*>[\s\S]*?<\/style>/gi);
let styleBlock = styleMatch ? styleMatch.join('\n') : '';

// 2️⃣ Wklej style do tos.html (zastąp stare)
tosHtml = tosHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
tosHtml = tosHtml.replace('</head>', styleBlock + '\n</head>');

// 3️⃣ Ujednolicamy strukturę i nagłówek
tosHtml = tosHtml.replace(/<h1[^>]*>.*?<\/h1>/i, '<h1>Terms of Use</h1>');
tosHtml = tosHtml.replace(/Back to home|Back to site/gi, 'Back to site');

// 4️⃣ Upewnij się, że link do maila jest poprawny
tosHtml = tosHtml.replace(/[\w.-]+@[\w.-]+/g, 'hello@a-brand.org');

// 5️⃣ Zapisz wynik
fs.writeFileSync(tos, tosHtml, 'utf8');
console.log('✨ tos.html dopasowany wizualnie do privacy.html');
