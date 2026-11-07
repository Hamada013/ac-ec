'use strict';
// Full journey through the local research server, in a real browser.
// Run: AC_PLAYWRIGHT=/path/to/node_modules/playwright node tests/browser.cjs [screenshot folder]
const assert=require('node:assert/strict'),cp=require('node:child_process'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const pw=require(process.env.AC_PLAYWRIGHT||'playwright'),root=path.resolve(__dirname,'..'),shots=process.argv[2];
const port=8990,dir=fs.mkdtempSync(path.join(os.tmpdir(),'acec-')),base=`http://127.0.0.1:${port}/`;
async function journey(engine){
 const browser=await pw[engine].launch(),ctx=await browser.newContext({viewport:{width:1280,height:800},acceptDownloads:true}),page=await ctx.newPage(),errors=[];openBrowsers.push(browser);page.setDefaultTimeout(12000);
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().includes('/api/'))errors.push(r.status()+' '+r.url());});
 await page.goto(base);
 // Local server for this run listens on a test port, so point the sheet icon at it.
 await page.locator('#addChild').click();await page.fill('#childForm [name=name]','ليان');await page.fill('[name=day]','32');await page.fill('[name=month]','3');await page.fill('[name=year]','2022');await page.locator('#childForm [type=submit]').click();
 assert.match(await page.locator('#childError').textContent(),/تاريخ ميلاد/,'bad birth date is refused');
 await page.fill('[name=day]','٠٥');await page.locator('#childForm [type=submit]').click();
 assert.equal(await page.evaluate(()=>store.children[0].dob),'2022-03-05','Arabic digits accepted');
 assert.match(await page.evaluate(()=>store.children[0].code),/^C-[0-9A-Z]{8}$/);
 await page.locator('[data-start="split"]').click();
 assert.equal(await page.locator('.pane').count(),2,'split shows both tests');
 const box=async s=>page.locator(s).boundingBox(),a=await box('.pane-ac'),e=await box('.pane-ec');assert.ok(Math.abs(a.y-e.y)<2&&a.x>e.x,'AC and EC side by side on a wide screen');
 assert.ok(await page.locator('.bands .start').first().textContent(),'start point marked');
 if(shots)await page.waitForTimeout(150);
 const answer=async(t,n,v)=>{await page.locator(`#item-${t}-${n} [data-answer="${v}"]`).click();};
 const run=async(t,from,to,v)=>{for(const it of M.ITEMS[t].slice(from,to))await answer(t,it.n,v);},bandAt=(t,i)=>M.bandLabel(M.DATA[t][M.ITEMS[t][i].band]);
 await run('ac',20,33,'pass');await run('ac',33,40,'fail');
 assert.ok((await page.locator('#chip-ac').textContent()).includes(bandAt('ac',32)));assert.doesNotMatch(await page.locator('#chip-ac').textContent(),/أولي/);
 await run('ec',14,24,'pass');await run('ec',24,31,'fail');
 assert.ok((await page.locator('#chip-ec').textContent()).includes(bandAt('ec',23)));
 // Tapping a chosen answer again clears it; other pane's scroll stays put.
 const before=await page.evaluate(()=>document.getElementById('body-ec').scrollTop);await answer('ac',M.ITEMS.ac[20].n,'pass');await answer('ac',M.ITEMS.ac[20].n,'pass');await answer('ac',M.ITEMS.ac[20].n,'pass');assert.equal(await page.evaluate(()=>document.getElementById('body-ec').scrollTop),before);
 // Instructions, picture and note open in place.
 await page.locator('#item-ac-24 [data-how]').click();assert.ok(await page.locator('#how-ac-24').isVisible());
 await page.locator('#item-ac-24 [data-img]').click();await page.waitForFunction(()=>document.querySelector('#pic-ac-24 img')?.naturalWidth>0);
 await page.locator('#item-ac-24 [data-note]').click();await page.fill('#note-ac-24','ملاحظة');
 if(shots){await page.locator('#item-ac-24 [data-img]').click();await page.locator('#item-ac-24 [data-how]').click();await page.screenshot({path:`${shots}/${engine}-split.png`});}
 // Single test views.
 await page.locator('[data-mode="ac"]').click();assert.equal(await page.locator('.pane').count(),1);await page.locator('[data-mode="split"]').click();
 // A new skill shows its tag and source.
 await page.locator('#item-ec-65 [data-how]').click();assert.match(await page.locator('#how-ec-65 .source').textContent(),/ASHA/);assert.equal(await page.locator('#item-ec-65 .tag').count(),1);
 // Saved over a reload.
 await page.reload();assert.equal(await page.evaluate(n=>store.children[0].assessments[0].answers.ac[n],M.ITEMS.ac[30].n),'pass');assert.equal(await page.evaluate(()=>store.children[0].assessments[0].notes.ac[24]),'ملاحظة');
 // Report, in plain language with no scoring jargon.
 await page.locator('[data-open-report]').first().click();
 const text=await page.locator('.rep-page').innerText();assert.match(text,/الفهم السمعي/);assert.match(text,/أقل من عمره/);assert.match(text,/الخطوات التالية/);assert.doesNotMatch(text,/raw|basal|ceiling|percentile|standard score|bell/i);assert.doesNotMatch(text,/undefined|NaN|\[object/);
 assert.equal(await page.locator('.rep-block svg').count(),1,'no progress chart with one visit');
 if(shots)await page.screenshot({path:`${shots}/${engine}-report.png`,fullPage:true});
 // Print shows the report alone.
 await page.evaluate(()=>{window.print=()=>{window.__printed=true;};});await page.locator('#savePdf').click();assert.equal(await page.evaluate(()=>window.__printed),true);
 await page.emulateMedia({media:'print'});assert.equal(await page.locator('.rep-tools').isVisible(),false);assert.ok(await page.locator('.rep-page').isVisible());await page.emulateMedia({media:'screen'});
 // Sheet icon: consent and details are required, and the name never travels.
 const sent=[];page.on('request',r=>{if(r.url().includes('/api/research')&&r.method()==='POST')sent.push(r.postData());});
 await page.locator('#sendSheet').click();await page.locator('#researchForm [type=submit]').click();assert.match(await page.locator('#researchError').textContent(),/موافقة/);assert.equal(sent.length,0);
 await page.locator('.consent input').check();await page.locator('#researchForm [type=submit]').click();assert.match(await page.locator('#researchError').textContent(),/أكمل/);assert.equal(sent.length,0);
 for(const v of ['female','syrian','no','normal','none'])for(const input of await page.locator(`#researchForm input[type=radio][value="${v}"]`).all())await input.check({force:true});
 await page.locator('#researchForm [type=submit]').click();await page.locator('#toast:not([hidden])').waitFor();assert.match(await page.locator('#toast').textContent(),/ملف البحث/);
 assert.equal(sent.length,1);assert.doesNotMatch(sent[0],/ليان|2022-03-05|ملاحظة/);
 await page.locator('#closeReport').click();
 // Retest on a later date: a new visit, the old one kept, progress appears.
 await page.evaluate(()=>{const c=activeChild(),v=c.assessments[0];v.date='2026-05-05';save();});await page.reload();
 assert.match(await page.locator('.card p.muted').first().textContent(),/زيارة جديدة/);
 await page.locator('[data-start="split"]').click();assert.equal(await page.evaluate(()=>activeChild().assessments.length),2,'retest adds a visit');
 await run('ac',20,42,'pass');await run('ac',42,49,'fail');
 await page.locator('#goHome').click();assert.ok(await page.locator('.home svg polyline').count()>0,'progress on the child page');
 if(shots)await page.screenshot({path:`${shots}/${engine}-home.png`,fullPage:true});
 await page.locator('[data-open-report]').first().click();assert.ok(await page.locator('.rep-page polyline').count()>0,'progress in the report');
 if(shots){await page.screenshot({path:`${shots}/${engine}-report2.png`,fullPage:true});}
 await page.locator('#closeReport').click();
 // Two children stay separate; deleting needs confirming.
 await page.locator('#addChild').click();await page.fill('#childForm [name=name]','سامي');await page.fill('[name=day]','1');await page.fill('[name=month]','1');await page.fill('[name=year]','2024');await page.locator('#childForm [type=submit]').click();
 assert.equal(await page.evaluate(()=>activeChild().assessments.length),0);
 await page.locator('[data-child]').first().click();assert.equal(await page.evaluate(()=>activeChild().assessments.length),2);
 await page.locator('[data-delete-visit]').first().click();await page.locator('#confirmDialog [data-close-dialog]').click();assert.equal(await page.evaluate(()=>activeChild().assessments.length),2,'cancel keeps the visit');
 // Phone: split stacks, nothing runs off the side, targets stay tappable.
 await page.setViewportSize({width:390,height:844});await page.locator('[data-resume]').first().click();await page.locator('[data-mode="split"]').click();
 const pa=await box('.pane-ac'),pe=await box('.pane-ec');assert.ok(pa.y<pe.y,'stacked on a phone');assert.ok(pa.height>180&&pe.height>180,'both panes usable');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 const small=await page.evaluate(()=>[...document.querySelectorAll('.topbar button,.ans')].filter(b=>b.offsetParent&&b.getBoundingClientRect().height<36).length);assert.equal(small,0);
 if(shots)await page.screenshot({path:`${shots}/${engine}-phone.png`});
 await page.setViewportSize({width:844,height:390});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);if(shots)await page.screenshot({path:`${shots}/${engine}-landscape.png`});
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS',engine);
}
const M=require('../assets/model.js'),openBrowsers=[];
(async()=>{
 const server=cp.spawn(process.execPath,[path.join(root,'scripts/research-server.mjs')],{env:{...process.env,RESEARCH_PORT:String(port),RESEARCH_DIR:dir},stdio:'ignore'});
 try{
  for(let i=0;i<50;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  for(const engine of ['chromium','webkit'])await journey(engine);
  const data=JSON.parse(fs.readFileSync(path.join(dir,'dataset.json'),'utf8'));assert.ok(data.assessments.length>=1);assert.doesNotMatch(JSON.stringify(data),/ليان|سامي/);assert.ok(fs.statSync(path.join(dir,'ac-ec-research.xlsx')).size>1000);
  // The server refuses a malformed record and drops unknown fields such as a name.
  const bad=await fetch(base+'api/research',{method:'POST',body:'{"childCode":"bad"}'});assert.equal(bad.status,400);
  await fetch(base+'api/research',{method:'POST',body:JSON.stringify({assessmentId:'x',childCode:'C-ABCD1234',visitMonth:'2026-01',ageMonths:30,name:'SECRET',tests:{}})});assert.doesNotMatch(fs.readFileSync(path.join(dir,'dataset.json'),'utf8'),/SECRET/);
  for(const f of ['research/dataset.json','scripts/workbook.mjs'])assert.equal((await fetch(base+f)).status,404,f);
  console.log('PASS server');
 }finally{server.kill();for(const b of openBrowsers)await b.close().catch(()=>{});}
})().catch(async e=>{console.error(e);for(const b of openBrowsers)await b.close().catch(()=>{});process.exit(1);});
