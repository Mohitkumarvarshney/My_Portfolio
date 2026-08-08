document.getElementById('year').textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================= Scroll progress bar ================= */
const progressBar = document.getElementById('scrollProgress');
function updateProgress(){
  const h = document.documentElement;
  const scrolled = h.scrollTop;
  const max = h.scrollHeight - h.clientHeight;
  const pct = max > 0 ? (scrolled / max) * 100 : 0;
  progressBar.style.width = pct + '%';
}

/* ================= Header: hide on scroll down, appear on scroll up ================= */
const header = document.getElementById('siteHeader');
let lastY = window.scrollY;
let ticking = false;

function handleScroll(){
  const y = window.scrollY;

  header.classList.toggle('scrolled', y > 10);

  if (y > lastY && y > 120) {
    // scrolling down — hide
    header.classList.add('hide');
  } else if (y < lastY) {
    // scrolling up — reveal
    header.classList.remove('hide');
  }
  lastY = y <= 0 ? 0 : y;

  updateProgress();
  toggleBackToTop(y);
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking){
    requestAnimationFrame(handleScroll);
    ticking = true;
  }
}, { passive:true });

updateProgress();

/* ================= Back to top button ================= */
const backToTop = document.getElementById('backToTop');
function toggleBackToTop(y){
  backToTop.classList.toggle('show', y > 480);
}
backToTop.addEventListener('click', () => {
  window.scrollTo({ top:0, behavior: reduceMotion ? 'auto' : 'smooth' });
});

/* ================= Scroll reveal (re-triggers both directions) ================= */
const revealEls = document.querySelectorAll('.reveal');
revealEls.forEach(el => {
  const delay = el.getAttribute('data-delay');
  if (delay) el.style.setProperty('--d', delay);
});

if (reduceMotion){
  revealEls.forEach(el => el.classList.add('in-view'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.classList.toggle('in-view', entry.isIntersecting);
    });
  }, { threshold:0.15, rootMargin:'0px 0px -8% 0px' });

  revealEls.forEach(el => io.observe(el));
}

/* ================= Terminal typing sequence ================= */
const termBody = document.getElementById('termBody');
const sequence = [
  { cmd: 'whoami', out: 'Mohit Kumar Varshney' },
  { cmd: 'cat role.txt', out: 'Software Developer · ML/AI Engineer · Frontend Developer' },
  { cmd: './status --check', out: 'Fresher · Open to relocation · 170+ DSA problems solved', hl: true }
];

function renderStatic(){
  termBody.innerHTML = sequence.map(s => `
    <div class="term-line"><span class="prompt">$</span> ${s.cmd}</div>
    <div class="term-out">${s.hl ? '<span class="hl">'+s.out+'</span>' : s.out}</div>
  `).join('');
}

async function typeLine(el, text, speed){
  for (let i = 0; i <= text.length; i++){
    el.textContent = text.slice(0, i);
    await new Promise(r => setTimeout(r, speed));
  }
}

async function runSequence(){
  for (const step of sequence){
    const lineEl = document.createElement('div');
    lineEl.className = 'term-line';
    const prompt = document.createElement('span');
    prompt.className = 'prompt';
    prompt.textContent = '$ ';
    const cmdSpan = document.createElement('span');
    lineEl.appendChild(prompt);
    lineEl.appendChild(cmdSpan);
    termBody.appendChild(lineEl);
    await typeLine(cmdSpan, step.cmd, 38);
    await new Promise(r => setTimeout(r, 220));
    const outEl = document.createElement('div');
    outEl.className = 'term-out';
    outEl.innerHTML = step.hl ? '<span class="hl">' + step.out + '</span>' : step.out;
    termBody.appendChild(outEl);
    await new Promise(r => setTimeout(r, 320));
  }
  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  termBody.appendChild(cursor);
}

if (reduceMotion){
  renderStatic();
} else {
  runSequence();
}

/* ================= DSA counter animation ================= */
const dsaCountEl = document.getElementById('dsaCount');
let dsaAnimated = false;
function animateCount(el, target, duration){
  const start = performance.now();
  function frame(now){
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
const dsaObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !dsaAnimated){
      dsaAnimated = true;
      if (reduceMotion){
        dsaCountEl.textContent = '170';
      } else {
        animateCount(dsaCountEl, 170, 1400);
      }
    }
  });
}, { threshold:0.6 });
dsaObserver.observe(dsaCountEl);

/* ================= Magnetic buttons ================= */
if (!reduceMotion){
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0, 0)';
    });
  });
}

/* ================= Project card tilt ================= */
if (!reduceMotion){
  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) translateY(-2px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(900px) rotateY(0) rotateX(0) translateY(0)';
    });
  });
}

/* ================= Hero neural network canvas ================= */
const canvas = document.getElementById('neuralCanvas');
if (canvas && !reduceMotion){
  const ctx = canvas.getContext('2d');
  let width, height, nodes;
  const NODE_COUNT = 46;
  const LINK_DIST = 130;

  function resize(){
    const rect = canvas.parentElement.getBoundingClientRect();
    width = canvas.width = rect.width;
    height = canvas.height = rect.height;
  }

  function initNodes(){
    nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35
    }));
  }

  function step(){
    ctx.clearRect(0, 0, width, height);

    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    });

    for (let i = 0; i < nodes.length; i++){
      for (let j = i + 1; j < nodes.length; j++){
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST){
          ctx.strokeStyle = `rgba(94,234,212,${(1 - dist / LINK_DIST) * 0.18})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    nodes.forEach(n => {
      ctx.fillStyle = 'rgba(244,184,96,0.55)';
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(step);
  }

  resize();
  initNodes();
  requestAnimationFrame(step);
  window.addEventListener('resize', () => {
    resize();
  }, { passive:true });
}
