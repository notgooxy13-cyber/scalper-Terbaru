const API="https://api.gold-api.com/price/XAU";
const $=id=>document.getElementById(id);
let samples=[], timeframe=1, lastPrice=null, firstPrice=null, busy=false;
const MAX_SAMPLES=12000, STORE_KEY="gold_scalper_v2_samples";
try{const saved=JSON.parse(localStorage.getItem(STORE_KEY)||"[]");if(Array.isArray(saved))samples=saved.filter(x=>Number.isFinite(x.t)&&Number.isFinite(x.p)).slice(-MAX_SAMPLES)}catch{}
function fmt(n,d=2){return Number.isFinite(n)?n.toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d}):"—"}
function setStatus(kind,msg){$("connection").className="pill "+kind;$("connection").textContent=msg;$("status-text").textContent=msg}
async function refresh(){
 if(busy)return;busy=true;
 try{
  const r=await fetch(API,{cache:"no-store"});if(!r.ok)throw new Error("HTTP "+r.status);
  const j=await r.json();
  const p=Number(j.price??j.ask??j.value);
  if(!Number.isFinite(p)||p<=0)throw new Error("Format harga tidak dikenali");
  const now=Date.now();lastPrice=p;if(firstPrice===null)firstPrice=p;
  const updated=j.updatedAt||j.updated_at||j.timestamp||new Date().toISOString();
  const stamp=Date.parse(updated)||now;
  const prev=samples[samples.length-1];
  if(!prev||Math.abs(prev.p-p)>0.000001||now-prev.t>=30000)samples.push({t:now,p});
  samples=samples.slice(-MAX_SAMPLES);
  try{localStorage.setItem(STORE_KEY,JSON.stringify(samples))}catch{}
  $("price").textContent="$"+fmt(p);
  $("updated").textContent="Data diperbarui: "+new Date(stamp).toLocaleString("id-ID");
  const diff=p-firstPrice;$("change").textContent=(diff>=0?"+":"")+fmt(diff);
  $("change").style.color=diff>=0?"var(--green)":"var(--red)";
  $("source").textContent="Gold API · spot indikatif";
  setStatus("ok","Terhubung · harga spot diterima");
  render();
 }catch(e){setStatus("bad","Data tidak tersedia: "+e.message+" · coba lagi nanti")}
 finally{busy=false}
}
function candles(mins){
 const ms=mins*60000,map=new Map();
 for(const s of samples){const k=Math.floor(s.t/ms)*ms;let c=map.get(k);if(!c){c={t:k,o:s.p,h:s.p,l:s.p,c:s.p};map.set(k,c)}else{c.h=Math.max(c.h,s.p);c.l=Math.min(c.l,s.p);c.c=s.p}}
 return [...map.values()].sort((a,b)=>a.t-b.t);
}
function ema(vals,n){if(vals.length<n)return null;let k=2/(n+1),v=vals.slice(0,n).reduce((a,b)=>a+b,0)/n;for(let i=n;i<vals.length;i++)v=vals[i]*k+v*(1-k);return v}
function rsi(vals,n=14){if(vals.length<=n)return null;let g=0,l=0;for(let i=vals.length-n;i<vals.length;i++){let d=vals[i]-vals[i-1];if(d>0)g+=d;else l-=d}if(l===0)return 100;return 100-100/(1+g/l)}
function atr(cs,n=14){if(cs.length<=n)return null;let a=[];for(let i=1;i<cs.length;i++)a.push(Math.max(cs[i].h-cs[i].l,Math.abs(cs[i].h-cs[i-1].c),Math.abs(cs[i].l-cs[i-1].c)));return a.slice(-n).reduce((x,y)=>x+y,0)/n}
function render(){
 const cs=candles(timeframe),vals=cs.map(c=>c.c);
 $("candle-count").textContent=cs.length+" candle";
 $("chart-empty").style.display=cs.length>=2?"none":"grid";
 $("ema20").textContent=fmt(ema(vals,20));$("ema50").textContent=fmt(ema(vals,50));$("ema200").textContent=fmt(ema(vals,200));
 const rv=rsi(vals);$("rsi").textContent=rv===null?"Perlu ≥15 candle":fmt(rv,1);
 const av=atr(cs);$("atr").textContent=av===null?"Perlu ≥15 candle":fmt(av,3);
 $("adx").textContent=cs.length<30?"Perlu ≥30 candle":"Tidak dihitung pada versi ini";
 draw(cs.slice(-80));
}
function draw(cs){
 const cv=$("chart"),ctx=cv.getContext("2d"),rect=cv.getBoundingClientRect(),dpr=window.devicePixelRatio||1;
 cv.width=Math.max(1,rect.width*dpr);cv.height=Math.max(1,rect.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
 const w=rect.width,h=rect.height;ctx.clearRect(0,0,w,h);
 ctx.strokeStyle="#26364f";ctx.fillStyle="#8797b1";ctx.font="10px sans-serif";
 if(!cs.length){return}
 let lo=Math.min(...cs.map(c=>c.l)),hi=Math.max(...cs.map(c=>c.h));let pad=(hi-lo)*.12||.5;lo-=pad;hi+=pad;
 const left=8,right=58,top=12,bottom=20,ph=h-top-bottom,pw=w-left-right;
 for(let i=0;i<5;i++){let y=top+i*ph/4;ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(w-right,y);ctx.stroke();ctx.fillText(fmt(hi-i*(hi-lo)/4),w-right+5,y+3)}
 const step=pw/cs.length,bw=Math.max(2,Math.min(10,step*.62));
 cs.forEach((c,i)=>{let x=left+i*step+step/2,yo=top+(hi-c.o)/(hi-lo)*ph,yc=top+(hi-c.c)/(hi-lo)*ph,yh=top+(hi-c.h)/(hi-lo)*ph,yl=top+(hi-c.l)/(hi-lo)*ph;let color=c.c>=c.o?"#28c78a":"#ff667a";ctx.strokeStyle=color;ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x,yh);ctx.lineTo(x,yl);ctx.stroke();ctx.fillRect(x-bw/2,Math.min(yo,yc),bw,Math.max(1,Math.abs(yc-yo)))});
}
document.querySelectorAll("[data-tf]").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("[data-tf]").forEach(x=>x.classList.remove("active"));b.classList.add("active");timeframe=Number(b.dataset.tf);render()}));
$("refresh").addEventListener("click",refresh);
window.addEventListener("resize",render);
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
render();refresh();setInterval(refresh,30000);
