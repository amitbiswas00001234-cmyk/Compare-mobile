// ── State ──
const API = '';
let platformMode = 'phones'; // 'phones' or 'laptops'
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

// ── Load Phones / Laptops from API ──
async function loadPhones() {
  showLoading(true);
  try {
    const url = platformMode === 'phones' ? `${API}/api/phones` : `${API}/api/laptops`;
    const res = await fetch(url);
    const data = await res.json();
    allPhones = platformMode === 'phones' ? (data.phones || []) : (data.laptops || []);
    updateLastUpdated(data.lastUpdated);
    renderPhones();
    renderComparisonTable();
  } catch(e) { showEmptyState(); }
  showLoading(false);
}

// ── Set Platform Mode (Phones vs Laptops) ──
async function setPlatformMode(mode) {
  if (platformMode === mode) return;
  platformMode = mode;
  
  const btnPhones = document.getElementById('mode-phones-btn');
  const btnLaptops = document.getElementById('mode-laptops-btn');
  
  if (mode === 'phones') {
    btnPhones.className = 'platform-btn active';
    btnLaptops.className = 'platform-btn inactive';
    
    // Category tabs
    document.querySelector('.category-tabs').innerHTML = `
      <button class="tab-btn active" data-category="all" onclick="setCategory('all',this)">All</button>
      <button class="tab-btn" data-category="under15k" onclick="setCategory('under15k',this)">Under ₹15K</button>
      <button class="tab-btn" data-category="under20k" onclick="setCategory('under20k',this)">Under ₹20K</button>
      <button class="tab-btn" data-category="under30k" onclick="setCategory('under30k',this)">Under ₹30K</button>
      <button class="tab-btn" data-category="under50k" onclick="setCategory('under50k',this)">Under ₹50K</button>
      <button class="tab-btn" data-category="under70k" onclick="setCategory('under70k',this)">Under ₹70K</button>
      <button class="tab-btn" data-category="under1.25l" onclick="setCategory('under1.25l',this)">Flagship</button>
    `;
    
    // Brand dropdown
    document.getElementById('brand-select').innerHTML = `
      <option value="all">All Brands</option>
      <option value="poco">POCO</option>
      <option value="samsung">Samsung</option>
      <option value="motorola">Motorola</option>
      <option value="oneplus">OnePlus</option>
      <option value="redmi">Redmi</option>
      <option value="realme">Realme</option>
      <option value="iqoo">iQOO</option>
      <option value="vivo">Vivo</option>
      <option value="lava">Lava</option>
      <option value="tecno">Tecno</option>
    `;
    
    // Headings
    document.getElementById('phones-title').textContent = 'Best Budget Smartphones';
    document.getElementById('phones-label').textContent = '📡 Live Prices';
    document.getElementById('quiz-title').textContent = 'Which Phone is Right for You?';
    
    const compareTitle = document.getElementById('compare-title');
    if (compareTitle) compareTitle.textContent = 'Compare Phones';
    const compareDesc = document.getElementById('compare-desc');
    if (compareDesc) compareDesc.textContent = 'Select up to 3 phones and compare every spec.';
    
    const upcomingTitle = document.getElementById('upcoming-title');
    if (upcomingTitle) upcomingTitle.textContent = 'Upcoming Budget Phones';
    const upcomingDesc = document.getElementById('upcoming-desc');
    if (upcomingDesc) upcomingDesc.textContent = 'Phones launching in the next few months in India.';
    
    const brandsTitle = document.getElementById('brands-title');
    if (brandsTitle) brandsTitle.textContent = 'Which Brand to Trust?';
    const brandsDesc = document.getElementById('brands-desc');
    if (brandsDesc) brandsDesc.textContent = 'Scored on updates, service centers, and value.';
    
  } else {
    btnLaptops.className = 'platform-btn active';
    btnPhones.className = 'platform-btn inactive';
    
    // Category tabs
    document.querySelector('.category-tabs').innerHTML = `
      <button class="tab-btn active" data-category="all" onclick="setCategory('all',this)">All</button>
      <button class="tab-btn" data-category="under30k" onclick="setCategory('under30k',this)">Under ₹30K</button>
      <button class="tab-btn" data-category="under35k" onclick="setCategory('under35k',this)">Under ₹35K</button>
      <button class="tab-btn" data-category="under40k" onclick="setCategory('under40k',this)">Under ₹40K</button>
    `;
    
    // Brand dropdown
    document.getElementById('brand-select').innerHTML = `
      <option value="all">All Brands</option>
      <option value="lenovo">Lenovo</option>
      <option value="hp">HP</option>
      <option value="asus">ASUS</option>
      <option value="acer">Acer</option>
      <option value="xiaomi">Xiaomi</option>
      <option value="msi">MSI</option>
    `;
    
    // Headings
    document.getElementById('phones-title').textContent = 'Best Budget Laptops';
    document.getElementById('phones-label').textContent = '📡 Live Prices';
    document.getElementById('quiz-title').textContent = 'Which Laptop is Right for You?';
    
    const compareTitle = document.getElementById('compare-title');
    if (compareTitle) compareTitle.textContent = 'Compare Laptops';
    const compareDesc = document.getElementById('compare-desc');
    if (compareDesc) compareDesc.textContent = 'Select up to 3 laptops and compare every spec.';
    
    const upcomingTitle = document.getElementById('upcoming-title');
    if (upcomingTitle) upcomingTitle.textContent = 'Upcoming Budget Laptops';
    const upcomingDesc = document.getElementById('upcoming-desc');
    if (upcomingDesc) upcomingDesc.textContent = 'Laptops launching in the next few months in India.';
    
    const brandsTitle = document.getElementById('brands-title');
    if (brandsTitle) brandsTitle.textContent = 'Which Laptop Brand to Trust?';
    const brandsDesc = document.getElementById('brands-desc');
    if (brandsDesc) brandsDesc.textContent = 'Scored on driver support, build quality, and value.';
  }
  
  currentCategory = 'all';
  currentBrand = 'all';
  currentTag = null;
  compareSlots = [null, null, null];
  renderComparatorSlots();
  document.getElementById('comparator-table').innerHTML = '';
  
  await loadPhones();
  loadOffers();
  loadUpcoming();
  loadBrands();
  renderQuizSteps();
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

  let vfmScore = 50;
  const priceToUse = best?.price || phone.price;
  if (priceToUse && phone.rating) {
    const specsSum = platformMode === 'phones'
      ? ((phone.rating.display || 4) + (phone.rating.battery || 4) + (phone.rating.camera || 4) + (phone.rating.gaming || 4))
      : ((phone.rating.display || 4) + (phone.rating.battery || 4) + (phone.rating.performance || 4) + (phone.rating.gaming || 4));
    vfmScore = Math.min(99, Math.max(45, Math.round((specsSum / priceToUse) * 45000)));
  }

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

  const swLabel = platformMode === 'phones' ? 'OS Cleanliness:' : 'Build Quality:';
  const swFillWidth = platformMode === 'phones'
    ? ((phone.rating?.updates || 3) * 20)
    : ((phone.rating?.trust || 4) * 20);
  const swFillColor = platformMode === 'phones' ? getSWColor(phone.brand) : '#a855f7';

  const metricsHTML = platformMode === 'phones' ? `
    <div class="metric-item" title="Gaming Performance">🎮 ${phone.rating?.gaming||'—'}</div>
    <div class="metric-item" title="Heating Score">🌡️ ${phone.rating?.heating||'—'}</div>
    <div class="metric-item" title="Repairability Score">🛠️ ${phone.rating?.repair||'—'}</div>
    <div class="metric-item" title="Seller Trust">🛡️ ${phone.rating?.trust||'—'}</div>
  ` : `
    <div class="metric-item" title="Performance Speed">⚡ ${phone.rating?.performance||'—'}</div>
    <div class="metric-item" title="Display Quality">🖥️ ${phone.rating?.display||'—'}</div>
    <div class="metric-item" title="Battery Life">🔋 ${phone.rating?.battery||'—'}</div>
    <div class="metric-item" title="Brand Trust">🛡️ ${phone.rating?.trust||'—'}</div>
  `;

  return `<div class="phone-card reveal" id="card-${phone.id}">
    <div class="card-glow"></div>
    <div class="card-header">
      <div class="card-rank" style="background:linear-gradient(135deg,${phone.badgeColor||'#6c5ce7'},${phone.badgeColor||'#a855f7'})">#${idx+1}</div>
      <div style="display:flex; flex-direction:column; gap:6px; align-items:flex-end;">
        <span class="card-badge" style="background:${phone.badgeColor||'#6c5ce7'}22;color:${phone.badgeColor||'#a855f7'};border:1px solid ${phone.badgeColor||'#a855f7'}44">${phone.badge||'Pick'}</span>
        <span class="vfm-badge" style="background:${vfmScore >= 80 ? 'linear-gradient(135deg,#ff7675,#d63031)' : 'linear-gradient(135deg,#a855f7,#6c5ce7)'}">🔥 VFM: ${vfmScore}/100</span>
      </div>
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
      <div class="software-score" title="${swLabel}">
        <span class="sw-label">${swLabel}</span>
        <div class="sw-meter">
          <div class="sw-fill" style="width:${swFillWidth}%; background:${swFillColor}"></div>
        </div>
      </div>
      <div class="pros-cons">
        <div class="pros"><span class="pc-label">✅ Pros</span>${(phone.pros||[]).slice(0,2).map(p=>`<div class="pc-item">${p}</div>`).join('')}</div>
        <div class="cons"><span class="pc-label">❌ Cons</span>${(phone.cons||[]).slice(0,2).map(c=>`<div class="pc-item">${c}</div>`).join('')}</div>
      </div>
      ${phone.verdict ? `<div class="verdict">💬 ${phone.verdict}</div>` : ''}
      <div class="card-metrics">
        ${metricsHTML}
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
  document.getElementById('phones-title').textContent = platformMode === 'phones' ? 'Best Budget Smartphones' : 'Best Budget Laptops';
  document.getElementById('phones-label').textContent = '📡 Live Prices';
  renderPhones();
}

function filterByTag(tag) {
  currentTag = tag; currentCategory = 'all';
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const labels = platformMode === 'phones' ? {
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
  } : {
    performance: '⚡ Best Performance Laptops',
    display: '🖥️ High sRGB Display Laptops',
    battery: '🔋 Long Battery Laptops',
    students: '🎓 Best for College Students',
    office: '💼 Best for WFH/Office Work',
    gaming: '🎮 Best Gaming & Graphics Laptops'
  };
  document.getElementById('phones-title').textContent = labels[tag] || (platformMode === 'phones' ? 'Filtered Phones' : 'Filtered Laptops');
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
    
    let htmlContent = `<div class="msg-text">${data.response || "Sorry, I couldn't understand that."}</div>`;
    
    if (data.matchedPhones && data.matchedPhones.length > 0) {
      htmlContent += `
        <div class="chat-carousel" style="display:flex; gap:10px; overflow-x:auto; padding:10px 0 5px 0; margin-top:8px; scrollbar-width:thin;">
          ${data.matchedPhones.map(phone => {
            const best = phone.liveData?.bestPrice;
            const priceFormatted = best ? best.formatted : (phone.price ? `₹${phone.price.toLocaleString('en-IN')}` : 'Check Price');
            return `
              <div class="chat-phone-card" style="background:rgba(255,255,255,0.03); border:1px solid var(--border-color); border-radius:8px; padding:10px; min-width:160px; max-width:160px; flex-shrink:0; text-align:left; transition:var(--transition); box-shadow:0 2px 6px rgba(0,0,0,0.15);">
                <div style="font-size:0.75rem; font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${phone.model}</div>
                <div style="font-size:0.8rem; font-weight:700; color:#00cec9; margin:4px 0;">${priceFormatted}</div>
                <div style="font-size:0.68rem; color:var(--text-secondary); line-height:1.2; height:34px; overflow:hidden; margin-bottom:8px;">🔋 ${phone.specs?.battery || 'Big Battery'}<br/>📸 ${phone.specs?.camera || 'Multi Camera'}</div>
                <button class="btn-primary" onclick="showSpecs('${phone.id}'); toggleChat();" style="width:100%; padding:4px 0; font-size:0.7rem; border-radius:4px; height:auto;">View Specs 📋</button>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
    
    botMsg.innerHTML = htmlContent;
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
