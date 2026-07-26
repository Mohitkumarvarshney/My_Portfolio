
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  revealEls.forEach(el=>io.observe(el));

  
  const canvas = document.getElementById('boundary');
  const ctx = canvas.getContext('2d');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resizeCanvas(){
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = 260 * dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  window.addEventListener('resize', resizeCanvas);

  
  function rand(min,max){ return Math.random()*(max-min)+min; }
  let points = [];
  function seedPoints(w,h){
    points = [];
    for(let i=0;i<26;i++){
      points.push({ x: rand(w*0.08,w*0.46), y: rand(h*0.15,h*0.85), cls:0, settle: rand(0,1) });
    }
    for(let i=0;i<26;i++){
      points.push({ x: rand(w*0.54,w*0.92), y: rand(h*0.15,h*0.85), cls:1, settle: rand(0,1) });
    }
  }

  let t = 0;
  let epoch = 0;
  const epochEl = document.getElementById('epochCount');
  const accEl = document.getElementById('accVal');
  const colorA = '#2F6F5E'; 
  const colorB = '#B4552F'; 

  function draw(){
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = 260;
    ctx.clearRect(0,0,w,h);

    
    const progress = Math.min(1, t/90);
    epoch = Math.floor(progress*40);
    epochEl.textContent = epoch;
    accEl.textContent = (86 + progress*10.2).toFixed(1) + '%';

    
    ctx.strokeStyle = '#EEF0EC';
    ctx.lineWidth = 1;
    for(let gx=0; gx<w; gx+=40){ ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,h); ctx.stroke(); }
    for(let gy=0; gy<h; gy+=40){ ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(w,gy); ctx.stroke(); }

    
    const wobble = (1-progress) * 18 * Math.sin(t*0.06);
    ctx.beginPath();
    for(let x=0;x<=w;x+=6){
      const midY = h/2 + Math.sin(x*0.02 + t*0.01)* (10*(1-progress)) + wobble*Math.sin(x*0.01);
      const yy = midY;
      if(x===0) ctx.moveTo(x,yy); else ctx.lineTo(x,yy);
    }
    ctx.strokeStyle = '#C7CBC3';
    ctx.lineWidth = 2;
    ctx.setLineDash([5,5]);
    ctx.stroke();
    ctx.setLineDash([]);

    
    points.forEach(p=>{
      const targetX = p.cls===0 ? p.x * (1-progress*0.15) : p.x + (w-p.x)*0*0;
      const jitter = (1-progress) * 6;
      const px = p.x + Math.sin(t*0.05 + p.settle*10) * jitter * 0.4;
      const py = p.y + Math.cos(t*0.04 + p.settle*10) * jitter * 0.4;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI*2);
      ctx.fillStyle = p.cls===0 ? colorA : colorB;
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    t += 1;
    if(!prefersReduced){
      requestAnimationFrame(draw);
    }
  }

  function init(){
    resizeCanvas();
    const rect = canvas.getBoundingClientRect();
    seedPoints(rect.width, 260);
    if(prefersReduced){
      t = 200; draw();
    } else {
      draw();
    }
  }
  window.addEventListener('load', init);