// ── State ──
const API = '';
let allPhones = [];
let currentCategory = 'all';
let currentBrand = 'all';
let currentTag = null;
let sortBy = 'bestPrice';
let compareSlots = [null, null, null];
let quizAnswers = {};
let quizCurrentStep = 1;
let emiTenure = 3;

const PLATFORM_META = {
  'Flipkart':        { color: '#2874f0', icon: '🛒' },
  'Amazon':          { color: '#ff9900', icon: '📦' },
  'Croma':           { color: '#00b300', icon: '🏪' },
  'Reliance Digital':{ color: '#e42529', icon: '🔴' },
  'Vijay Sales':     { color: '#f37021', icon: '🟠' },
  '91Mobiles':       { color: '#e91e63', icon: '📊' },
};

// ── Load phones from API ──
async function loadPhones() {
  showLoading(true);
  try {
    const res = await fetch(`${API}/api/phones`);
    const data = await res.json();
    allPhones = data.phones || [];
    updateLastUpdated(data.lastUpdated);
    renderPhones();
    renderComparisonTable();
  } catch(e) { showEmptyState(); }
  showLoading(false);
}

function updateLastUpdated(ts) {
  const el = document.getElementById('last-updated');
  if (!el) return;
  el.textContent = ts ? `Last updated: ${new Date(ts).toLocaleString('en-IN')}` : 'No data yet — click "Fetch Prices" to start';
}

// ── Render Phone Cards ──
async function renderPhones() {
  const grid = document.getElementById('phones-grid');
  let phones = [...allPhones];

  // Filter by Category/Tag
  if (currentTag) phones = phones.filter(p => p.tags && p.tags.includes(currentTag));
  else if (currentCategory !== 'all') phones = phones.filter(p => p.category === currentCategory);

  // Filter by Brand
  if (currentBrand !== 'all') {
    phones = phones.filter(p => p.brand.toLowerCase() === currentBrand.toLowerCase());
  }

  // Filter by Search Query
  const searchQuery = document.getElementById('list-search')?.value.toLowerCase().trim();
  if (searchQuery) {
    phones = phones.filter(p => p.model.toLowerCase().includes(searchQuery) || p.brand.toLowerCase().includes(searchQuery));
  }

  // Sort
  if (sortBy === 'bestPrice') phones.sort((a,b) => (a.liveData?.bestPrice?.price||a.price||99999)-(b.liveData?.bestPrice?.price||b.price||99999));
  else if (sortBy === 'rating') phones.sort((a,b) => (b.rating?.overall||0)-(a.rating?.overall||0));
  else phones.sort((a,b) => a.model.localeCompare(b.model));

  if (!phones.length) { showEmptyState(); return; }

  const wishlist = await getWishlist();
  grid.innerHTML = phones.map((phone, idx) => buildPhoneCard(phone, idx, wishlist)).join('');
  initRevealAnimations();
}

