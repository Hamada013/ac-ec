'use strict';
const M=ACEC,C=ACEC_CHARTS,KEY='ac-ec-cases-v1',$=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ICONS={home:'<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/>',plus:'<path d="M12 5v14M5 12h14"/>',check:'<path d="M5 13l4 4 10-11"/>',close:'<path d="M6 6l12 12M18 6L6 18"/>',question:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7"/><path d="M12 17h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',image:'<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M5 17l5-4 3 2 3-3 3 3"/>',note:'<path d="M5 4h14v11l-5 5H5z"/><path d="M14 20v-5h5M8 9h8M8 13h4"/>',report:'<path d="M6 3h9l4 4v14H6z"/><path d="M9 17v-3M12 17v-6M15 17v-4"/>',sheet:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10h16M4 15h16M10 4v16"/>',share:'<path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 13v7h14v-7"/>',trash:'<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>',edit:'<path d="M4 20l1-4L16 5l3 3L8 19z"/>',research:'<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/>'};
const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
const iconBtn=(name,label,attrs='',cls='')=>`<button type="button" class="icon-btn ${cls}" aria-label="${esc(label)}" title="${esc(label)}" ${attrs}>${icon(name)}</button>`;
const uid=()=>globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2);
const childCode=()=>'C-'+uid().replace(/-/g,'').slice(0,8).toUpperCase();
const todayISO=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
function load(){try{const v=JSON.parse(localStorage.getItem(KEY));if(v&&Array.isArray(v.children))return v;}catch{}return {children:[],activeChild:null};}
let store=load(),view={screen:'home',assessment:null,mode:'split',active:'ac'};
const saveFailed=()=>toast('تعذر الحفظ على هذا الجهاز. أبقِ الصفحة مفتوحة واطبع التقرير.',true);
function save(){try{localStorage.setItem(KEY,JSON.stringify(store));}catch{saveFailed();}}
function toast(text,error=false){const t=$('toast');t.textContent=text;t.className=error?'error':'';t.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>{t.hidden=true;},error?7000:3200);}
const activeChild=()=>store.children.find(c=>c.id===store.activeChild)||null;
const findAssessment=(child,id)=>child?.assessments.find(a=>a.id===id)||null;

/* Home */
const startedVisits=child=>child.assessments.filter(v=>M.analyze('ac',v.answers.ac).started||M.analyze('ec',v.answers.ec).started).sort((x,y)=>x.date.localeCompare(y.date));
const visitPoints=(child,visits)=>visits.map(v=>({label:v.date.slice(0,7),age:M.ageMonths(child.dob,v.date),ac:M.analyze('ac',v.answers.ac).langAge?.mid??null,ec:M.analyze('ec',v.answers.ec).langAge?.mid??null}));
function retestNote(child){if(!child.assessments.length)return '';const today=child.assessments.some(a=>a.date===todayISO()),last=startedVisits(child).at(-1);return `<p class="muted">${today?'توجد زيارة اليوم: ستكمل عليها.':`آخر زيارة ${last?`<span dir="ltr">${esc(last.date)}</span>`:''}. ستبدأ زيارة جديدة وتبقى السابقة محفوظة.`}</p>`;}
function progressCard(child){const visits=startedVisits(child);if(visits.length<2)return '';return `<section class="card rep-block"><h2>تقدم الطفل</h2>${C.progress(visitPoints(child,visits))}</section>`;}
function renderHome(){
 const child=activeChild();
 $('app').innerHTML=`<main class="home"><header class="brand"><img src="icons/logo.svg" width="92" height="92" alt=""><h1>الفهم السمعي والتعبير التواصلي</h1></header>
 <section class="card"><div class="card-head"><h2>الطفل</h2>${iconBtn('plus','إضافة طفل','id="addChild"')}</div>
  ${store.children.length?`<div class="child-list">${store.children.map(c=>{const age=M.ageMonths(c.dob,todayISO());return `<div class="child-row ${c.id===store.activeChild?'selected':''}"><button type="button" class="child-pick" data-child="${c.id}" aria-pressed="${c.id===store.activeChild}"><b dir="auto">${esc(c.name)}</b><small>${age===null?'':esc(M.arabicAge(age))}</small></button>${iconBtn('edit','تعديل بيانات '+c.name,`data-edit-child="${c.id}"`)}</div>`;}).join('')}</div>`:'<p class="muted">أضف طفلاً للبدء.</p>'}</section>
 ${child?`<section class="card"><h2>${child.assessments.length?'إعادة الفحص أو المتابعة':'ابدأ الفحص'}</h2>${retestNote(child)}<div class="start-grid">
  <button type="button" class="start-btn ac" data-start="ac"><strong>AC</strong><span>الفهم السمعي</span></button>
  <button type="button" class="start-btn ec" data-start="ec"><strong>EC</strong><span>التعبير التواصلي</span></button>
  <button type="button" class="start-btn split" data-start="split"><strong>AC | EC</strong><span>الاثنان معاً</span></button></div></section>
 ${progressCard(child)}${child.assessments.length?`<section class="card"><h2>الزيارات</h2><div class="visits">${child.assessments.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(a=>{const ac=M.analyze('ac',a.answers.ac),ec=M.analyze('ec',a.answers.ec);return `<div class="visit"><div><b dir="ltr">${esc(a.date)}</b><small>${ac.started?`AC ${esc(ac.bandLabel||'—')}`:''}${ac.started&&ec.started?' · ':''}${ec.started?`EC ${esc(ec.bandLabel||'—')}`:''}${!ac.started&&!ec.started?'لا إجابات بعد':''}</small></div><div class="row-actions">${iconBtn('edit','متابعة الفحص',`data-resume="${a.id}"`)}${iconBtn('report','التقرير',`data-open-report="${a.id}"`)}${iconBtn('trash','حذف الزيارة',`data-delete-visit="${a.id}"`)}</div></div>`;}).join('')}</div></section>`:''}`:''}
 </main>`;
}

