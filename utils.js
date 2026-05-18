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
  
  const specItems = platformMode === 'phones' ? [
    ['📱 Display', s.display],
    ['⚡ Processor', s.processor],
    ['📷 Camera', s.camera],
    ['🔋 Battery', s.battery],
    ['💾 RAM', s.ram],
    ['💿 Storage', s.storage],
    ['⚡ Charging', s.charging],
    ['🌐 Network', s.network],
    ['📍 NFC', s.nfc?'Yes':'No'],
    ['🎧 Headphone', s.headphone?'Yes':'No'],
    ['💧 Waterproof', s.waterproof],
    ['⚖️ Weight', s.weight],
    ['📐 Thickness', s.thickness],
    ['🤖 OS', s.os]
  ] : [
    ['🖥️ Display Panel', s.display],
    ['⚡ Processor CPU', s.processor],
    ['🎮 Graphics GPU', s.graphics || s.gpu || 'Integrated Graphics'],
    ['🔋 Battery capacity', s.battery],
    ['💾 RAM Size/Type', s.ram],
    ['💿 SSD Storage', s.storage],
    ['⚡ Charging Adapter', s.charging],
    ['🔌 Ports & IO', s.ports || 'Type-C, USB, HDMI, Audio Jack'],
    ['🤖 Pre-loaded OS', s.os],
    ['⚖️ Weight (Kg)', s.weight],
    ['📐 Dimensions', s.thickness],
    ['📹 Webcam camera', s.camera]
  ];

  content.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <h2>${phone.model}</h2>
      <button class="btn-outline btn-sm" onclick="copySpecsToClipboard('${phone.id}')">📋 Copy Specs</button>
    </div>
    <div class="specs-badge" style="background:${phone.badgeColor||'#6c5ce7'}22;color:${phone.badgeColor||'#a855f7'}">${phone.badge||''}</div>
    
    <div class="specs-radar-container" style="display:flex; justify-content:center; align-items:center; margin:16px 0; background:rgba(0,0,0,0.2); border:1px solid var(--border-color); border-radius:12px; padding:16px;">
      <canvas id="specRadarCanvas" style="width: 250px; height: 250px; display: block;"></canvas>
    </div>
 
    <div class="specs-grid">
      ${specItems.filter(([,v])=>v).map(([k,v])=>`<div class="spec-row"><span class="spec-key">${k}</span><span class="spec-val">${v}</span></div>`).join('')}
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
  
  setTimeout(() => {
    drawSpecRadarChart('specRadarCanvas', phone.rating || {});
  }, 50);
}

