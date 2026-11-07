'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const M=require('../assets/model.js'),root=path.resolve(__dirname,'..');
const answers=(tst,from,passes,fails)=>{const a={};M.ITEMS[tst].slice(from,from+passes).forEach(i=>{a[i.n]='pass';});M.ITEMS[tst].slice(from+passes,from+passes+fails).forEach(i=>{a[i.n]='fail';});return a;};

test('item data is complete and ages run without gaps',()=>{
 assert.equal(M.ITEMS.ac.length,73);assert.equal(M.ITEMS.ec.length,78);
 for(const t of ['ac','ec']){
  assert.equal(new Set(M.ITEMS[t].map(i=>i.n)).size,M.ITEMS[t].length);assert.equal(new Set(M.ITEMS[t].map(i=>i.text)).size,M.ITEMS[t].length,'no repeated skill');M.ITEMS[t].forEach((it,i)=>{assert.equal(it.pos,i+1);assert.ok(it.text&&it.how);if(it.added)assert.ok(it.source&&it.how.length>30,`${t} ${it.n} needs a source`);else assert.equal(it.source,undefined);if(it.image)assert.ok(fs.existsSync(path.join(root,'images',t,it.n+'.webp')),`${t} ${it.n}`);});
  const bands=M.DATA[t];assert.equal(bands[0].lo,0);assert.equal(bands.at(-1).hi,95);
  for(let i=1;i<bands.length;i++)assert.equal(bands[i].lo,bands[i-1].hi+1);
 }
 assert.equal(M.bandLabel(M.DATA.ec[4]),'1:0–1:5');assert.equal(M.bandLabel(M.DATA.ec[12]),'5:0–5:5');
});
test('credit starts below the first passing run and stops at the failing run',()=>{
 const r=M.analyze('ac',answers('ac',20,13,M.CEILING_RUN));
 assert.equal(r.credited,20);assert.equal(r.raw,33);assert.equal(r.complete,true);assert.equal(r.bandLabel,M.bandLabel(M.DATA.ac[M.ITEMS.ac[32].band]));
 // Answers above the stopping run do not count.
 const a=answers('ac',20,13,M.CEILING_RUN);a[M.ITEMS.ac[60].n]='pass';assert.equal(M.analyze('ac',a).raw,33);
});
test('an unfinished test is marked as preliminary, and a blank is never a score',()=>{
 const blank=M.analyze('ec',{});assert.equal(blank.started,false);assert.equal(blank.langAge,null);assert.equal(blank.complete,false);
 const partial=M.analyze('ac',answers('ac',20,2,1));assert.equal(partial.complete,false);assert.equal(partial.credited,0);assert.equal(partial.raw,2);
 const zero=M.analyze('ac',answers('ac',0,0,M.CEILING_RUN));assert.equal(zero.raw,0);assert.equal(zero.langAge,null);assert.equal(zero.complete,true);
 const unknowns={};M.ITEMS.ac.slice(0,10).forEach(i=>{unknowns[i.n]='unknown';});assert.equal(M.analyze('ac',unknowns).raw,0);
});
test('language age compares plainly with actual age',()=>{
 const r=M.analyze('ac',answers('ac',20,13,M.CEILING_RUN));
 assert.equal(M.compareText(M.compare(r.langAge.lo,r)),'مناسب لعمره');assert.match(M.compareText(M.compare(r.langAge.hi+10,r)),/أقل من عمره/);assert.match(M.compareText(M.compare(r.langAge.lo-5,r)),/أعلى من عمره/);
 assert.equal(M.arabicAge(56),'4 سنوات و8 أشهر');assert.equal(M.arabicAge(24),'سنتان');assert.equal(M.arabicAge(14),'سنة وشهران');
 assert.equal(M.ageMonths('2022-03-05','2026-11-04'),55);assert.equal(M.ageMonths('2022-03-05','2026-11-05'),56);assert.equal(M.ageMonths('2030-01-01','2026-11-05'),null);
});
test('six-month groups cover the test range',()=>{assert.equal(M.GROUPS,16);assert.equal(M.ageGroup(5),0);assert.equal(M.ageGroup(6),1);assert.equal(M.groupLabel(3),'1:6–1:11');assert.equal(M.groupLabel(15),'7:6–7:11');});
test('the research record holds no identifying details',()=>{
 const child={name:'SECRETNAME',code:'C-AB12CD34',dob:'2022-03-05',parent:'SECRETPARENT',research:{sex:'female',dialect:'syrian',otherLanguages:'no',preterm:'no',hearing:'normal',diagnosis:'none'}};
 const visit={id:'v1',date:'2026-11-05',answers:{ac:answers('ac',20,13,7),ec:{}},notes:{ac:{1:'SECRETNOTE'},ec:{}},clinicianNote:'SECRETNOTE'};
 const r=M.researchRecord(child,visit),text=JSON.stringify(r);
 assert.doesNotMatch(text,/SECRET|2022-03-05|2026-11-05/);assert.equal(r.visitMonth,'2026-11');assert.equal(r.ageMonths,56);assert.equal(r.tests.ac.raw,33);assert.equal(r.tests.ec.raw,null);
 assert.equal(M.eligibleForNorms(r),true);for(const bad of [{preterm:'yes'},{hearing:'unknown'},{diagnosis:'yes'},{ageMonths:96}])assert.equal(M.eligibleForNorms({...r,...bad}),false);
});
test('the app meets the PWABuilder manifest checks',()=>{
 const m=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
 for(const k of ['id','name','short_name','description','start_url','scope','display','background_color','theme_color','lang','dir','orientation','categories'])assert.ok(m[k],k);
 const sizes=m.icons.map(i=>`${i.sizes}/${i.purpose}`);for(const s of ['192x192/any','512x512/any','512x512/maskable'])assert.ok(sizes.includes(s),s);
 for(const i of [...m.icons,...m.screenshots])assert.ok(fs.existsSync(path.join(root,i.src)),i.src);
 assert.deepEqual(m.screenshots.map(s=>s.form_factor).sort(),['narrow','wide']);
 const png=f=>{const b=fs.readFileSync(path.join(root,f));return `${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`;};
 for(const i of [...m.icons,...m.screenshots])assert.equal(png(i.src),i.sizes,i.src);
 assert.match(fs.readFileSync(path.join(root,'sw.js'),'utf8'),/addEventListener\('fetch'/);
});
test('no link back to the main website',()=>{
 for(const f of ['index.html','assets/app.js','assets/styles.css','assets/charts.js','manifest.webmanifest'])assert.doesNotMatch(fs.readFileSync(path.join(root,f),'utf8'),/speech-website|forms\.html|resources\.html|\.\.\//,f);
});
