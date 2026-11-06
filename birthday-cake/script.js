/* A Little Wish — original generative ASCII cake animation. */
(() => {
  "use strict";
  const canvas = document.getElementById("asciiCanvas");
  const ctx = canvas && canvas.getContext("2d", {alpha:true});
  const status = document.getElementById("statusMessage");
  const overlay = document.getElementById("wishOverlay");
  const overlayText = document.getElementById("overlayText");
  const nameForm = document.getElementById("nameForm");
  const input = document.getElementById("nameInput");
  const display = document.getElementById("displayName");
  const wishBtn = document.getElementById("wishButton");
  const blowBtn = document.getElementById("blowButton");
  const replayBtn = document.getElementById("replayButton");
  const shareBtn = document.getElementById("shareButton");
  if (!ctx) { status.textContent = "Canvas is not supported on this browser."; return; }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const C = {
    cream:"#ffe8d0", rose:"#ffc1d2", petal:"#f48dad", coral:"#e48a9d",
    frosting:"#f7dce7", violet:"#cca9e5", gold:"#ffe8a7", shadow:"#a26a8d"
  };
  const glyphs = [".",":","*","+","o","#","x"];
  const candles = [{x:-.64,y:1.48,z:.28},{x:0,y:1.48,z:.39},{x:.64,y:1.48,z:.28}];
  let W=0,H=0,dpr=1,unit=1,points=[],stars=[],particles=[],yawPointer=0;
  let lit=true,lastFrame=0,start=performance.now(),overlayTimer=null;
  function seeded(seed){return function(){let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
  const rand=seeded(22062026);
  const bet=(lo,hi)=>lo+rand()*(hi-lo);
  const pick=(a)=>a[Math.floor(rand()*a.length)];
  function dot(x,y,z,color,char,alpha=1){
    points.push({x,y,z,color,char:char||pick(glyphs),alpha});
  }
  function cylinder(r,lo,hi,n,palette){
    for(let i=0;i<n;i++){
      let a=bet(0,Math.PI*2),radius=r+bet(-.035,.035);
      dot(Math.cos(a)*radius,bet(lo,hi),Math.sin(a)*radius*.69,pick(palette),null,bet(.62,1));
    }
  }
  function ring(r,y,n,palette){
    for(let i=0;i<n;i++){
      let a=(i/n)*Math.PI*2,v=bet(-.035,.035);
      dot(Math.cos(a)*(r+v),y+bet(-.032,.032),Math.sin(a)*(r+v)*.69,
        pick(palette),pick(["+",".","*","o"]));
    }
  }
  function lid(r,y,n,palette){
    for(let i=0;i<n;i++){
      let a=bet(0,Math.PI*2),rr=Math.sqrt(rand())*r;
      dot(Math.cos(a)*rr,y+bet(-.023,.023),Math.sin(a)*rr*.69,
        pick(palette),pick([".","+","o"]));
    }
  }
  function makeCake(){
    points=[];
    const scale=W<490?.64:1;
    const n=(x)=>Math.floor(x*scale);
    cylinder(1.46,-1.11,-.28,n(470),[C.petal,C.coral,C.rose,C.shadow]);
    ring(1.48,-1.10,n(220),[C.petal,C.cream]);
    ring(1.47,-.27,n(230),[C.cream,C.frosting,C.rose]);
    lid(1.43,-.26,n(180),[C.cream,C.rose,C.frosting]);
    cylinder(1.04,-.26,.55,n(365),[C.rose,C.petal,C.cream,C.violet]);
    ring(1.06,-.25,n(150),[C.cream,C.frosting]);
    ring(1.04,.55,n(220),[C.frosting,C.cream,C.rose]);
    lid(1.01,.57,n(170),[C.cream,C.frosting,C.rose]);
    for(let i=0;i<n(120);i++){
      const a=bet(0,Math.PI*2),drip=.06+.15*Math.sin(a*8)**2;
      dot(Math.cos(a)*1.065,.54-bet(0,drip),Math.sin(a)*1.065*.69,
        pick([C.cream,C.frosting]),pick(["*","+","o"]));
    }
    for(let i=0;i<n(185);i++){
      let a=bet(0,Math.PI*2),r=rand()>.52?1.46:1.04;
      dot(Math.cos(a)*(r+.024),r>1.2?bet(-.99,-.38):bet(-.17,.43),
        Math.sin(a)*(r+.024)*.69,pick([C.gold,C.violet,C.frosting]),pick(["*","+","." ,":"]));
    }
    for(const candle of candles){
      for(let i=0;i<n(70);i++){
        let a=bet(0,Math.PI*2);
        dot(candle.x+Math.cos(a)*.062,bet(.61,1.34),candle.z+Math.sin(a)*.042,
          pick([C.cream,C.frosting,C.rose,C.violet]),pick(["|",":","+"]));
      }
      dot(candle.x,1.34,candle.z,C.cream,"|");
    }
  }
  function resize(){
    const rect=canvas.getBoundingClientRect();
    W=Math.max(1,rect.width);H=Math.max(1,rect.height);
    dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    unit=Math.min(W/4.25,H/4.15);
    stars=Array.from({length:W<490?55:115},()=>({
      x:bet(0,W),y:bet(35,H-35),size:bet(.3,1.7),
      phase:bet(0,Math.PI*2),speed:bet(.0003,.0011)
    }));
    makeCake();
  }
  function project(x,y,z,yaw){
    let cs=Math.cos(yaw),sn=Math.sin(yaw),xr=x*cs+z*sn,zr=z*cs-x*sn;
    const ds=1+zr*.048;
    return {x:W*.5+xr*unit*ds,y:H*.535-y*unit*ds+zr*unit*.29,z:zr};
  }
  function drawStars(t){
    ctx.textAlign="center";ctx.textBaseline="middle";ctx.font="11px monospace";
    for(const s of stars){
      const bright=reduceMotion.matches?.5:.29+.26*Math.sin(t*s.speed+s.phase);
      ctx.globalAlpha=Math.max(.13,bright);
      ctx.fillStyle=s.size>1.2?"#efc7d3":"#ad90ac";
      ctx.fillText(s.size>1.4?"+":"·",s.x,s.y);
    }
    ctx.globalAlpha=1;
  }
  function drawFloor(){
    const x=W*.5,y=H*.535+unit*1.3;
    const grad=ctx.createRadialGradient(x,y,unit*.15,x,y,unit*2.4);
    grad.addColorStop(0,"rgba(250,131,187,.12)");
    grad.addColorStop(1,"rgba(164,76,132,0)");
    ctx.fillStyle=grad;
    ctx.beginPath();ctx.ellipse(x,y,unit*2.6,unit*1.15,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="rgba(247,181,201,.085)";
    for(let i=0;i<3;i++){
      ctx.beginPath();
      ctx.ellipse(x,y,unit*(1.3+i*.36),unit*(.18+i*.09),0,0,Math.PI*2);
      ctx.stroke();
    }
  }
  function drawCake(t,yaw){
    const arranged=points.map(q=>({q,p:project(q.x,q.y,q.z,yaw)}));
    arranged.sort((a,b)=>a.p.z-b.p.z);
    const size=Math.max(8,Math.min(13.5,unit*.09));
    ctx.font=size+'px "DM Mono",monospace';
    ctx.textAlign="center";ctx.textBaseline="middle";
    for(const v of arranged){
      ctx.globalAlpha=v.q.alpha*(v.p.z>0?1:.72);
      ctx.fillStyle=v.q.color;
      ctx.fillText(v.q.char,v.p.x,v.p.y);
    }
    ctx.globalAlpha=1;
    for(const candle of candles){
      const p=project(candle.x,candle.y,candle.z,yaw);
      if(lit){
        const flicker=reduceMotion.matches?1:.91+Math.sin(t*.011+candle.x*8)*.09;
        ctx.save();ctx.globalAlpha=.85;ctx.shadowColor="#ffb772";ctx.shadowBlur=22*flicker;
        ctx.fillStyle=C.gold;ctx.font=(size*1.8*flicker)+'px monospace';
        ctx.fillText("*",p.x,p.y);
        ctx.font=(size*.93)+'px monospace';ctx.fillStyle="#fff5d0";
        ctx.fillText("+",p.x,p.y-unit*.095);ctx.restore();
      }else{
        ctx.globalAlpha=.28;ctx.fillStyle="#a48da2";ctx.font=size+"px monospace";
        ctx.fillText("~",p.x+Math.sin(t*.002+candle.x)*5,p.y-7);
      }
    }
    ctx.globalAlpha=1;
  }
  function sprinkle(count=110,x=W*.5,y=H*.35){
    const colors=[C.rose,C.cream,C.gold,C.violet,C.petal];
    for(let i=0;i<(reduceMotion.matches?Math.min(24,count):count);i++){
      const a=bet(0,Math.PI*2),s=bet(1.1,5.3)*Math.min(1.15,W/550+.2);
      particles.push({x:x+bet(-8,8),y:y+bet(-8,8),
        vx:Math.cos(a)*s,vy:Math.sin(a)*s-bet(.4,2),
        life:bet(75,155),angle:bet(0,Math.PI*2),spin:bet(-.14,.14),
        color:pick(colors),char:pick(["+","*","✦","·"])});
    }
    if(particles.length>490)particles.splice(0,particles.length-490);
  }
  function drawParticles(){
    ctx.textAlign="center";ctx.textBaseline="middle";ctx.font="13px monospace";
    for(let i=particles.length-1;i>=0;i--){
      let p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.055;p.vx*=.997;p.angle+=p.spin;p.life--;
      if(p.life<=0||p.y>H+40){particles.splice(i,1);continue;}
      ctx.save();ctx.globalAlpha=Math.min(.97,p.life/40);
      ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.fillStyle=p.color;ctx.fillText(p.char,0,0);ctx.restore();
    }
    ctx.globalAlpha=1;
  }
  function frame(now){
    requestAnimationFrame(frame);
    if(document.hidden || now-lastFrame<(W<600?32:25))return;
    lastFrame=now;
    ctx.clearRect(0,0,W,H);
    let t=reduceMotion.matches?0:now-start;
    let yaw=(reduceMotion.matches?.16:Math.sin(t*.00034)*.22)+yawPointer*.38+.16;
    drawStars(t);drawFloor();drawCake(t,yaw);drawParticles();
  }
  const clean=(text)=>String(text||"").replace(/\s+/g," ").trim().slice(0,28);
  function personalize(text){
    const name=clean(text);display.textContent=name||"you";input.value=name;
    status.textContent=name?"A beautiful little wish for "+name+".":"The candles are waiting for your wish.";
  }
  function showText(text,duration=2200){
    clearTimeout(overlayTimer);overlayText.textContent=text;overlay.classList.add("active");
    overlayTimer=setTimeout(()=>overlay.classList.remove("active"),duration);
  }
  nameForm.addEventListener("submit",(e)=>{
    e.preventDefault();personalize(input.value);sprinkle(45,W*.5,H*.53);input.blur();
  });
  wishBtn.addEventListener("click",()=>{
    showText("make a wish",2500);sprinkle(140);
    status.textContent="Close your eyes. Some lovely things are on their way ✦";
  });
  blowBtn.addEventListener("click",()=>{
    if(!lit)return;
    lit=false;blowBtn.disabled=true;showText("wish granted ✦");
    sprinkle(170,W*.5,H*.36);status.textContent="The candles are out. May your wish come true ✦";
  });
  replayBtn.addEventListener("click",()=>{
    lit=true;blowBtn.disabled=false;particles=[];start=performance.now();
    clearTimeout(overlayTimer);overlay.classList.remove("active");
    status.textContent="Everything is glowing again. One more wish?";
  });
  shareBtn.addEventListener("click",async()=>{
    const url=new URL(window.location.href),name=clean(input.value);
    url.searchParams.delete("to");if(name)url.searchParams.set("to",name);url.hash="";
    try{
      if(navigator.share){
        await navigator.share({title:"A Little Wish ✦ Happy Birthday",
          text:"A little birthday surprise for you ✨",url:url.toString()});
        status.textContent="Your little wish is ready to be shared ✦";
      }else if(navigator.clipboard?.writeText){
        await navigator.clipboard.writeText(url.toString());
        status.textContent="Shareable link copied. Send it to someone special ✦";
      }else{
        window.prompt("Copy your birthday link:",url.toString());
        status.textContent="Here is your personalized birthday link ✦";
      }
    }catch(e){if(e?.name!=="AbortError")window.prompt("Copy your birthday link:",url.toString());}
  });
  canvas.addEventListener("pointermove",(e)=>{
    if(e.pointerType==="mouse"||e.buttons){
      const r=canvas.getBoundingClientRect();
      yawPointer=Math.max(-1,Math.min(1,(e.clientX-r.left-r.width/2)/(r.width/2)));
    }
  });
  canvas.addEventListener("pointerleave",()=>{yawPointer=0;});
  canvas.addEventListener("pointerdown",(e)=>{
    const r=canvas.getBoundingClientRect();
    sprinkle(32,e.clientX-r.left,e.clientY-r.top);
  });
  const initial=new URLSearchParams(window.location.search).get("to");
  if(initial)personalize(initial);
  resize();
  if(typeof ResizeObserver!=="undefined")new ResizeObserver(resize).observe(canvas);
  else window.addEventListener("resize",resize,{passive:true});
  requestAnimationFrame(frame);
})();