function buildPhoneCard(phone, idx, wishlist = []) {
  const live = phone.liveData;
  const best = live?.bestPrice;
  const displayPrice = best ? best.formatted : (phone.price ? `₹${phone.price.toLocaleString('en-IN')}` : null);
  const rating = phone.rating?.overall || 0;
  const stars = '★'.repeat(Math.floor(rating)) + (rating % 1 ? '½' : '');
  const inWishlist = wishlist.includes(phone.id);
  const imageUrl = phone.image.startsWith('http') 
    ? `/api/image-proxy?url=${encodeURIComponent(phone.image)}` 
    : phone.image;

  const platformCards = live ? Object.entries(live.platforms || {}).map(([name, d]) => {
    const meta = PLATFORM_META[name] || { color:'#888', icon:'🔗' };
    const isBest = best?.platform === name;
    return `<a href="${d.link}" target="_blank" rel="noopener"
      class="platform-card ${isBest ? 'platform-best':''} ${d.isFallback ? 'platform-fallback':''}"
      style="--pcolor:${meta.color}">
      <span class="platform-icon">${meta.icon}</span>
      <span class="platform-name">${name}</span>
      <span class="platform-price">${d.priceFormatted||'Check'}</span>
      ${isBest ? '<span class="best-tag">BEST</span>' : ''}
    </a>`;
  }).join('') : `<div class="no-live-data">Click 🔄 Fetch Prices to see live deals</div>`;

  return `<div class="phone-card reveal" id="card-${phone.id}">
    <div class="card-glow"></div>
    <div class="card-header">
      <div class="card-rank" style="background:linear-gradient(135deg,${phone.badgeColor||'#6c5ce7'},${phone.badgeColor||'#a855f7'})">#${idx+1}</div>
      <span class="card-badge" style="background:${phone.badgeColor||'#6c5ce7'}22;color:${phone.badgeColor||'#a855f7'};border:1px solid ${phone.badgeColor||'#a855f7'}44">${phone.badge||'Pick'}</span>
    </div>
    <div class="card-body">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div class="card-brand">${phone.brand}</div>
        <div style="display:flex; gap: 5px;">
          <button class="icon-btn" onclick="addCardToCompare('${phone.id}')" title="Add to Compare" style="background:none; border:none; color:var(--text-secondary); cursor:pointer; font-size:1.1rem; padding: 4px;">⚖️</button>
          <button class="icon-btn" onclick="sharePhone('${phone.id}', '${phone.model}')" title="Share phone" style="background:none; border:none; color:var(--text-secondary); cursor:pointer; font-size:1.1rem; padding: 4px;">🔗</button>
        </div>
      </div>
      <h3 class="card-name">${phone.model}</h3>
      
      <div class="card-img-container">
        <img src="${imageUrl}" alt="${phone.model} image" loading="lazy" class="card-img" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
      </div>
      
      ${phone.buyVerdict ? `
        <div class="buy-verdict" style="background:${phone.buyVerdict.color}22; border-left: 3px solid ${phone.buyVerdict.color}">
          <strong>${phone.buyVerdict.status}:</strong> ${phone.buyVerdict.reason}
        </div>
      ` : ''}

      ${displayPrice ? `<div class="card-best-price">
        <span class="best-label">Best Price</span>
        <span class="best-value">${displayPrice}</span>
        ${best ? `<span class="best-from">on ${best.platform}</span>` : ''}
      </div>` : '<div class="card-best-price"><span class="best-label">Fetching prices...</span></div>'}
      <div class="platforms-grid">${platformCards}</div>
      <div class="card-rating">
        <span class="stars">${stars}</span>
        <span class="rating-text">${rating} (${(phone.reviews||0).toLocaleString()} reviews)</span>
      </div>
      <div class="software-score" title="Software Cleanliness (Bloatware Score)">
        <span class="sw-label">OS Cleanliness:</span>
        <div class="sw-meter">
          <div class="sw-fill" style="width:${(phone.rating.updates||3)*20}%; background:${getSWColor(phone.brand)}"></div>
        </div>
      </div>
      <div class="pros-cons">
        <div class="pros"><span class="pc-label">✅ Pros</span>${(phone.pros||[]).slice(0,2).map(p=>`<div class="pc-item">${p}</div>`).join('')}</div>
        <div class="cons"><span class="pc-label">❌ Cons</span>${(phone.cons||[]).slice(0,2).map(c=>`<div class="pc-item">${c}</div>`).join('')}</div>
      </div>
      ${phone.verdict ? `<div class="verdict">💬 ${phone.verdict}</div>` : ''}
      <div class="card-metrics">
        <div class="metric-item" title="Gaming Performance">🎮 ${phone.rating?.gaming||'—'}</div>
        <div class="metric-item" title="Heating/Cooling Score">🌡️ ${phone.rating?.heating||'—'}</div>
        <div class="metric-item" title="Repairability Score">🛠️ ${phone.rating?.repair||'—'}</div>
        <div class="metric-item" title="Scam/Seller Trust">🛡️ ${phone.rating?.trust||'—'}</div>
      </div>
      <div class="card-actions">
        <button class="action-btn" onclick="showSpecs('${phone.id}')" title="Full Specs">📋 Specs</button>
        <button class="action-btn ai-btn" onclick="showAIInsights('${phone.id}')" title="AI Expert Insights">🧠 AI Insights</button>
        <button class="action-btn" onclick="showPriceHistory('${phone.id}','${phone.model}')" title="Price History">📈 History</button>
        <button class="action-btn ${inWishlist?'wishlist-active':''}" onclick="toggleWishlist('${phone.id}',this)" title="Wishlist">${inWishlist?'❤️':'🤍'}</button>
        <button class="action-btn" onclick="openAlert('${phone.id}','${phone.model}')" title="Price Alert">🔔 Alert</button>
      </div>
    </div>
  </div>`;
}

function getSWColor(brand) {
  const b = brand.toLowerCase();
  if (b.includes('motorola') || b.includes('google')) return '#00cec9'; // Clean
  if (b.includes('samsung') || b.includes('nothing')) return '#fdcb6e'; // Moderate
  return '#ff6b81'; // Heavy Bloatware
}

