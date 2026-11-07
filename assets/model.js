/* Scoring, language age and the research record. No page code here, so it is fully testable. */
(function(root,factory){if(typeof module!=='undefined')module.exports=factory(require('./data.js'));else root.ACEC=factory(root.ACEC_DATA);})(this,function(DATA){
'use strict';
// Confirm these against the test manual: they decide where counting starts and stops.
const BASAL_RUN=3,CEILING_RUN=7;
const TESTS={ac:{name:'الفهم السمعي',short:'AC'},ec:{name:'التعبير التواصلي',short:'EC'}};
// "n" stays fixed so saved answers keep their meaning; "pos" is the number shown to the clinician.
const flat=test=>DATA[test].flatMap((band,b)=>band.items.map(item=>({...item,band:b}))).map((item,i)=>({...item,pos:i+1}));
const ITEMS={ac:flat('ac'),ec:flat('ec')};
const digits=v=>String(v??'').replace(/[٠-٩]/g,c=>c.charCodeAt(0)-1632).replace(/[۰-۹]/g,c=>c.charCodeAt(0)-1776);
function parseDate(text){const m=digits(text).match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);if(!m)return null;const d=new Date(+m[1],+m[2]-1,+m[3]);return d.getFullYear()===+m[1]&&d.getMonth()===+m[2]-1&&d.getDate()===+m[3]?d:null;}
function ageMonths(dob,on){const a=parseDate(dob),b=parseDate(on);if(!a||!b||a>b)return null;let m=(b.getFullYear()-a.getFullYear())*12+b.getMonth()-a.getMonth();if(b.getDate()<a.getDate())m--;return m;}
const ymLabel=m=>`${Math.floor(m/12)}:${m%12}`;
const bandLabel=band=>`${ymLabel(band.lo)}–${ymLabel(band.hi)}`;
function arabicAge(m){if(m===null||m===undefined)return '';const y=Math.floor(m/12),r=m%12,ys=y===0?'':y===1?'سنة':y===2?'سنتان':y<=10?`${y} سنوات`:`${y} سنة`,ms=r===0?'':r===1?'شهر':r===2?'شهران':r<=10?`${r} أشهر`:`${r} شهراً`;return [ys,ms].filter(Boolean).join(' و')||'أقل من شهر';}
function startBand(test,age){const bands=DATA[test];if(age===null||age===undefined)return 0;const i=bands.findIndex(b=>age>=b.lo&&age<=b.hi);return i<0?(age<bands[0].lo?0:bands.length-1):i;}
function analyze(test,answers={}){
 const items=ITEMS[test],at=i=>answers[items[i].n],answered=items.filter(i=>answers[i.n]).length;
 // The child is credited for everything below the first run of passes.
 let basal=-1;for(let i=0;i+BASAL_RUN<=items.length;i++){if(Array.from({length:BASAL_RUN},(_,k)=>at(i+k)).every(v=>v==='pass')){basal=i;break;}}
 // Testing from the very first item needs no run: there is nothing below it to credit.
 const floor=basal<0&&at(0)!==undefined;const from=basal>=0?basal:0;
 let ceiling=-1;for(let i=from;i+CEILING_RUN<=items.length;i++){if(Array.from({length:CEILING_RUN},(_,k)=>at(i+k)).every(v=>v==='fail')){ceiling=i;break;}}
 const end=ceiling>=0?ceiling:items.length;let raw=from;for(let i=from;i<end;i++)if(at(i)==='pass')raw++;
 const reachedTop=at(items.length-1)!==undefined,complete=(basal>=0||floor)&&(ceiling>=0||reachedTop);
 const band=raw>0?DATA[test][items[raw-1].band]:null;
 return {test,raw,max:items.length,answered,credited:from,complete,started:answered>0,band,bandLabel:band?bandLabel(band):'',langAge:band?{lo:band.lo,hi:band.hi,mid:Math.round((band.lo+band.hi)/2)}:null};
}
function compare(age,result){if(age===null||age===undefined||!result.langAge)return null;const {lo,hi}=result.langAge;if(age<lo)return {kind:'above',months:lo-age};if(age>hi)return {kind:'below',months:age-hi};return {kind:'within',months:0};}
function compareText(c){if(!c)return '';if(c.kind==='within')return 'مناسب لعمره';return c.kind==='below'?`أقل من عمره بـ ${arabicAge(c.months)}`:`أعلى من عمره بـ ${arabicAge(c.months)}`;}
function skillsFor(test,answers,limit=5){const items=ITEMS[test],r=analyze(test,answers);const can=items.filter((it,i)=>answers[it.n]==='pass'||(i<r.credited&&answers[it.n]!=='fail')).slice(-limit).map(i=>i.text);const next=items.filter((it,i)=>i>=r.credited&&answers[it.n]!=='pass').slice(0,limit).map(i=>i.text);return {can,next};}
const ageGroup=m=>m===null||m===undefined?null:Math.floor(m/6);
const groupLabel=g=>`${ymLabel(g*6)}–${ymLabel(g*6+5)}`;
const GROUPS=16;
// Never includes names, birth date, parent, notes or free text. Visits are recorded by month only.
function researchRecord(child,assessment){
 const age=ageMonths(child.dob,assessment.date),out={assessmentId:assessment.id,childCode:child.code,visitMonth:String(assessment.date).slice(0,7),ageMonths:age,sex:child.research?.sex||'',dialect:child.research?.dialect||'',otherLanguages:child.research?.otherLanguages||'',preterm:child.research?.preterm||'',hearing:child.research?.hearing||'',diagnosis:child.research?.diagnosis||'',tests:{}};
 for(const test of ['ac','ec']){const answers=assessment.answers?.[test]||{},r=analyze(test,answers);out.tests[test]={raw:r.started?r.raw:null,complete:r.complete,langAgeMonths:r.langAge?r.langAge.mid:null,items:ITEMS[test].filter(i=>answers[i.n]).map(i=>({n:i.n,score:answers[i.n]}))};}
 return out;
}
const eligibleForNorms=record=>record.preterm==='no'&&record.hearing==='normal'&&record.diagnosis==='none'&&record.ageMonths!==null&&record.ageMonths<GROUPS*6;
return {DATA,TESTS,ITEMS,BASAL_RUN,CEILING_RUN,GROUPS,digits,parseDate,ageMonths,ymLabel,bandLabel,arabicAge,startBand,analyze,compare,compareText,skillsFor,ageGroup,groupLabel,researchRecord,eligibleForNorms};
});