/* Testing */
const resultChip=(test,a,age)=>{const r=M.analyze(test,a.answers[test]);if(!r.started)return 'لم يبدأ';if(!r.band)return 'لا مهارات محتسبة بعد';return `العمر اللغوي \u2066${r.bandLabel}\u2069${r.complete?'':' · أولي'}`;};
function itemRow(test,item,a){
 const v=a.answers[test][item.n],note=a.notes[test]?.[item.n]||'';
 const btn=(val,name,label)=>`<button type="button" class="ans ans-${val} ${v===val?'on':''}" data-answer="${val}" data-test="${test}" data-n="${item.n}" aria-pressed="${v===val}" aria-label="${label}: ${esc(item.text)}" title="${label}">${icon(name)}</button>`;
 return `<article class="item ${v?'done':''}" id="item-${test}-${item.n}"><div class="item-main"><span class="num">${item.pos}</span><p>${esc(item.text)}${item.added?'<span class="tag" title="مهارة مضافة حديثاً، قيد التجربة">جديد</span>':''}</p></div><div class="item-tools"><div class="tools">${iconBtn('info','التعليمات',`data-how="${test}-${item.n}" aria-expanded="false" aria-controls="how-${test}-${item.n}"`,'small')}${item.image?iconBtn('image','الصورة',`data-img="${test}-${item.n}" aria-expanded="false"`,'small'):''}${iconBtn('note','ملاحظة',`data-note="${test}-${item.n}" aria-expanded="${!!note}"`,`small ${note?'has':''}`)}</div><div class="answers" role="group" aria-label="نتيجة المهارة ${item.pos}">${btn('pass','check','يوجد')}${btn('fail','close','لا يوجد')}${btn('unknown','question','غير محدد')}</div></div><div class="how" id="how-${test}-${item.n}" hidden dir="auto">${esc(item.how)}${item.source?`<p class="source" dir="ltr">${esc(item.source)}</p>`:''}</div><div class="pic" id="pic-${test}-${item.n}" hidden></div><textarea class="note" id="note-${test}-${item.n}" data-note-input="${test}-${item.n}" aria-label="ملاحظة على المهارة ${item.pos}" ${note?'':'hidden'}>${esc(note)}</textarea></article>`;
}
function pane(test,a,age){
 const bands=M.DATA[test],start=M.startBand(test,age);
 return `<section class="pane pane-${test}" aria-label="${M.TESTS[test].name}"><header class="pane-head"><div><strong>${M.TESTS[test].short}</strong><span>${M.TESTS[test].name}</span></div><output id="chip-${test}">${esc(resultChip(test,a,age))}</output></header>
 <nav class="bands" aria-label="المجموعات العمرية">${bands.map((b,i)=>`<button type="button" data-band="${test}-${i}" class="${i===start?'start':''}" ${i===start?'aria-current="true"':''}>${M.bandLabel(b)}</button>`).join('')}</nav>
 <div class="pane-body" id="body-${test}">${bands.map((b,i)=>`<div class="band" id="band-${test}-${i}"><h3>${M.bandLabel(b)}${i===start?'<small>عمر الطفل</small>':''}</h3>${M.ITEMS[test].filter(it=>it.band===i).map(it=>itemRow(test,it,a)).join('')}</div>`).join('')}</div></section>`;
}
function renderTest(){
 const child=activeChild(),a=findAssessment(child,view.assessment);if(!a){view.screen='home';return render();}
 const age=M.ageMonths(child.dob,a.date),tests=view.mode==='split'?['ac','ec']:[view.mode];
 $('app').innerHTML=`<div class="work mode-${view.mode}"><header class="topbar">${iconBtn('home','الرئيسية','id="goHome"')}<div class="who"><b dir="auto">${esc(child.name)}</b><small>${age===null?'':esc(M.arabicAge(age))}</small></div><div class="segmented" role="group" aria-label="طريقة العرض">${[['ac','AC'],['ec','EC'],['split','AC | EC']].map(([m,l])=>`<button type="button" data-mode="${m}" aria-pressed="${view.mode===m}">${l}</button>`).join('')}</div>${iconBtn('report','التقرير','id="openReport"','primary')}</header><div class="panes">${tests.map(t=>pane(t,a,age)).join('')}</div></div>`;
 for(const t of tests){const start=M.startBand(t,age);const body=$('body-'+t),band=$(`band-${t}-${start}`);if(view.scroll?.[t]!==undefined)body.scrollTop=view.scroll[t];else if(band)body.scrollTop=band.offsetTop-body.offsetTop;}
}
function rememberScroll(){view.scroll=view.scroll||{};for(const t of ['ac','ec']){const b=$('body-'+t);if(b)view.scroll[t]=b.scrollTop;}}
function setAnswer(test,n,value){
 const child=activeChild(),a=findAssessment(child,view.assessment);if(!a)return;
 if(a.answers[test][n]===value)delete a.answers[test][n];else a.answers[test][n]=value;
 a.updatedAt=new Date().toISOString();save();
 const v=a.answers[test][n],row=$(`item-${test}-${n}`);row.classList.toggle('done',!!v);
 row.querySelectorAll('[data-answer]').forEach(b=>{const on=b.dataset.answer===v;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));});
 $('chip-'+test).textContent=resultChip(test,a,M.ageMonths(child.dob,a.date));
}

