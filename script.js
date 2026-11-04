'use strict';
const canvas=document.querySelector('#art'),ctx=canvas.getContext('2d');
const source=document.createElement('canvas');source.width=1000;source.height=430;
const brush=source.getContext('2d',{willReadFrequently:true});
const screen=document.querySelector('#screen');
let width=0,height=0,dpr=1,color='#eac6a9',paused=false,elapsed=0,previous=0,lastPaint=0,forcedBlink=-10,pointerUntil=0,pointerX=0,pointerY=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
new ResizeObserver(resize).observe(screen);
function stroke(path,alpha,lineWidth){brush.strokeStyle=`rgba(255,255,255,${alpha})`;brush.lineWidth=lineWidth;brush.stroke(path);}
function eye(cx,mirror,openness,gx,gy){
 brush.save();brush.translate(cx,206);brush.scale(mirror,1);
 const e=new Path2D();e.moveTo(-149,9);e.bezierCurveTo(-83,-69*openness,44,-76*openness,143,-9);e.bezierCurveTo(84,52*openness,-51,63*openness,-149,9);
 brush.save();brush.clip(e);brush.fillStyle='#777777';brush.fillRect(-155,-90,310,175);
 const irisX=gx*mirror,irisY=gy;
 const grad=brush.createRadialGradient(irisX,irisY,8,irisX,irisY,58);grad.addColorStop(0,'#242424');grad.addColorStop(.28,'#bbbbbb');grad.addColorStop(.65,'#a1a1a1');grad.addColorStop(.87,'#747474');grad.addColorStop(1,'#1b1b1b');brush.fillStyle=grad;brush.beginPath();brush.arc(irisX,irisY,58,0,Math.PI*2);brush.fill();
 for(let i=0;i<95;i++){let a=i*2.39996;const p=new Path2D();p.moveTo(irisX+Math.cos(a)*25,irisY+Math.sin(a)*25);p.lineTo(irisX+Math.cos(a+.035)*(48+i%8),irisY+Math.sin(a+.035)*(48+i%8));stroke(p,.15+(i%5)*.07,1.4);}
 brush.fillStyle='#070707';brush.beginPath();brush.ellipse(irisX,irisY,22,29,0,0,7);brush.fill();brush.fillStyle='#f5f5f5';brush.beginPath();brush.ellipse(irisX-17,irisY-20,11,6,-.3,0,7);brush.fill();brush.fillStyle='#aaaaaa';brush.beginPath();brush.arc(irisX+19,irisY+18,4,0,7);brush.fill();brush.restore();stroke(e,.85,3);
 const upper=new Path2D();upper.moveTo(-145,0);upper.bezierCurveTo(-68,-92*openness,55,-96*openness,149,-17);stroke(upper,.26,2);
 const lower=new Path2D();lower.moveTo(-124,29);lower.bezierCurveTo(-30,83*openness,91,60*openness,144,2);stroke(lower,.17,2);
 for(let i=0;i<25;i++){let u=i/24;let x=-137+u*278;let y=-Math.sin(u*Math.PI)*57*openness+6-u*15;let p=new Path2D();p.moveTo(x,y);p.quadraticCurveTo(x+12+(u-.5)*18,y-11*openness,x+22+(u-.5)*32,y-(18+Math.sin(u*Math.PI)*15)*openness);stroke(p,.45+u*.4,1.7);}
 for(let i=0;i<18;i++){let u=i/17,x=-110+u*234,y=Math.sin(u*Math.PI)*37*openness+14-u*12;let p=new Path2D();p.moveTo(x,y);p.lineTo(x+(u-.3)*10,y+8*openness);stroke(p,.25,1);}
 for(let i=0;i<90;i++){let u=i/89,x=-134+u*280,y=-96-30*Math.sin(u*Math.PI)+u*21;const p=new Path2D();p.moveTo(x,y);p.quadraticCurveTo(x+8,y-12,x+15,y-13);stroke(p,Math.sin(u*Math.PI)*.44,2.3);}
 brush.restore();
}
function draw(t){
 brush.clearRect(0,0,1000,430);brush.fillStyle='#000';brush.fillRect(0,0,1000,430);
 let cycle=t%5.7,blink=cycle<.21?Math.pow(Math.sin(cycle/.21*Math.PI),2):0;
 const forced=t-forcedBlink;if(forced>=0&&forced<.32)blink=Math.max(blink,Math.sin(forced/.32*Math.PI));
 let open=1-.95*blink;
 let interactive=performance.now()<pointerUntil;
 let gx=interactive?pointerX*24:Math.sin(t*.48)*15,gy=interactive?pointerY*13:Math.sin(t*.37)*5;
 eye(278,1,open,gx,gy);eye(722,-1,open,gx,gy);
 // Hints of a nose bridge and cheek planes keep the portrait out of flat icon territory.
 for(const m of [-1,1]){const p=new Path2D();p.moveTo(500+m*40,157);p.bezierCurveTo(500+m*24,218,500+m*39,270,500+m*66,292);stroke(p,.07,3);const q=new Path2D();q.moveTo(500+m*113,318);q.quadraticCurveTo(500+m*210,346,500+m*328,290);stroke(q,.045,5);}
 const data=brush.getImageData(0,0,1000,430).data;
 ctx.fillStyle='#030405';ctx.fillRect(0,0,width,height);
 const columns=width<600?124:184,cell=width/columns,line=cell*1.65,rows=Math.ceil(height/line);
 ctx.font=`${cell*1.08}px monospace`;ctx.textBaseline='top';
 const cycleZoom=(Math.sin(t*.23-1.57)+1)/2;const zoom=reduced?1:1+Math.pow(cycleZoom,3)*1.7;
 const target=278;const panX=500+(target-500)*(zoom-1)/1.7;
 const chars=' .,:;irsx*oO0Q@';
 for(let y=0;y<rows;y++){for(let x=0;x<columns;x++){
 const sx=Math.round((x/columns-.5)*1050/zoom+panX),sy=Math.round((y/rows-.5)*Math.max(440,1050*height/width)/zoom+210);
 if(sx<0||sx>=1000||sy<0||sy>=430)continue;
 let lum=data[(sy*1000+sx)*4]/255;let noise=(Math.sin(x*127.1+y*311.7)*43758.5453)%1;
 if(lum>.025){const shimmer=.88+.12*Math.sin(t*1.3+x*.5+y*.7);ctx.globalAlpha=Math.min(1,.46+lum*.9)*shimmer;ctx.fillStyle=color;ctx.fillText(chars[Math.min(chars.length-1,Math.floor(lum*(chars.length-1)))],x*cell,y*line);}
 else if(noise>.992){ctx.globalAlpha=.14;ctx.fillStyle=color;ctx.fillText('+',x*cell,y*line);}
 }}ctx.globalAlpha=1;
 document.querySelector('#counter').textContent=`${String(Math.floor(t/60)).padStart(2,'0')}:${String(Math.floor(t%60)).padStart(2,'0')}`;
 document.querySelector('#mode').textContent=paused?'RENDER PAUSED':interactive?'FOLLOWING YOUR GAZE':zoom>1.7?'CINEMATIC CLOSE-UP':'AUTONOMOUS GAZE';
}
function frame(now){if(!previous)previous=now;const delta=Math.min((now-previous)/1000,.1);previous=now;if(!paused)elapsed+=delta;if(now-lastPaint>50){draw(elapsed);lastPaint=now;}requestAnimationFrame(frame);}resize();draw(0);requestAnimationFrame(frame);
function togglePause(){paused=!paused;const b=document.querySelector('#pause');b.innerHTML=paused?'▶ <span>Play</span>':'Ⅱ <span>Pause</span>';b.setAttribute('aria-pressed',String(paused));}
document.querySelector('#pause').onclick=togglePause;
document.querySelector('#replay').onclick=()=>{elapsed=0;forcedBlink=-10;draw(elapsed);};
screen.addEventListener('pointermove',e=>{const r=screen.getBoundingClientRect();pointerX=(e.clientX-r.left)/r.width*2-1;pointerY=(e.clientY-r.top)/r.height*2-1;pointerUntil=performance.now()+2200;});
screen.onclick=()=>{forcedBlink=elapsed;if(paused){paused=false;document.querySelector('#pause').innerHTML='Ⅱ <span>Pause</span>';document.querySelector('#pause').setAttribute('aria-pressed','false');}};
document.querySelectorAll('.swatch').forEach(b=>b.onclick=()=>{color=b.dataset.color;document.documentElement.style.setProperty('--ink',color);document.querySelectorAll('.swatch').forEach(s=>{s.classList.toggle('active',s===b);s.setAttribute('aria-pressed',String(s===b));});draw(elapsed);});
document.querySelector('#cinema').onclick=()=>{const on=document.body.classList.toggle('cinema');document.querySelector('#cinema').setAttribute('aria-pressed',String(on));};
document.querySelector('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{document.body.classList.toggle('cinema');}};
document.addEventListener('keydown',e=>{if(e.code==='Space'&&e.target===document.body){e.preventDefault();togglePause();}if(e.key==='Escape')document.body.classList.remove('cinema');});
if(reduced){paused=true;document.querySelector('#pause').innerHTML='▶ <span>Play</span>';document.querySelector('#pause').setAttribute('aria-pressed','true');}
