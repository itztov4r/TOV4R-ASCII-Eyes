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

  const welcomeScreen = document.getElementById("welcomeScreen");
  const welcomeForm = document.getElementById("welcomeForm");
  const welcomeName = document.getElementById("welcomeName");
  let experienceStarted = false;
  function beginExperience(name) {
    if (experienceStarted) return;
    const cleaned = String(name || "").replace(/\\s+/g, " ").trim().slice(0, 28);
    if (!cleaned) { welcomeName.focus(); return; }
    experienceStarted = true;
    start=performance.now();
    lit=true;blowBtn.disabled=false;particles=[];
    personalize(cleaned);
    document.body.classList.remove("awaiting-name");
    document.body.classList.add("birthday-revealed");
    welcomeScreen.classList.add("is-gone");
    welcomeScreen.setAttribute("aria-hidden", "true");
    window.scrollTo({top: 0, behavior: "instant"});
    setTimeout(() => { welcomeScreen.hidden = true; document.getElementById("birthdayStage").scrollIntoView({behavior: reduceMotion.matches ? "instant" : "smooth", block: "center"}); sprinkle(130, W*.5, H*.44); }, 850);
  }
  welcomeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    beginExperience(welcomeName.value);
  });
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
    const n=W<490?.7:1;
    // Single triangular cake slice, inspired by the uploaded ASCII art reference.
    // Front apex faces the viewer; the back is a wide frosted edge.
    for(let i=0;i<Math.floor(1700*n);i++){
      const depth=rand(), width=(1-depth)*1.27+.055;
      const x=bet(-width,width), z=depth*1.65-.75;
      const y=bet(-1.25,-.28);
      const creamLayer=Math.abs(y+.67)<.105 || Math.abs(y+1.08)<.065;
      const edge=Math.abs(x)>width-.07;
      const color=creamLayer?pick([C.cream,C.gold,C.frosting]):edge?pick([C.rose,C.petal,C.coral]):pick([C.shadow,C.coral,C.rose,C.cream]);
      dot(x,y,z,color,pick([":",".","+","*","o"]),bet(.66,1));
    }
    for(let i=0;i<Math.floor(800*n);i++){
      const depth=rand(),width=(1-depth)*1.27+.05;
      const x=bet(-width,width),z=depth*1.65-.75;
      const y=-.25+bet(-.065,.065);
      dot(x,y,z,pick([C.frosting,C.cream,C.rose,C.violet]),pick(["+","o","*","."]));
    }
    for(let i=0;i<Math.floor(180*n);i++){
      const depth=rand(),width=(1-depth)*1.27+.05;
      const x=rand()>.5?width:-width;
      dot(x,-.29-bet(0,.18),depth*1.65-.75,pick([C.frosting,C.rose,C.cream]),"*");
    }
    // One candle in the center of the slice.
    for(let i=0;i<Math.floor(150*n);i++){
      const a=bet(0,Math.PI*2);
      dot(Math.cos(a)*.055,bet(-.16,.72),.04+Math.sin(a)*.045,pick([C.rose,C.coral,C.gold]),"|");
    }
    dot(0,.76,.04,C.cream,"|");
  }
  function resize(){
    const rect=canvas.getBoundingClientRect();
    W=Math.max(1,rect.width);H=Math.max(1,rect.height);
    dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    unit=Math.min(W/4.15,H/3.7);
    stars=Array.from({length:W<490?55:115},()=>({
      x:bet(0,W),y:bet(35,H-35),size:bet(.3,1.7),
      phase:bet(0,Math.PI*2),speed:bet(.0003,.0011)
    }));
    makeCake();
  }
  function project(x,y,z,yaw){
    let cs=Math.cos(yaw),sn=Math.sin(yaw),xr=x*cs+z*sn,zr=z*cs-x*sn;
    const ds=1+zr*.048;
    return {x:W*.5+xr*unit*ds,y:H*.50-y*unit*ds+zr*unit*.19,z:zr};
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
    const x=W*.5,y=H*.50+unit*1.3;
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
    const reveal=reduceMotion.matches?1:Math.min(1,Math.max(0,(t-400)/2400));
    const arranged=points.map(q=>({q,p:project(q.x,q.y,q.z,yaw)}));
    arranged.sort((a,b)=>a.p.z-b.p.z);
    const size=Math.max(8,Math.min(13,unit*.09));
    ctx.font=size+'px "DM Mono",monospace';ctx.textAlign="center";ctx.textBaseline="middle";
    for(const v of arranged){ctx.globalAlpha=v.q.alpha*reveal;ctx.fillStyle=v.q.color;ctx.fillText(v.q.char,v.p.x,v.p.y)}
    ctx.globalAlpha=1;
    const p=project(0,.89,.04,yaw);
    if(lit && reveal>.7){
      const f=reduceMotion.matches?1:1+Math.sin(t*.016)*.11;
      ctx.save();ctx.shadowColor="#ffb65c";ctx.shadowBlur=24;
      ctx.fillStyle="#ffe1a0";ctx.font=(size*2.1*f)+"px monospace";ctx.fillText("✦",p.x,p.y);
      ctx.fillStyle="#fff8df";ctx.font=(size*.9)+"px monospace";ctx.fillText("+",p.x,p.y-12);ctx.restore();
    }else{ctx.fillStyle="#a48da2";ctx.fillText("~",p.x,p.y)}
    // Birthday text appears inside the animation, like the reference reel.
    const heading="HAPPY";const second="BIRTHDAY";
    const alpha=reduceMotion.matches?1:Math.min(1,Math.max(0,(t-2200)/1800));
    ctx.save();ctx.globalAlpha=alpha;ctx.textAlign="center";
    const font=Math.min(40,Math.max(18,W*.067));ctx.font="bold "+font+"px monospace";
    ctx.shadowBlur=13;ctx.shadowColor="#c18b77";ctx.fillStyle="#f5d7b2";
    ctx.fillText(heading,W*.5,H*.19);
    ctx.shadowColor="#e6a1cf";ctx.fillStyle="#f2b4d8";
    ctx.fillText(second,W*.5,H*.19+font*1.08);
    ctx.restore();
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
    let yaw=(reduceMotion.matches?0:Math.sin(t*.00024)*.10)+yawPointer*.18;
    if(experienceStarted){drawStars(t);drawFloor();drawCake(t,yaw);drawParticles();}
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
  if(initial){ welcomeName.value=clean(initial); personalize(initial); }
  resize();
  if(typeof ResizeObserver!=="undefined")new ResizeObserver(resize).observe(canvas);
  else window.addEventListener("resize",resize,{passive:true});
  requestAnimationFrame(frame);
})();