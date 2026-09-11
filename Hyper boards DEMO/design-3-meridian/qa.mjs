import { chromium } from 'playwright-core';
import axe from 'axe-core';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, resolve } from 'node:path';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
const root=dirname(fileURLToPath(import.meta.url));
const output=resolve(root,'../../artifacts/premium-showcase/meridian');
await mkdir(output,{recursive:true});
const server=createServer(async(req,res)=>{
 try {
  const filename=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
  const target=resolve(root,'.'+filename);
  if(!target.startsWith(root)) {res.writeHead(403).end();return;}
  const data=await readFile(target);
  res.writeHead(200,{'Content-Type':({'.html':'text/html','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.woff2':'font/woff2'})[extname(target)]||'application/octet-stream'}).end(data);
 }catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({channel:'msedge',headless:true});
const result={routes:[],interactions:[],errors:[]};
function assert(condition,message){if(!condition)throw new Error(message);result.interactions.push(message);}
try{
for(const width of [1440,768,390]){
 const page=await browser.newPage({viewport:{width,height:1000}});
 page.on('pageerror',e=>result.errors.push(String(e)));
 for(const route of ['index.html','what-we-acquire.html','sell-your-business.html']){
  await page.goto(`${base}/${route}`);
  await page.evaluate(()=>document.fonts.ready);
  if(await page.locator('[data-motion-toggle]').count()) await page.locator('[data-motion-toggle]').click();
  await page.evaluate(async()=>{
   for(const image of document.images){image.loading='eager';await image.decode().catch(()=>{});}
   document.querySelectorAll('.will-reveal').forEach(el=>el.classList.remove('will-reveal'));
  });
  await page.addScriptTag({content:axe.source});
  const violations=await page.evaluate(async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})));
  const sizes=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  result.routes.push({width,route,...sizes,violations});
  if(sizes.scroll>sizes.client)throw new Error(`Overflow ${width} ${route}`);
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:join(output,`${width}-${route}.png`),fullPage:true});
  if(route==='index.html')await page.screenshot({path:join(output,`${width}-hero.png`)});
 }
 if(width<961){
  await page.locator('[data-menu]').focus();await page.keyboard.press('Enter');
  assert(await page.locator('[data-menu]').getAttribute('aria-expanded')==='true',`Keyboard menu opens at ${width}`);
  await page.keyboard.press('Escape');
  assert(await page.locator('[data-menu]').getAttribute('aria-expanded')==='false',`Escape closes menu at ${width}`);
  assert(await page.locator('[data-menu]').evaluate(el=>el===document.activeElement),`Menu focus returns at ${width}`);
 }
 await page.close();
}
const page=await browser.newPage({viewport:{width:1440,height:1000}});
await page.goto(`${base}/index.html`);
const sectors=page.locator('[data-sector]');
for(let i=0;i<await sectors.count();i++){
 await sectors.nth(i).click();
 assert(await page.locator('[data-sector-title]').textContent()===await sectors.nth(i).getAttribute('data-title'),`Sector ${i+1} updates rationale`);
}
for(const [i,faq] of (await page.locator('.faq-items details').all()).entries()) {await faq.locator('summary').focus();await page.keyboard.press('Enter');assert(await faq.getAttribute('open')!==null,`FAQ ${i+1} opens by keyboard`);}
await page.goto(`${base}/sell-your-business.html?industry=manufacturing`);
assert(await page.locator('[name=industry]').inputValue()==='manufacturing','Industry deep link fills valid option');
await page.locator('[name=fullName]').fill('Local QA');await page.locator('[name=email]').fill('qa@example.test');await page.locator('[name=company]').fill('Local QA company');await page.locator('[name=location]').fill('Local QA city');await page.locator('[name=ebitda]').selectOption('1m-2m');await page.locator('[name=role][value=owner]').check();await page.locator('[name=message]').fill('Local browser verification; no production submission is made.');await page.locator('[name=acknowledgement]').check();
let lastPayload;
await page.route('**/api/inquiries',async route=>{
 lastPayload=new URLSearchParams(route.request().postData());
 assert(route.request().headers().accept==='application/json','Inquiry requests JSON');
 assert(route.request().headers()['content-type'].includes('application/x-www-form-urlencoded'),'Inquiry uses URL encoded payload');
 await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({ok:false,message:'Online submission is not yet connected. No information was delivered.'})});
});
await page.locator('[type=submit]').click();await page.locator('[data-form-status][data-state=error]').waitFor();
assert(await page.locator('[name=fullName]').inputValue()==='Local QA','Failure preserves entered data');
assert(lastPayload.get('acknowledgement')==='true'&&lastPayload.get('role')==='owner','Form payload matches required backend values');
await page.unroute('**/api/inquiries');
await page.route('**/api/inquiries',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,message:'Mock success: local test only.'})}));
await page.locator('[type=submit]').click();await page.locator('[data-form-status][data-state=success]').waitFor();
assert(await page.locator('[name=fullName]').inputValue()==='','Confirmed success resets form');
const noJS=await browser.newPage({viewport:{width:390,height:844},javaScriptEnabled:false});
await noJS.goto(`${base}/index.html`);
assert(await noJS.locator('h1').isVisible(),'No-JS heading visible');
assert(await noJS.locator('.nav').isVisible(),'No-JS navigation visible');
assert(await noJS.evaluate(()=>document.documentElement.scrollWidth===document.documentElement.clientWidth),'No-JS mobile has no overflow');
const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await reduced.goto(`${base}/index.html`);
assert(await reduced.locator('.art-float').evaluate(el=>getComputedStyle(el).animationName)==='none','Reduced motion stops ambient animation');
assert(await reduced.locator('.sector-fallback').isHidden(),'Native sector fallback hides after successful enhancement');
const failedScript=await browser.newPage({viewport:{width:390,height:844}});
await failedScript.route('**/script.js',route=>route.abort());
await failedScript.goto(`${base}/index.html`);
assert(await failedScript.locator('.sector-fallback').isVisible(),'Failed script keeps native sector fallback visible');
await failedScript.locator('.sector-fallback summary').click();
assert(await failedScript.locator('.sector-fallback dt').count()===9,'Failed script preserves all nine sector explanations');
}finally{
await writeFile(join(output,'report.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify(result));
await browser.close();server.close();
}
