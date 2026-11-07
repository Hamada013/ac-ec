/* Report charts as plain SVG: they print sharply and need no library. Ages run right to left, like the report. */
(function(root){
'use strict';
const COLORS={age:'#8796a3',ac:'#3f7ea6',ec:'#3c9478'};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function ageBars(rows){
 const W=640,left=20,right=150,rowH=46,top=8,h=top+rows.length*rowH+30,maxYears=Math.max(2,Math.min(8,Math.ceil(Math.max(...rows.map(r=>r.value||0))/12)+1)),scale=(W-left-right)/(maxYears*12),x=m=>W-right-m*scale;
 let s=`<svg viewBox="0 0 ${W} ${h}" role="img" aria-label="${esc(rows.map(r=>`${r.label}: ${r.text}`).join('، '))}">`;
 for(let y=0;y<=maxYears;y++){const px=x(y*12);s+=`<line x1="${px}" x2="${px}" y1="${top}" y2="${h-26}" stroke="#e6edf2"/><text x="${px}" y="${h-8}" font-size="13" fill="#5d6b78" text-anchor="middle">${y}</text>`;}
 rows.forEach((r,i)=>{const cy=top+i*rowH;s+=`<text x="${W-4}" y="${cy+25}" font-size="15" font-weight="600" fill="#22313d" text-anchor="start" direction="rtl">${esc(r.label)}</text>`;
  if(r.value===null||r.value===undefined)s+=`<text x="${W-right-8}" y="${cy+25}" font-size="13" fill="#5d6b78" text-anchor="start" direction="rtl">لم يُفحص</text>`;
  else{const w=Math.max(4,r.value*scale);s+=`<rect x="${W-right-w}" y="${cy+6}" width="${w}" height="26" rx="7" fill="${r.color}"/>`;}});
 return s+`</svg><p class="chart-axis">العمر بالسنوات</p>`;
}
function progress(visits){
 const W=640,H=260,l=46,r=46,t=14,b=38,all=visits.flatMap(v=>[v.age,v.ac,v.ec]).filter(v=>v!==null&&v!==undefined),maxM=Math.max(12,Math.ceil(Math.max(...all)/12)*12),x=i=>W-r-(visits.length===1?0:i*(W-l-r)/(visits.length-1)),y=m=>H-b-m*(H-t-b)/maxM;
 let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="تقدم الطفل عبر الزيارات">`;
 for(let m=0;m<=maxM;m+=12){s+=`<line x1="${l}" x2="${W-r}" y1="${y(m)}" y2="${y(m)}" stroke="#e6edf2"/><text x="${l-8}" y="${y(m)+4}" font-size="13" fill="#5d6b78" text-anchor="end">${m/12}</text>`;}
 visits.forEach((v,i)=>{s+=`<text x="${x(i)}" y="${H-14}" font-size="12" fill="#5d6b78" text-anchor="middle">${esc(v.label)}</text>`;});
 for(const key of ['age','ac','ec']){const pts=visits.map((v,i)=>v[key]===null||v[key]===undefined?null:[x(i),y(v[key])]).filter(Boolean);if(!pts.length)continue;s+=`<polyline fill="none" stroke="${COLORS[key]}" stroke-width="3" ${key==='age'?'stroke-dasharray="6 6"':''} points="${pts.map(p=>p.join(',')).join(' ')}"/>`;for(const p of pts)s+=`<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="${COLORS[key]}"/>`;}
 return s+`</svg><p class="chart-legend"><span style="--c:${COLORS.age}">عمر الطفل</span><span style="--c:${COLORS.ac}">الفهم السمعي</span><span style="--c:${COLORS.ec}">التعبير التواصلي</span></p>`;
}
root.ACEC_CHARTS={COLORS,ageBars,progress};
})(this);