async function showAIInsights(id) {
  const phone = allPhones.find(p => p.id === id);
  if (!phone) return;
  
  const modal = document.getElementById('ai-modal');
  const content = document.getElementById('ai-content');
  
  content.innerHTML = '<div class="loading-spinner"></div><p style="text-align:center">AI is analyzing hardware data...</p>';
  modal.style.display = 'flex';
  
  try {
    const res = await fetch(`${API}/api/ai-insights/${id}`);
    const data = await res.json();
    
    if (data.response) {
      content.innerHTML = `<p>${data.response}</p>`;
      return;
    }
    
    content.innerHTML = `
      <div class="ai-dashboard">
        <div class="ai-header">
          <div class="ai-brain-icon">🧠</div>
          <div>
            <h2>AI Expert Insights: ${phone.model}</h2>
            <p>Analyzing ${phone.model} against 5,000+ data points.</p>
          </div>
        </div>
        
        <div class="ai-grid">
          <div class="ai-card">
            <h4>🎮 Gaming (BGMI/PUBG)</h4>
            <div class="ai-value">${data.gaming || 'N/A'}</div>
          </div>
          <div class="ai-card">
            <h4>🔋 Battery Reality</h4>
            <div class="ai-value">${data.battery || 'N/A'}</div>
          </div>
          <div class="ai-card">
            <h4>💰 Resale Value (2 Yrs)</h4>
            <div class="ai-value">${data.resale || 'N/A'}</div>
          </div>
          <div class="ai-card">
            <h4>🛠️ Repair Cost</h4>
            <div class="ai-value">${data.repair || 'N/A'}</div>
          </div>
          <div class="ai-card">
            <h4>📅 Software Life</h4>
            <div class="ai-value">${data.updates || 'N/A'}</div>
          </div>
        </div>

        <div class="ai-verdict-box" style="border-color:#00cec9">
          <h3>AI Final Verdict</h3>
          <p>${data.verdict || 'N/A'}</p>
        </div>
      </div>
    `;
  } catch (error) {
    content.innerHTML = '<p>Error connecting to AI. Please try again later.</p>';
  }
}

function setCategory(cat, btn) {
  currentCategory = cat; currentTag = null;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('phones-title').textContent = 'Best Budget Smartphones';
  document.getElementById('phones-label').textContent = '📡 Live Prices';
  renderPhones();
}

function filterByTag(tag) {
  currentTag = tag; currentCategory = 'all';
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const labels = {
    battery:'🔋 Best Battery Phones',
    camera:'📷 Best Camera Phones',
    gaming:'🎮 Best Gaming Phones',
    display:'🖥️ Best Display Phones',
    students:'🎓 Best for Students',
    'clean-android':'🤖 Clean Android Phones',
    creator: '🤳 Best for Content Creators',
    office: '💼 Best for Office/Work',
    seniors: '👴 Best for Parents/Seniors',
    'gig-worker': '🛵 Best for Gig Workers/Delivery',
    influencer: '🌟 Best for Influencers & Reels',
    rugged: '🔨 Best for Rough & Outdoor Use',
    'night-owl': '🦉 Best for Late Night Scrolling',
    wfh: '💻 Best for Work From Home & Meetings',
    audiophile: '🎧 Best for Music Lovers & Audiophiles',
    privacy: '🔐 Best for Privacy & Security',
    compact: '🤏 Best Compact & Slim Phones',
    geek: '👨‍💻 Best for Custom ROMs & Modding',
    kids: '👶 Best as a Child\'s First Phone'
  };
  document.getElementById('phones-title').textContent = labels[tag] || 'Filtered Phones';
  document.getElementById('phones-label').textContent = '🏷️ Filtered by Use Case';
  renderPhones();
  document.getElementById('phones').scrollIntoView({ behavior:'smooth' });
}

async function refreshPhone(id, btn) {
  btn.classList.add('spinning'); btn.disabled = true;
  try {
    const res = await fetch(`${API}/api/refresh/${id}`, { method:'POST' });
    const updated = await res.json();
    const idx = allPhones.findIndex(p => p.id === id);
    if (idx >= 0) allPhones[idx] = { ...allPhones[idx], liveData: updated };
    renderPhones(); showToast(`✅ Updated!`);
  } catch { showToast('❌ Refresh failed'); }
  btn.classList.remove('spinning'); btn.disabled = false;
}

