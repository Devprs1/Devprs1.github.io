// Particle system
const canvas=document.getElementById('particles');
if(canvas){
  const ctx=canvas.getContext('2d');
  let particles=[];
  function resize(){canvas.width=innerWidth;canvas.height=innerHeight}
  resize();addEventListener('resize',resize);
  class P{constructor(){this.x=Math.random()*canvas.width;this.y=Math.random()*canvas.height;this.vx=(Math.random()-.5)*.3;this.vy=(Math.random()-.5)*.3;this.r=Math.random()*1.5+.5;this.c=['#00f0ff','#8000ff','#ff0080'][Math.floor(Math.random()*3)]}
    update(){this.x+=this.vx;this.y+=this.vy;if(this.x<0||this.x>canvas.width)this.vx*=-1;if(this.y<0||this.y>canvas.height)this.vy*=-1}
    draw(){ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fillStyle=this.c;ctx.globalAlpha=.6;ctx.fill();ctx.globalAlpha=1}
  }
  for(let i=0;i<80;i++)particles.push(new P());
  function animate(){ctx.clearRect(0,0,canvas.width,canvas.height);particles.forEach(p=>{p.update();p.draw()});
    // connect close particles
    for(let i=0;i<particles.length;i++)for(let j=i+1;j<particles.length;j++){
      const dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<120){ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(particles[j].x,particles[j].y);ctx.strokeStyle=`rgba(0,240,255,${(1-d/120)*.15})`;ctx.stroke()}
    }
    requestAnimationFrame(animate)
  }
  animate();
}

// Counter animation
function animateCounter(el,target,duration=2000){
  const start=performance.now();
  const startVal=parseInt(el.textContent)||0;
  function tick(now){
    const p=Math.min((now-start)/duration,1);
    const eased=1-Math.pow(1-p,3);
    el.textContent=Math.floor(startVal+(target-startVal)*eased).toLocaleString();
    if(p<1)requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// Observe stats
const statsObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.querySelectorAll('[data-target]').forEach(el=>{
        animateCounter(el,parseInt(el.dataset.target));
      });
      statsObs.unobserve(e.target);
    }
  });
},{threshold:.3});
document.querySelectorAll('.hero-stats').forEach(el=>statsObs.observe(el));

// Live stats with jitter
function liveNumber(id,base,variance,suffix=''){
  const el=document.getElementById(id);
  if(!el)return;
  let current=base;
  function update(){
    current=base+Math.floor(Math.random()*variance);
    el.textContent=current.toLocaleString()+suffix;
  }
  update();
  setInterval(()=>{
    current+=Math.floor(Math.random()*50);
    el.textContent=current.toLocaleString()+suffix;
  },2000);
}
liveNumber('attacksBlocked',12847,200);
liveNumber('packetsFiltered',89234521,5000);
liveNumber('networkLoad',34,5,'%');
liveNumber('responseTime',8,3,'ms');

// FAQ toggle
document.querySelectorAll('.faq-q').forEach(q=>{
  q.addEventListener('click',()=>{q.parentElement.classList.toggle('open')});
});

// Modal
function openLogin(){document.getElementById('loginModal').classList.add('active')}
function closeLogin(){document.getElementById('loginModal').classList.remove('active')}
document.getElementById('loginModal')?.addEventListener('click',e=>{if(e.target.id==='loginModal')closeLogin()});

function googleSignIn(){
  // Simulate Google sign-in
  const btn=event.target.closest('.google-btn');
  btn.innerHTML='<div style="width:20px;height:20px;border:2px solid #0003;border-top-color:#000;border-radius:50%;animation:spin 1s linear infinite"></div> Signing in...';
  setTimeout(()=>{
    localStorage.setItem('fg_user',JSON.stringify({name:'Player',email:'player@floodguard.io',avatar:'P'}));
    window.location.href='dashboard.html';
  },1200);
}

// Navbar scroll
addEventListener('scroll',()=>{
  const nav=document.querySelector('.navbar');
  if(scrollY>20)nav.style.background='rgba(5,6,10,0.9)';else nav.style.background='rgba(5,6,10,0.7)';
});

// Tilt effect
document.querySelectorAll('[data-tilt]').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    card.style.transform=`translateY(-6px) perspective(1000px) rotateX(${-y*6}deg) rotateY(${x*6}deg)`;
  });
  card.addEventListener('mouseleave',()=>{card.style.transform=''});
});

// Spin keyframe
const sheet=document.styleSheets[0];
try{sheet.insertRule('@keyframes spin{to{transform:rotate(360deg)}}',sheet.cssRules.length)}catch(e){}
