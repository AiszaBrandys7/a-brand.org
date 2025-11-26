const fs = require('fs');
const files = ['index.html', 'privacy.html', 'tos.html'];

const microStyle = `
<style id="a-brand-micro">
  header.site #topnav a{position:relative;transition:color .18s ease;}
  header.site #topnav a::after{content:"";position:absolute;left:0;right:0;bottom:-14px;height:2px;
  background:linear-gradient(90deg,#6ee7b7,#6ea8ff);border-radius:999px;opacity:0;transform:scaleX(.45);
  transition:opacity .18s ease,transform .18s ease;}
  header.site #topnav a:hover{color:#fff;}
  header.site #topnav a:hover::after{opacity:1;transform:scaleX(1);}
  .card,.process .step{transition:transform .16s ease-out,box-shadow .16s ease-out,border .16s ease-out;}
  .card:hover,.process .step:hover{transform:translateY(-3px);
  box-shadow:0 14px 30px rgba(0,0,0,.25);border:1px solid rgba(110,231,183,.25);}
  #roi .roi-card,#roi .roi-contact,#roi .roi-calc,#roi .roi-shell article{
  transition:transform .14s ease-out,box-shadow .14s ease-out,border .14s ease-out;}
  #roi .roi-card:hover,#roi .roi-contact:hover,#roi .roi-calc:hover{
  transform:translateY(-2px);box-shadow:0 12px 26px rgba(0,0,0,.28);
  border:1px solid rgba(110,231,183,.2);}
  input[type=text],input[type=email],input[type=number],textarea,#roi .roi-input{
  transition:border .14s ease,box-shadow .14s ease,background .14s ease;}
  input:hover,textarea:hover,#roi .roi-input:hover{border:1px solid rgba(110,231,183,.35);
  background:rgba(5,7,13,.5);}
  .cta,#roi .roi-btn,button[type=submit]{transition:transform .1s ease-out,box-shadow .1s ease-out;}
  .cta:active,#roi .roi-btn:active,button[type=submit]:active{transform:scale(.995);}
  @media(max-width:900px){.card:active,.process .step:active,#roi .roi-card:active,#roi .roi-contact:active{
  transform:translateY(-1px);box-shadow:0 10px 20px rgba(0,0,0,.25);}
  header.site #topnav a::after{bottom:-10px;}}
</style>`;

files.forEach(f=>{
  if(!fs.existsSync(f)) return;
  let html=fs.readFileSync(f,'utf8');
  // podmiana maila w tos.html
  if(f==='tos.html') html=html.replace(/[\w.-]+@[\w.-]+/g,'hello@a-brand.org');
  // dołącz micro-style jeśli nie istnieje
  if(!html.includes('a-brand-micro')){
    html=html.replace('</body>', microStyle+'\n</body>');
  }
  fs.writeFileSync(f,html,'utf8');
  console.log('✅ dopieszczony:',f);
});
console.log('🎉 Wszystkie pliki dopieszczone, gotowe do deployu.');