/* Report: plain language for families and files. Raw scores and norms stay in the research sheet. */
function reportHTML(child,a){
 const age=M.ageMonths(child.dob,a.date),results={ac:M.analyze('ac',a.answers.ac),ec:M.analyze('ec',a.answers.ec)},run=['ac','ec'].filter(t=>results[t].started);
 const summary=t=>{const r=results[t];if(!r.started)return '';const c=M.compare(age,r);return `<div class="result result-${t}"><span>${M.TESTS[t].name}</span><strong>${r.langAge?esc(M.arabicAge(r.langAge.lo)):'أقل من أول مهارة'}${r.langAge&&r.langAge.lo!==r.langAge.hi?`<small> إلى ${esc(M.arabicAge(r.langAge.hi))}</small>`:''}</strong><em>${esc(M.compareText(c))}</em>${r.complete?'':'<b class="partial">نتيجة أولية: الفحص لم يكتمل</b>'}</div>`;};
 const bars=C.ageBars([{label:'عمر الطفل',value:age,color:C.COLORS.age,text:M.arabicAge(age)},...['ac','ec'].map(t=>({label:M.TESTS[t].name,value:results[t].started?(results[t].langAge?.mid??0):null,color:C.COLORS[t],text:results[t].langAge?M.arabicAge(results[t].langAge.mid):'لم يُفحص'}))]);
 const visits=visitPoints(child,startedVisits(child).filter(v=>v.date<=a.date));
 const lists=run.map(t=>{const s=M.skillsFor(t,a.answers[t]);return `<section class="rep-block"><h3>${M.TESTS[t].name}</h3><div class="two"><div><h4>ما يستطيع الطفل فعله</h4>${s.can.length?`<ul>${s.can.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p class="muted">لم تُسجَّل مهارات بعد.</p>'}</div><div><h4>الخطوات التالية</h4>${s.next.length?`<ul>${s.next.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p class="muted">أتقن جميع المهارات المفحوصة.</p>'}</div></div></section>`;}).join('');
 return `<div class="rep-tools no-print">${iconBtn('close','إغلاق التقرير','id="closeReport"')}<span></span>${iconBtn('sheet','إرسال البيانات إلى ملف البحث','id="sendSheet"')}${iconBtn('share','تنزيل التقرير PDF','id="savePdf"','primary')}</div>
 <article class="rep-page"><header class="rep-head"><img src="icons/logo.svg" width="58" height="58" alt=""><div><h1>تقرير الفهم السمعي والتعبير التواصلي</h1><p><b dir="auto">${esc(child.name)}</b> · ${age===null?'':esc(M.arabicAge(age))} · <span dir="ltr">${esc(a.date)}</span></p></div></header>
 ${run.length?`<div class="results">${run.map(summary).join('')}</div><section class="rep-block"><h3>أين الطفل الآن</h3>${bars}</section>${visits.length>1?`<section class="rep-block"><h3>تقدم الطفل</h3>${C.progress(visits)}</section>`:''}${lists}`:'<p class="muted">لم تُسجَّل إجابات في هذه الزيارة.</p>'}
 <section class="rep-block"><h3>ملاحظات الأخصائي</h3><textarea id="clinicianNote" class="no-print" aria-label="ملاحظات الأخصائي" placeholder="اكتب ملاحظاتك وتوصياتك">${esc(a.clinicianNote||'')}</textarea><p class="print-only" dir="auto">${esc(a.clinicianNote||'')}</p></section>
 <footer class="rep-foot"><p>العمر اللغوي تقدير من ترتيب المهارات، وليس درجة معيارية. يفسّره الأخصائي مع بقية التقييم.</p><p>Ahmad Ghanem · Speech and Language Pathology · Latakia - Syria</p></footer></article>`;
}
function openReport(id){const child=activeChild(),a=findAssessment(child,id);if(!a)return;view.reportId=id;rememberScroll();$('report').innerHTML=reportHTML(child,a);$('report').hidden=false;$('app').hidden=true;scrollTo(0,0);}
function closeReport(){$('report').hidden=true;$('app').hidden=false;render();}

/* Child details: only the research fields are structured, and they never carry a name. */
const choice=(name,label,options,value)=>`<fieldset class="chips"><legend>${label}</legend><div>${options.map(([v,l])=>`<label><input type="radio" name="${name}" value="${v}" ${value===v?'checked':''}><span>${l}</span></label>`).join('')}</div></fieldset>`;
function researchFields(r={}){return choice('sex','الجنس',[['female','أنثى'],['male','ذكر']],r.sex)+choice('dialect','اللهجة في البيت',[['syrian','سورية'],['levantine','شامية أخرى'],['other','أخرى']],r.dialect)+choice('otherLanguages','لغة أخرى في البيت',[['no','لا'],['yes','نعم']],r.otherLanguages)+choice('preterm','وُلد قبل الأوان',[['no','لا'],['yes','نعم']],r.preterm)+choice('hearing','السمع',[['normal','طبيعي'],['loss','نقص سمع'],['unknown','لم يُفحص']],r.hearing)+choice('diagnosis','تشخيص نمائي أو عصبي أو لغوي',[['none','لا يوجد'],['yes','يوجد'],['unknown','غير معروف']],r.diagnosis);}
function readResearch(form){const out={};for(const k of ['sex','dialect','otherLanguages','preterm','hearing','diagnosis'])out[k]=form.elements[k]?.value||'';return out;}
function openChild(id){
 const c=store.children.find(x=>x.id===id),d=$('childDialog'),[y='',m='',day='']=(c?.dob||'').split('-');
 d.innerHTML=`<form method="dialog" id="childForm"><div class="card-head"><h2 id="childTitle">${c?'تعديل بيانات الطفل':'طفل جديد'}</h2>${iconBtn('close','إغلاق','data-close-dialog="childDialog"')}</div>
 <label class="field">الاسم<input name="name" required dir="auto" autocomplete="off" value="${esc(c?.name||'')}"></label>
 <fieldset class="dob"><legend>تاريخ الميلاد</legend><label>اليوم<input name="day" inputmode="numeric" maxlength="2" value="${esc(day)}"></label><label>الشهر<input name="month" inputmode="numeric" maxlength="2" value="${esc(m)}"></label><label>السنة<input name="year" inputmode="numeric" maxlength="4" value="${esc(y)}"></label></fieldset>
 <p id="childError" class="error-text" role="alert"></p><div class="dialog-actions">${c?`<button type="button" class="ghost danger" data-delete-child="${c.id}">حذف الطفل</button>`:'<span></span>'}<button type="submit" class="solid">حفظ</button></div></form>`;
 d.showModal();
 $('childForm').onsubmit=e=>{e.preventDefault();const f=e.target,name=f.elements.name.value.trim(),pad=v=>M.digits(v).trim().padStart(2,'0'),dob=`${M.digits(f.elements.year.value).trim()}-${pad(f.elements.month.value)}-${pad(f.elements.day.value)}`;
  if(!name){$('childError').textContent='أدخل اسم الطفل.';return;}
  if(!M.parseDate(dob)||M.ageMonths(dob,todayISO())===null){$('childError').textContent='أدخل تاريخ ميلاد صحيحاً، لأن العمر اللغوي يعتمد عليه.';return;}
  if(c){c.name=name;c.dob=dob;}else{const fresh={id:uid(),code:childCode(),name,dob,research:{},assessments:[]};store.children.push(fresh);store.activeChild=fresh.id;}
  save();d.close();render();};
}
function startTest(mode){const child=activeChild();if(!child)return;let a=child.assessments.find(x=>x.date===todayISO());if(!a){a={id:uid(),date:todayISO(),answers:{ac:{},ec:{}},notes:{ac:{},ec:{}},createdAt:new Date().toISOString()};child.assessments.push(a);save();}view={...view,screen:'test',assessment:a.id,mode,scroll:undefined};render();}
function confirmBox(title,text,yes,onYes){const d=$('confirmDialog');d.innerHTML=`<h2 id="confirmTitle">${esc(title)}</h2><p>${esc(text)}</p><div class="dialog-actions"><button type="button" class="ghost" data-close-dialog="confirmDialog">إلغاء</button><button type="button" class="solid danger" id="confirmYes">${esc(yes)}</button></div>`;d.showModal();$('confirmYes').onclick=()=>{d.close();onYes();};}

/* Research sheet */
const BRIDGE=['127.0.0.1','localhost'].includes(location.hostname)?location.origin:'http://127.0.0.1:8877';
function openResearch(){
 const child=activeChild(),a=findAssessment(child,view.reportId),d=$('researchDialog');
 d.innerHTML=`<form id="researchForm"><div class="card-head"><h2 id="researchTitle">إرسال إلى ملف البحث</h2>${iconBtn('close','إغلاق','data-close-dialog="researchDialog"')}</div><p class="muted">يُرسل رمز الطفل <b dir="ltr">${esc(child.code)}</b> والعمر والنتائج فقط، دون الاسم أو تاريخ الميلاد أو الملاحظات.</p>${researchFields(child.research)}<label class="consent"><input type="checkbox" name="consent" ${a.researchConsent?'checked':''}><span>وافق ولي الأمر على استخدام هذه البيانات في البحث</span></label><p id="researchError" class="error-text" role="alert"></p><div class="dialog-actions"><span></span><button type="submit" class="solid">${'إرسال'}</button></div></form>`;
 d.showModal();
 $('researchForm').onsubmit=async e=>{e.preventDefault();const f=e.target;if(!f.elements.consent.checked){$('researchError').textContent='لا تُرسل البيانات دون موافقة ولي الأمر.';return;}
  child.research=readResearch(f);a.researchConsent=true;save();
  if(Object.values(child.research).some(v=>!v)){$('researchError').textContent='أكمل كل الخيارات، لأن المعايير تعتمد عليها.';return;}
  const record=M.researchRecord(child,a),submit=f.querySelector('[type=submit]');submit.disabled=true;$('researchError').textContent='';
  try{const res=await fetch(BRIDGE+'/api/research',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(record),signal:AbortSignal.timeout(15000)});if(!res.ok)throw Error((await res.json().catch(()=>({}))).error||'failed');const out=await res.json();d.close();toast(`حُفظت في ملف البحث · ${out.assessments} زيارة`);}
  catch{const blob=new Blob([JSON.stringify(record)],{type:'application/json'}),link=Object.assign(document.createElement('a'),{href:URL.createObjectURL(blob),download:`ac-ec-${record.childCode}-${a.date}.json`});document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(link.href),1000);submit.disabled=false;$('researchError').textContent='خادم الملف غير مشغّل على هذا الجهاز، فنُزّلت البيانات كملف لإضافتها لاحقاً من الكمبيوتر.';}
 };
}
function savePdf(){const child=activeChild(),a=findAssessment(child,view.reportId),note=$('clinicianNote');if(note){a.clinicianNote=note.value;save();$('report').querySelector('.print-only').textContent=note.value;}const old=document.title;document.title=`${child.name} - AC EC - ${a.date}`;addEventListener('afterprint',()=>{document.title=old;},{once:true});print();}

/* Events */
document.addEventListener('click',event=>{
 const b=event.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.closeDialog){$(d.closeDialog).close();return;}
 if(b.id==='addChild')return openChild();
 if(d.child){store.activeChild=d.child;save();return render();}
 if(d.editChild)return openChild(d.editChild);
 if(d.deleteChild){const c=store.children.find(x=>x.id===d.deleteChild);$('childDialog').close();return confirmBox('حذف الطفل؟',`سيُحذف ${c.name} وجميع زياراته من هذا الجهاز.`,'حذف',()=>{store.children=store.children.filter(x=>x.id!==c.id);if(store.activeChild===c.id)store.activeChild=null;save();render();});}
 if(d.deleteVisit)return confirmBox('حذف الزيارة؟','ستُحذف نتائج هذه الزيارة من هذا الجهاز.','حذف',()=>{const c=activeChild();c.assessments=c.assessments.filter(x=>x.id!==d.deleteVisit);save();render();});
 if(d.start)return startTest(d.start);
 if(d.resume){view={...view,screen:'test',assessment:d.resume,scroll:undefined};return render();}
 if(d.openReport)return openReport(d.openReport);
 if(b.id==='goHome'){view.screen='home';return render();}
 if(d.mode){rememberScroll();view.mode=d.mode;return render();}
 if(b.id==='openReport')return openReport(view.assessment);
 if(b.id==='closeReport'){const note=$('clinicianNote'),a=findAssessment(activeChild(),view.reportId);if(note&&a){a.clinicianNote=note.value;save();}return closeReport();}
 if(b.id==='sendSheet')return openResearch();
 if(b.id==='savePdf')return savePdf();
 if(d.answer)return setAnswer(d.test,Number(d.n),d.answer);
 if(d.band){const [t,i]=d.band.split('-'),body=$('body-'+t),band=$(`band-${t}-${i}`);return body.scrollTo({top:band.offsetTop-body.offsetTop,behavior:'smooth'});}
 if(d.how){const el=$('how-'+d.how);el.hidden=!el.hidden;return b.setAttribute('aria-expanded',String(!el.hidden));}
 if(d.note){const el=$('note-'+d.note);el.hidden=!el.hidden;b.setAttribute('aria-expanded',String(!el.hidden));if(!el.hidden)el.focus();return;}
 if(d.img){const [t,n]=d.img.split('-'),el=$('pic-'+d.img);if(!el.firstChild)el.innerHTML=`<img src="images/${t}/${n}.webp" loading="lazy" alt="صورة المهارة ${n}">`;el.hidden=!el.hidden;return b.setAttribute('aria-expanded',String(!el.hidden));}
});
document.addEventListener('input',event=>{const k=event.target.dataset.noteInput;if(!k)return;const [t,n]=k.split('-'),a=findAssessment(activeChild(),view.assessment);if(!a)return;const v=event.target.value;if(v)a.notes[t][n]=v;else delete a.notes[t][n];save();document.querySelector(`[data-note="${k}"]`)?.classList.toggle('has',!!v);});
function render(){if(view.screen==='test')renderTest();else renderHome();}
render();
if('serviceWorker' in navigator&&location.protocol!=='file:')addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