// ── Custom Pure HTML5 Canvas Radar Spider Chart ──
function drawSpecRadarChart(canvasId, rating) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // Set retina scaling factor
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  
  const width = rect.width;
  const height = rect.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 * 0.70;
  
  const pillars = platformMode === 'phones' ? [
    { label: '🖥️ Display', val: rating.display || 4 },
    { label: '⚙️ Performance', val: rating.performance || rating.gaming || 4 },
    { label: '📸 Camera', val: rating.camera || 4 },
    { label: '🔋 Battery', val: rating.battery || 4 },
    { label: '💰 Value', val: rating.value || rating.overall || 4 }
  ] : [
    { label: '🖥️ Display', val: rating.display || 4 },
    { label: '⚙️ Performance', val: rating.performance || 4 },
    { label: '🎮 Graphics', val: rating.gaming || 4 },
    { label: '🔋 Battery', val: rating.battery || 4 },
    { label: '💎 Build', val: rating.trust || rating.overall || 4 }
  ];
  
  const total = pillars.length;
  
  // 1. Draw concentric grid polygons
  const levels = 5;
  ctx.lineWidth = 1;
  for (let j = 1; j <= levels; j++) {
    const r = radius * (j / levels);
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.04 * j})`;
    ctx.beginPath();
    for (let i = 0; i < total; i++) {
      const angle = (i * 2 * Math.PI / total) - Math.PI / 2;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }
  
  // 2. Draw radial spoke lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  for (let i = 0; i < total; i++) {
    const angle = (i * 2 * Math.PI / total) - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
    ctx.stroke();
  }
  
  // 3. Draw data polygon
  const points = [];
  pillars.forEach((p, i) => {
    const angle = (i * 2 * Math.PI / total) - Math.PI / 2;
    const r = radius * (p.val / 5);
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    points.push({ x, y });
  });
  
  ctx.shadowBlur = 8;
  ctx.shadowColor = '#a855f7';
  ctx.strokeStyle = '#a855f7';
  ctx.fillStyle = 'rgba(168, 85, 247, 0.25)';
  ctx.lineWidth = 2.5;
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  ctx.shadowBlur = 0; // Reset shadow
  
  // 4. Draw data coordinates and labels
  pillars.forEach((p, i) => {
    const angle = (i * 2 * Math.PI / total) - Math.PI / 2;
    const rVal = radius * (p.val / 5);
    const xVal = centerX + rVal * Math.cos(angle);
    const yVal = centerY + rVal * Math.sin(angle);
    
    // Node dots
    ctx.fillStyle = '#050510';
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(xVal, yVal, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Label placements
    ctx.fillStyle = '#a29bfe';
    ctx.font = '700 8.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const rLabel = radius * 1.22;
    const xLabel = centerX + rLabel * Math.cos(angle);
    const yLabel = centerY + rLabel * Math.sin(angle);
    
    ctx.fillText(`${p.label}: ${p.val}`, xLabel, yLabel);
  });
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
  document.getElementById('history-title').textContent = `📈 ${model} Price History & Analytics`;
  document.getElementById('history-content').innerHTML = '<div class="loading-spinner" style="margin:20px auto"></div>';
  document.getElementById('history-modal').style.display = 'flex';
  try {
    const res = await fetch(`${API}/api/history/${id}`);
    const history = await res.json();
    const content = document.getElementById('history-content');
    if (!history.length) { 
      content.innerHTML = '<p style="color:var(--text-secondary); text-align:center; padding:30px 0;">No price historical points detected yet. Fetch live prices to begin transaction logging.</p>'; 
      return; 
    }
    const platforms = [...new Set(history.flatMap(h => Object.keys(h.prices)))];
    const latest30 = history.slice(-30);
    const trends = platforms.map(p => {
      const vals = latest30.filter(h=>h.prices[p]).map(h=>h.prices[p]);
      if (vals.length < 2) return null;
      return { p, diff: vals[vals.length-1]-vals[0], curr: vals[vals.length-1] };
    }).filter(Boolean);

    content.innerHTML = `
      ${trends.length ? `<div class="trend-summary">${trends.map(t=>`<div class="trend-item"><span>${t.p}</span><span class="${t.diff<=0?'trend-down':'trend-up'}">${t.diff<=0?'↓':'↑'} ₹${Math.abs(t.diff).toLocaleString('en-IN')}</span></div>`).join('')}</div>` : ''}
      
      <div class="chart-container-wrap">
        <canvas id="priceTrendCanvas" style="width: 100%; height: 220px; display: block;"></canvas>
      </div>

      <div class="history-table-wrap"><table class="history-table">
        <thead><tr><th>Date</th>${platforms.map(p=>`<th>${p}</th>`).join('')}</tr></thead>
        <tbody>${latest30.map(entry=>`<tr>
          <td>${new Date(entry.date).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}</td>
          ${platforms.map(p=>`<td class="${entry.prices[p]?'':'no-data'}">${entry.prices[p]?'₹'+entry.prices[p].toLocaleString('en-IN'):'—'}</td>`).join('')}
        </tr>`).join('')}</tbody>
      </table></div>`;
      
      setTimeout(() => {
        drawPriceTrendChart('priceTrendCanvas', latest30, platforms);
      }, 50);
  } catch (e) { 
    console.error(e);
    document.getElementById('history-content').innerHTML = '<p style="color:#ff6b81; text-align:center; padding:20px;">Error loading price history analytics.</p>'; 
  }
}

// ── Custom Pure HTML5 Canvas Retina Price Trend Chart ──
function drawPriceTrendChart(canvasId, history, platforms) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // Set retina resolution
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  
  const width = rect.width;
  const height = rect.height;
  
  // Chart padding
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  
  // Find min/max prices
  const allPrices = history.flatMap(h => Object.values(h.prices));
  if (!allPrices.length) return;
  const maxPrice = Math.max(...allPrices) * 1.03;
  const minPrice = Math.max(0, Math.min(...allPrices) * 0.97);
  const priceRange = maxPrice - minPrice || 1000;
  
  // Draw grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  const gridLines = 4;
  for (let i = 0; i <= gridLines; i++) {
    const y = paddingTop + (chartHeight * i / gridLines);
    ctx.beginPath();
    ctx.moveTo(paddingLeft, y);
    ctx.lineTo(width - paddingRight, y);
    ctx.stroke();
    
    // Draw Y axis labels
    ctx.fillStyle = '#6a6a8a';
    ctx.font = '9px monospace';
    const labelPrice = Math.round(maxPrice - (priceRange * i / gridLines));
    ctx.fillText(`₹${labelPrice.toLocaleString('en-IN')}`, 8, y + 3);
  }
  
  // Plot each platform line
  const colors = {
    'Amazon': '#ff9900',
    'Flipkart': '#2874f0',
    'Croma': '#00b300',
    'Reliance Digital': '#e42529',
    'Vijay Sales': '#f37021',
    '91Mobiles': '#e91e63'
  };
  
  platforms.forEach(platform => {
    const color = colors[platform] || '#6c5ce7';
    const points = [];
    
    history.forEach((h, idx) => {
      const price = h.prices[platform];
      if (price) {
        const x = paddingLeft + (chartWidth * idx / (history.length - 1 || 1));
        const y = paddingTop + (chartHeight * (1 - (price - minPrice) / priceRange));
        points.push({ x, y, price, date: h.date });
      }
    });
    
    if (points.length < 2) return;
    
    // Draw neon shadow/glow path
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    
    // Reset shadow for dots
    ctx.shadowBlur = 0;
    
    // Draw dots
    points.forEach(pt => {
      ctx.fillStyle = '#0a0a1a';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  });
  
  // Draw X axis dates
  ctx.fillStyle = '#6a6a8a';
  ctx.font = '8px monospace';
  const labelInterval = Math.ceil(history.length / 5);
  history.forEach((h, idx) => {
    if (idx % labelInterval === 0 || idx === history.length - 1) {
      const x = paddingLeft + (chartWidth * idx / (history.length - 1 || 1));
      const dateStr = new Date(h.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      ctx.fillText(dateStr, x - 15, height - 10);
    }
  });
}

// ── Control Center Simulator Actions ──
async function simulateScraperAction(type) {
  showToast('⚡ Running simulation...');
  let apiType = 'price_drop';
  if (type === 'flash-sale') apiType = 'flash_sale';
  if (type === 'out-of-stock') apiType = 'stock_out';
  if (type === 'reset') apiType = 'reset';
  
  try {
    const res = await fetch(`${API}/api/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: apiType })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`✅ Simulation Success: ${data.message}`);
      await updateDashboardMetrics();
      await loadPhones(); // Reload catalog to show simulated prices!
    } else {
      showToast(`❌ Simulation Failed: ${data.error}`);
    }
  } catch (e) {
    console.error(e);
    showToast('❌ Simulation error. Server unreachable.');
  }
}

