// Load user
const user=JSON.parse(localStorage.getItem('fg_user')||'{"name":"Player","email":"player@floodguard.io","avatar":"P"}');
document.getElementById('userName').textContent=user.name;
document.getElementById('userAvatar').textContent=user.avatar;
document.getElementById('welcomeName').textContent=user.name;

function logout(){localStorage.removeItem('fg_user');window.location.href='index.html'}

// Tab switching
document.querySelectorAll('.nav-item').forEach(item=>{
  item.addEventListener('click',e=>{
    e.preventDefault();
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
    item.classList.add('active');
    const tab=item.dataset.tab;
    document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
    document.querySelector(`[data-content="${tab}"]`)?.classList.add('active');
    document.getElementById('pageTitle').textContent=item.textContent.trim().replace(/\d+$/,'').trim();
  });
});

// Panel tabs
document.querySelectorAll('.panel-tabs').forEach(group=>{
  group.querySelectorAll('.panel-tab').forEach(t=>{
    t.addEventListener('click',()=>{
      group.querySelectorAll('.panel-tab').forEach(x=>x.classList.remove('active'));
      t.classList.add('active');
      drawChart();
    });
  });
});

// Animated chart
const canvas=document.getElementById('trafficChart');
const ctx=canvas.getContext('2d');
function resizeChart(){canvas.width=canvas.offsetWidth*2;canvas.height=440;canvas.style.height='220px'}
resizeChart();addEventListener('resize',()=>{resizeChart();drawChart()});

let cleanData=[],attackData=[];
function genData(){
  cleanData=[];attackData=[];
  for(let i=0;i<30;i++){
    cleanData.push(60+Math.sin(i*0.3)*20+Math.random()*15);
    attackData.push(10+Math.random()*15+(i>15&&i<22?40:0));
  }
}
genData();

function drawChart(){
  const w=canvas.width,h=canvas.height;
  ctx.clearRect(0,0,w,h);
  // grid
  ctx.strokeStyle='rgba(255,255,255,0.04)';ctx.lineWidth=1;
  for(let i=0;i<5;i++){const y=(h/5)*i;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
  function drawLine(data,color,fill){
    const max=100;
    const step=w/(data.length-1);
    ctx.beginPath();
    data.forEach((v,i)=>{
      const x=i*step;const y=h-(v/max)*h*0.9-20;
      if(i===0)ctx.moveTo(x,y);else{
        const px=(i-1)*step,py=h-(data[i-1]/max)*h*0.9-20;
        ctx.bezierCurveTo(px+step/2,py,x-step/2,y,x,y);
      }
    });
    ctx.strokeStyle=color;ctx.lineWidth=4;ctx.stroke();
    if(fill){
      ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath();
      const g=ctx.createLinearGradient(0,0,0,h);
      g.addColorStop(0,fill);g.addColorStop(1,'transparent');
      ctx.fillStyle=g;ctx.fill();
    }
  }
  drawLine(cleanData,'#00f0ff','rgba(0,240,255,0.2)');
  drawLine(attackData,'#ff3860','rgba(255,56,96,0.15)');
}
drawChart();

// Live update chart
setInterval(()=>{
  cleanData.shift();cleanData.push(60+Math.random()*30);
  attackData.shift();attackData.push(8+Math.random()*20);
  drawChart();
},2000);

// Attack activity feed
const attacks=[
  {type:'UDP Flood',ip:'185.220.**.**',size:'4.2 Gbps',time:'2m ago'},
  {type:'SYN Flood',ip:'103.45.**.**',size:'1.8 Gbps',time:'12m ago'},
  {type:'Minecraft Ping Flood',ip:'92.118.**.**',size:'780 Mbps',time:'34m ago'},
  {type:'HTTP Flood',ip:'45.143.**.**',size:'2.1 Gbps',time:'1h ago'},
  {type:'Amplification',ip:'178.62.**.**',size:'6.8 Gbps',time:'2h ago'},
  {type:'Botnet Scan',ip:'51.89.**.**',size:'340 Mbps',time:'3h ago'}
];
function renderActivity(containerId,items){
  const el=document.getElementById(containerId);
  if(!el)return;
  el.innerHTML=items.map(a=>`
    <div class="activity-item">
      <div class="activity-icon"><svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></div>
      <div class="activity-body">
        <div class="activity-title">${a.type} blocked</div>
        <div class="activity-meta">${a.ip} · ${a.size}</div>
      </div>
      <div class="activity-time">${a.time}</div>
    </div>`).join('');
}
renderActivity('activityList',attacks.slice(0,5));
renderActivity('attackLogList',attacks);

// Live counters
let attackCount=1284,trafficGB=847;
setInterval(()=>{
  attackCount+=Math.floor(Math.random()*5);
  trafficGB+=Math.random()*0.5;
  document.getElementById('dashAttacks').textContent=attackCount.toLocaleString();
  document.getElementById('dashTraffic').textContent=trafficGB.toFixed(0)+' GB';
},3000);

// Simulate new attack periodically
setInterval(()=>{
  const types=['UDP Flood','SYN Flood','Minecraft Ping Flood','HTTP Flood','Amplification'];
  const sizes=['1.2','2.4','3.8','4.5','5.1','6.2'];
  const newAttack={
    type:types[Math.floor(Math.random()*types.length)],
    ip:`${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.**.**`,
    size:sizes[Math.floor(Math.random()*sizes.length)]+' Gbps',
    time:'just now'
  };
  attacks.unshift(newAttack);
  attacks.pop();
  renderActivity('activityList',attacks.slice(0,5));
  renderActivity('attackLogList',attacks);
},8000);
