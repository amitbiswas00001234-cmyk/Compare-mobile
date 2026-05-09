// ── Wishlist (Backend) ──
async function getWishlist() { 
  try { 
    const res = await fetch(`${API}/api/wishlist`);
    return await res.json();
  } catch { 
    return []; 
  } 
}
async function saveWishlist(list) { 
  try {
    await fetch(`${API}/api/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(list)
    });
  } catch (e) {
    console.error('Failed to save wishlist', e);
  }
}

async function toggleWishlist(id, btn) {
  const list = await getWishlist();
  const idx = list.indexOf(id);
  if (idx >= 0) { list.splice(idx, 1); btn.textContent = '🤍'; btn.classList.remove('wishlist-active'); showToast('Removed from wishlist'); }
  else { list.push(id); btn.textContent = '❤️'; btn.classList.add('wishlist-active'); showToast('❤️ Added to wishlist!'); }
  await saveWishlist(list);
  renderWishlistPanel();
}

async function renderWishlistPanel() {
  const list = await getWishlist();
  const panel = document.getElementById('wishlist-panel');
  const grid = document.getElementById('wishlist-grid');
  if (!list.length) { panel.style.display = 'none'; return; }
  panel.style.display = 'block';
  const phones = allPhones.filter(p => list.includes(p.id));
  grid.innerHTML = phones.map((p,i) => buildPhoneCard(p, i, list)).join('');
  initRevealAnimations();
}

// ── Price Alert Modal ──
function openAlert(id, model) {
  document.getElementById('alert-phone-id').value = id;
  document.getElementById('alert-phone-name').textContent = model;
  const phone = allPhones.find(p => p.id === id);
  if (phone?.price) document.getElementById('alert-price').value = Math.round(phone.price * 0.9);
  document.getElementById('alert-modal').style.display = 'flex';
}

async function submitAlert() {
  const email = document.getElementById('alert-email').value;
  const phoneId = document.getElementById('alert-phone-id').value;
  const targetPrice = document.getElementById('alert-price').value;
  if (!email || !targetPrice) { showToast('Please fill all fields'); return; }
  try {
    const res = await fetch(`${API}/api/alerts`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, phoneId, targetPrice }) });
    const d = await res.json();
    showToast(`✅ ${d.message}`);
    document.getElementById('alert-modal').style.display = 'none';
  } catch { showToast('❌ Failed to set alert'); }
}

// ── Full Specs Modal ──
function showSpecs(id) {
  const phone = allPhones.find(p => p.id === id);
  if (!phone) return;
  const s = phone.specs || {};
  const content = document.getElementById('specs-content');
  content.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <h2>${phone.model}</h2>
      <button class="btn-outline btn-sm" onclick="copySpecsToClipboard('${phone.id}')">📋 Copy Specs</button>
    </div>
    <div class="specs-badge" style="background:${phone.badgeColor||'#6c5ce7'}22;color:${phone.badgeColor||'#a855f7'}">${phone.badge||''}</div>
    <div class="specs-grid">
      ${[['📱 Display', s.display],['⚡ Processor', s.processor],['📷 Camera', s.camera],['🔋 Battery', s.battery],['💾 RAM', s.ram],['💿 Storage', s.storage],['⚡ Charging', s.charging],['🌐 Network', s.network],['📍 NFC', s.nfc?'Yes':'No'],['🎧 Headphone', s.headphone?'Yes':'No'],['💧 Waterproof', s.waterproof],['⚖️ Weight', s.weight],['📐 Thickness', s.thickness],['🤖 OS', s.os]].filter(([,v])=>v).map(([k,v])=>`<div class="spec-row"><span class="spec-key">${k}</span><span class="spec-val">${v}</span></div>`).join('')}
    </div>
    <div class="specs-ratings">
      <h3>⭐ Rating Breakdown</h3>
      <div class="rating-bars">
        ${Object.entries(phone.rating||{}).map(([k,v])=>`
          <div class="rating-row"><span>${k.charAt(0).toUpperCase()+k.slice(1)}</span>
            <div class="rating-track"><div class="rating-fill" style="width:${v/5*100}%"></div></div>
            <span>${v}</span></div>`).join('')}
      </div>
    </div>
    ${phone.verdict ? `<div class="verdict" style="margin-top:16px">💬 <em>${phone.verdict}</em></div>` : ''}
    ${(phone.offers||[]).length ? `<div class="current-offers"><h3>🎁 Current Offers</h3>${phone.offers.map(o=>`<div class="offer-item">• ${o}</div>`).join('')}</div>` : ''}
  `;
  document.getElementById('specs-modal').style.display = 'flex';
}

function copySpecsToClipboard(id) {
  const phone = allPhones.find(p => p.id === id);
  if (!phone) return;
  const s = phone.specs || {};
  const text = `
📱 ${phone.model} Specs:
• Display: ${s.display || '—'}
• Processor: ${s.processor || '—'}
• Camera: ${s.camera || '—'}
• Battery: ${s.battery || '—'}
• RAM/Storage: ${s.ram || '—'} / ${s.storage || '—'}
• OS: ${s.os || '—'}
  `.trim();
  
  navigator.clipboard.writeText(text).then(() => {
    showToast('📋 Specs copied to clipboard!');
  }).catch(() => {
    showToast('❌ Failed to copy specs');
  });
}

// ── Price History Modal ──
async function showPriceHistory(id, model) {
  document.getElementById('history-title').textContent = `📈 ${model} Price History`;
  document.getElementById('history-content').innerHTML = '<div class="loading-spinner" style="margin:20px auto"></div>';
  document.getElementById('history-modal').style.display = 'flex';
  try {
    const res = await fetch(`${API}/api/history/${id}`);
    const history = await res.json();
    const content = document.getElementById('history-content');
    if (!history.length) { content.innerHTML = '<p style="color:var(--text-secondary)">No history yet. Fetch prices to start tracking.</p>'; return; }
    const platforms = [...new Set(history.flatMap(h => Object.keys(h.prices)))];
    const latest30 = history.slice(-30);
    const trends = platforms.map(p => {
      const vals = latest30.filter(h=>h.prices[p]).map(h=>h.prices[p]);
      if (vals.length < 2) return null;
      return { p, diff: vals[vals.length-1]-vals[0], curr: vals[vals.length-1] };
    }).filter(Boolean);

    content.innerHTML = `
      ${trends.length ? `<div class="trend-summary">${trends.map(t=>`<div class="trend-item"><span>${t.p}</span><span class="${t.diff<=0?'trend-down':'trend-up'}">${t.diff<=0?'↓':'↑'} ₹${Math.abs(t.diff).toLocaleString('en-IN')}</span></div>`).join('')}</div>` : ''}
      <div class="history-table-wrap"><table class="history-table">
        <thead><tr><th>Date</th>${platforms.map(p=>`<th>${p}</th>`).join('')}</tr></thead>
        <tbody>${latest30.map(entry=>`<tr>
          <td>${new Date(entry.date).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}</td>
          ${platforms.map(p=>`<td class="${entry.prices[p]?'':'no-data'}">${entry.prices[p]?'₹'+entry.prices[p].toLocaleString('en-IN'):'—'}</td>`).join('')}
        </tr>`).join('')}</tbody>
      </table></div>`;
  } catch { document.getElementById('history-content').innerHTML = '<p>Error loading history.</p>'; }
}

// ── Custom Search ──
async function searchCustomPhone() {
  const q = document.getElementById('custom-search').value.trim();
  if (!q) return;
  showToast(`🔍 Searching "${q}"...`);
  const modal = document.getElementById('search-modal');
  const results = document.getElementById('search-results');
  modal.style.display = 'flex';
  results.innerHTML = '<div class="loading-spinner" style="margin:30px auto"></div>';
  try {
    const res = await fetch(`${API}/api/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    results.innerHTML = `<h3>Results for "${data.query}"</h3>
      ${data.bestPrice ? `<div class="search-best">🏆 Best: <strong>${data.bestPrice.formatted}</strong> on ${data.bestPrice.platform}</div>` : ''}
      <div class="search-platforms">${Object.entries(data.platforms).map(([name,d])=>{
        const meta = PLATFORM_META[name]||{color:'#888',icon:'🔗'};
        return `<a href="${d.link}" target="_blank" class="search-platform-card" style="--pcolor:${meta.color}">
          <span>${meta.icon} ${name}</span><span class="sp-price">${d.priceFormatted||'Check Price'}</span>
          ${d.title?`<span class="sp-title">${d.title}</span>`:''}
        </a>`;
      }).join('')}</div>`;
  } catch { results.innerHTML = '<p>Search failed. Try again.</p>'; }
}

// ── Fetch All Prices ──
async function startFullFetch() {
  const btn = document.getElementById('fetch-all-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '⏳ Fetching...'; }
  showToast('🔄 Fetching prices from all platforms (~2 min)...');
  try {
    await fetch(`${API}/api/refresh`, { method:'POST' });
    pollProgress();
  } catch { showToast('❌ Failed to start fetch'); if (btn) { btn.disabled=false; btn.innerHTML='🔄 Fetch Prices'; } }
}

async function pollProgress() {
  const bar = document.getElementById('progress-bar');
  const text = document.getElementById('progress-text');
  const container = document.getElementById('progress-container');
  if (container) container.style.display = 'block';
  const interval = setInterval(async () => {
    try {
      const res = await fetch(`${API}/api/progress`);
      const prog = await res.json();
      const pct = prog.total > 0 ? (prog.current/prog.total*100) : 0;
      if (bar) bar.style.width = pct+'%';
      if (text) text.textContent = prog.status==='done' ? '✅ Done!' : `Fetching ${prog.currentPhone} (${prog.current}/${prog.total})`;
      if (prog.status === 'done') {
        clearInterval(interval);
        await loadPhones();
        const btn = document.getElementById('fetch-all-btn');
        if (btn) { btn.disabled=false; btn.innerHTML='🔄 Fetch Prices'; }
        setTimeout(() => { if (container) container.style.display='none'; }, 3000);
      }
    } catch { clearInterval(interval); }
  }, 2000);
}

// ── Utilities ──
function showLoading(show) { const el=document.getElementById('loading-overlay'); if(el) el.style.display=show?'flex':'none'; }

function showEmptyState() {
  const grid = document.getElementById('phones-grid');
  if (grid) grid.innerHTML = `<div class="empty-state">
    <div class="empty-icon">📡</div><h3>No Data Yet</h3>
    <p>Click <strong>"Fetch Prices"</strong> to get live prices from all platforms.</p>
    <button class="btn-primary" onclick="startFullFetch()">🔄 Fetch Now</button>
  </div>`;
}

function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id='toast'; document.body.appendChild(t); }
  t.textContent = msg; t.className='toast show';
  setTimeout(() => t.className='toast', 4000);
}

function initRevealAnimations() {
  const obs = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);} }), { threshold:0.1 });
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => obs.observe(el));
}

function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count), suffix = el.dataset.suffix||'';
    let cur = 0; const inc = target/60;
    const t = setInterval(()=>{ cur+=inc; if(cur>=target){el.textContent=target+suffix;clearInterval(t);}else el.textContent=Math.floor(cur)+suffix; },20);
  });
}

function subscribeNewsletter(e) {
  e.preventDefault();
  const input = document.getElementById('newsletter-email');
  if (input?.value) { showToast('🎉 Subscribed for price alerts!'); input.value=''; }
}

// ── FAQ ──
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const was = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('active'));
    if (!was) item.classList.add('active');
  });
});

window.addEventListener('scroll', () => {
  document.querySelector('.navbar')?.classList.toggle('scrolled', window.scrollY>50);
  document.querySelector('.back-to-top')?.classList.toggle('visible', window.scrollY>500);
  
  // Update Scroll Progress Bar
  const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = (winScroll / height) * 100;
  const progressEl = document.getElementById("scroll-progress");
  if (progressEl) progressEl.style.width = scrolled + "%";
});

function sharePhone(id, model) {
  const url = `${window.location.origin}${window.location.pathname}?phone=${id}`;
  const text = `Check out the ${model} on BudgetPick! Live prices and comparison:`;
  
  if (navigator.share) {
    navigator.share({
      title: 'BudgetPick',
      text: text,
      url: url,
    }).then(() => {
      showToast('🎉 Shared successfully!');
    }).catch(() => {
      copyToClipboard(url);
    });
  } else {
    copyToClipboard(url);
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('📋 Link copied to clipboard!');
  }).catch(() => {
    showToast('❌ Failed to copy link');
  });
}

function triggerConfetti() {
  const colors = ['#6c5ce7', '#a855f7', '#00cec9', '#fdcb6e', '#ff6b81'];
  for (let i = 0; i < 60; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDuration = (Math.random() * 2 + 1) + 's';
    confetti.style.opacity = Math.random();
    confetti.style.width = (Math.random() * 8 + 4) + 'px';
    confetti.style.height = confetti.style.width;
    document.body.appendChild(confetti);
    
    setTimeout(() => confetti.remove(), 3000);
  }
}

function startVoiceSearch() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast('❌ Voice search not supported in this browser');
    return;
  }
  
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-IN'; // Indian English
  recognition.start();
  
  showToast('🎙️ Listening... Speak now!');
  
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const input = document.getElementById('list-search');
    if (input) {
      input.value = transcript;
      renderPhones(); // Trigger filter
      showToast(`🎙️ Found: "${transcript}"`);
    }
  };
  
  recognition.onerror = () => {
    showToast('❌ Voice recognition error or denied');
  };
}

function resetFilters() {
  currentCategory = 'all';
  currentBrand = 'all';
  currentTag = null;
  
  const listSearch = document.getElementById('list-search');
  if (listSearch) listSearch.value = '';
  
  const brandSelect = document.getElementById('brand-select');
  if (brandSelect) brandSelect.value = 'all';
  
  // Reset tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === 'all');
  });
  
  document.getElementById('phones-title').textContent = 'Best Budget Smartphones';
  document.getElementById('phones-label').textContent = '📡 Live Prices';
  
  renderPhones();
  showToast('🧹 Filters reset!');
}

function toggleTheme() {
  const isLight = document.body.classList.toggle('light-mode');
  localStorage.setItem('budgetpick_theme', isLight ? 'light' : 'dark');
  showToast(`🌓 Switched to ${isLight ? 'Light' : 'Dark'} Mode`);
}

// ── Sort select ──
document.getElementById('sort-select')?.addEventListener('change', e => { sortBy=e.target.value; renderPhones(); });

// ── Init ──
document.addEventListener('DOMContentLoaded', async () => {
  if (localStorage.getItem('budgetpick_theme') === 'light') {
    document.body.classList.add('light-mode');
  }
  
  await loadPhones();
  loadOffers();
  loadUpcoming();
  loadBrands();
  calcEMI();
  renderWishlistPanel();
  initRevealAnimations();
  setTimeout(animateCounters, 500);
  
  // Database Status
  updateDBStatus();
  setInterval(updateDBStatus, 60000); 
});