// ── Clear Terminal Logs ──
function clearTerminalLogs() {
  const term = document.getElementById('terminal-body');
  if (term) {
    term.innerHTML = '<div class="terminal-line warning">> Logs buffer cleared. Waiting for status ping...</div>';
  }
}

// ── Update Dashboard Metrics & Terminal Logs ──
async function updateDashboardMetrics() {
  try {
    const res = await fetch(`${API}/api/status`);
    const status = await res.json();
    
    // Update metric dashboard values
    if (status.metrics) {
      document.getElementById('metric-alerts').textContent = status.metrics.alertsCount;
      document.getElementById('metric-histories').textContent = status.metrics.historyCount;
      document.getElementById('metric-phones').textContent = status.metrics.phonesCount;
    }
    
    // Update scrolling terminal log line items
    const term = document.getElementById('terminal-body');
    if (term && status.recentLogs) {
      const lines = status.recentLogs.map(log => {
        const timeStr = new Date(log.timestamp).toLocaleTimeString();
        const typeClass = log.status === 'error' ? 'error' : (log.message.includes('SIMULATION') || log.message.includes('FLASH') ? 'warning' : 'success');
        return `<div class="terminal-line ${typeClass}">[${timeStr}] ${log.message}</div>`;
      }).reverse().join(''); // Show chronologically
      term.innerHTML = lines;
      term.scrollTop = term.scrollHeight; // Auto-scroll
    }
    
    // Load Active Alert Subscriptions Panel
    await loadAlertsMonitor();
  } catch (e) {
    console.error('Failed to update dashboard metrics:', e);
  }
}

// ── SQLite Alert Subscriptions Diagnostics Tracker ──
async function loadAlertsMonitor() {
  const container = document.getElementById('alerts-monitor-body');
  if (!container) return;
  try {
    const res = await fetch(`${API}/api/alerts`);
    const alerts = await res.json();
    if (!alerts.length) {
      container.innerHTML = '<div style="text-align:center; color:var(--text-secondary); padding:40px 0; font-size:0.8rem;">💤 No active subscriptions inside SQLite `alerts` table. Add a price alert on any phone card to begin logging.</div>';
      return;
    }
    
    container.innerHTML = alerts.map(alert => {
      const phone = allPhones.find(p => p.id === alert.phoneId) || { model: alert.phoneId };
      return `<div class="alert-monitor-row" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.03); padding:8px 0; gap:8px;">
        <div style="font-size:0.8rem; text-align:left;">
          <strong style="color:#00cec9">${alert.email}</strong><br/>
          <span style="color:var(--text-secondary)">${phone.model} (Target: ₹${parseInt(alert.targetPrice).toLocaleString('en-IN')})</span>
        </div>
        <button class="btn-primary" onclick="simulateAlertNotification('${alert.email}', '${alert.phoneId}', ${alert.targetPrice})" style="padding:4px 8px; font-size:0.75rem; border-radius:4px;">📨 Test Alert</button>
      </div>`;
    }).join('');
  } catch (e) {
    console.error(e);
    container.innerHTML = '<div style="color:#ff6b81; padding:20px; font-size:0.8rem;">Failed to load alerts list.</div>';
  }
}

async function simulateAlertNotification(email, phoneId, targetPrice) {
  showToast('📨 Dispatched simulated alert...');
  try {
    const res = await fetch(`${API}/api/alerts/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, phoneId, targetPrice })
    });
    const d = await res.json();
    if (d.success) {
      showToast('✅ Simulated dispatch logged successfully!');
      await updateDashboardMetrics();
    }
  } catch (e) {
    console.error(e);
    showToast('❌ Simulated notification failed');
  }
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
  renderQuizSteps();
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

  // Dashboard Status Metrics
  updateDashboardMetrics();
  setInterval(updateDashboardMetrics, 5000);
});