function renderComparisonTable() {
  const tbody = document.getElementById('comparison-tbody');
  if (!tbody) return;
  const phones = allPhones.filter(p => p.liveData?.bestPrice);
  if (!phones.length) { tbody.innerHTML = '<tr><td colspan="7">Fetch prices to see comparison</td></tr>'; return; }
  tbody.innerHTML = [...phones].sort((a,b) => (a.liveData.bestPrice?.price||99999)-(b.liveData.bestPrice?.price||99999)).map(p => `<tr>
    <td><div class="phone-name-cell">📱 ${p.model}</div></td>
    <td class="highlight-cell">${p.liveData.bestPrice?.formatted||'—'}</td>
    <td>${p.liveData.platforms?.Flipkart?.priceFormatted||'—'}</td>
    <td>${p.liveData.platforms?.Amazon?.priceFormatted||'—'}</td>
    <td>${p.liveData.bestPrice?.platform||'—'}</td>
    <td>${p.category==='under15k'?'Under ₹15K':'Under ₹20K'}</td>
    <td><a href="${p.liveData.bestPrice?.link||'#'}" target="_blank" class="table-buy-btn">Buy →</a></td>
  </tr>`).join('');
}

async function verifyScamLink() {
  const url = document.getElementById('scam-url').value;
  const resultBox = document.getElementById('scam-result');
  if (!url) return showToast('Please enter a URL');
  
  resultBox.style.display = 'block';
  resultBox.innerHTML = '<div class="loading-spinner" style="margin:20px auto"></div>';
  
  try {
    const res = await fetch(`${API}/api/verify-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await res.json();
    
    let color = data.verdict === 'Safe' ? '#00cec9' : (data.verdict === 'SCAM' ? '#ff6b81' : '#fdcb6e');
    resultBox.innerHTML = `
      <div class="scam-result-card" style="border-top: 4px solid ${color}">
        <h3>Verdict: <span style="color:${color}">${data.verdict}</span></h3>
        <p>${data.message}</p>
        <div class="scam-score-bar"><div class="scam-score-fill" style="width:${data.score}%; background:${color}"></div></div>
        <small>Domain analyzed: <strong>${data.domain}</strong></small>
      </div>`;
  } catch (e) {
    resultBox.innerHTML = '<p>Error analyzing link. Please try again.</p>';
  }
}
async function updateDBStatus() {
  try {
    const res = await fetch(`${API}/api/status`);
    const data = await res.json();
    const timeEl = document.getElementById('last-sync-time');
    const dot = document.querySelector('.status-dot');
    if (!timeEl || !dot) return;
    
    if (data.lastFullFetch) {
      const date = new Date(data.lastFullFetch);
      timeEl.textContent = date.toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
    } else {
      timeEl.textContent = 'Never';
    }
    
    if (data.status === 'fetching') {
      dot.classList.add('fetching');
      timeEl.textContent = `Syncing (${data.progress.current}/${data.progress.total})...`;
    } else {
      dot.classList.remove('fetching');
    }
  } catch (e) { console.log('Status error', e); }
}

function toggleChat() {
  const chat = document.getElementById('chatbot');
  const trigger = document.getElementById('chat-trigger');
  if (chat.style.display === 'none') {
    chat.style.display = 'flex';
    trigger.style.display = 'none';
  } else {
    chat.style.display = 'none';
    trigger.style.display = 'flex';
  }
}

async function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const messages = document.getElementById('chat-messages');
  const text = input.value.trim();
  if (!text) return;

  const userMsg = document.createElement('div');
  userMsg.className = 'msg-user';
  userMsg.textContent = text;
  messages.appendChild(userMsg);
  input.value = '';
  messages.scrollTop = messages.scrollHeight;

  const typingMsg = document.createElement('div');
  typingMsg.className = 'msg-bot';
  typingMsg.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
  messages.appendChild(typingMsg);
  messages.scrollTop = messages.scrollHeight;

  try {
    const res = await fetch(`${API}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    
    messages.removeChild(typingMsg);
    const botMsg = document.createElement('div');
    botMsg.className = 'msg-bot';
    botMsg.innerHTML = data.response || "Sorry, I couldn't understand that.";
    messages.appendChild(botMsg);
    messages.scrollTop = messages.scrollHeight;
  } catch (error) {
    messages.removeChild(typingMsg);
    const botMsg = document.createElement('div');
    botMsg.className = 'msg-bot';
    botMsg.innerHTML = "Error connecting to AI. Please try again later.";
    messages.appendChild(botMsg);
    messages.scrollTop = messages.scrollHeight;
  }
}
