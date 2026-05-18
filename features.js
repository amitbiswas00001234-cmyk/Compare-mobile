// ── Quiz ──
function openQuiz() { document.getElementById('quiz-section').scrollIntoView({ behavior:'smooth' }); }

function renderQuizSteps() {
  const container = document.getElementById('quiz-steps-container');
  if (!container) return;
  
  if (platformMode === 'laptops') {
    container.innerHTML = `
      <div class="quiz-step active" id="step-1">
        <h3>💰 What's your budget?</h3>
        <div class="quiz-options">
          <button class="quiz-opt" onclick="quizAnswer('budget','under30k',this)">Under ₹30,000</button>
          <button class="quiz-opt" onclick="quizAnswer('budget','under35k',this)">₹30K – ₹35K</button>
          <button class="quiz-opt" onclick="quizAnswer('budget','under40k',this)">₹35K – ₹40K</button>
        </div>
      </div>
      <div class="quiz-step" id="step-2">
        <h3>⭐ What matters most?</h3>
        <div class="quiz-options">
          <button class="quiz-opt" onclick="quizAnswer('priority','performance',this)">⚡ Raw CPU Power</button>
          <button class="quiz-opt" onclick="quizAnswer('priority','display',this)">🖥️ 100% sRGB Screen</button>
          <button class="quiz-opt" onclick="quizAnswer('priority','battery',this)">🔋 Long Battery Backup</button>
          <button class="quiz-opt" onclick="quizAnswer('priority','premium',this)">💎 Premium Metal Build</button>
          <button class="quiz-opt" onclick="quizAnswer('priority','value',this)">💸 Best Budget Value</button>
        </div>
      </div>
      <div class="quiz-step" id="step-3">
        <h3>💻 How will you use it?</h3>
        <div class="quiz-options">
          <button class="quiz-opt" onclick="quizAnswer('usage','gaming',this)">👨‍💻 Coding & Development</button>
          <button class="quiz-opt" onclick="quizAnswer('usage','creator',this)">🎨 Digital Design & Art</button>
          <button class="quiz-opt" onclick="quizAnswer('usage','office',this)">💼 Word, Excel & Office</button>
          <button class="quiz-opt" onclick="quizAnswer('usage','students',this)">📚 College & Online Classes</button>
        </div>
      </div>
      <div class="quiz-step" id="step-4">
        <h3>⚖️ Do you need it to be ultra-lightweight?</h3>
        <div class="quiz-options">
          <button class="quiz-opt" onclick="quizAnswer('weight','light',this)">Yes (Under 1.5kg, 14")</button>
          <button class="quiz-opt" onclick="quizAnswer('weight','any',this)">No (15.6" screen is fine)</button>
        </div>
      </div>
      <div class="quiz-step" id="step-5">
        <h3>💾 Is 16GB RAM mandatory?</h3>
        <div class="quiz-options">
          <button class="quiz-opt" onclick="quizAnswer('ram','16gb',this)">Yes, 16GB for heavy multitasking</button>
          <button class="quiz-opt" onclick="quizAnswer('ram','any',this)">8GB is fine (saves money)</button>
        </div>
      </div>
      <div class="quiz-step" id="step-6">
        <h3>🏷️ Any brand preference?</h3>
        <div class="quiz-options">
          <button class="quiz-opt" onclick="quizAnswer('brand','any',this)">No Preference</button>
          <button class="quiz-opt" onclick="quizAnswer('brand','lenovo',this)">Lenovo</button>
          <button class="quiz-opt" onclick="quizAnswer('brand','hp',this)">HP</button>
          <button class="quiz-opt" onclick="quizAnswer('brand','asus',this)">ASUS</button>
          <button class="quiz-opt" onclick="quizAnswer('brand','xiaomi',this)">Xiaomi</button>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="quiz-step active" id="step-1">
        <h3>💰 What's your budget?</h3>
        <div class="quiz-options">
          <button class="quiz-opt" onclick="quizAnswer('budget','under11k',this)">Under ₹11,000</button>
          <button class="quiz-opt" onclick="quizAnswer('budget','under15k',this)">₹11K – ₹15K</button>
          <button class="quiz-opt" onclick="quizAnswer('budget','under20k',this)">₹15K – ₹20K</button>
        </div>
      </div>
      <div class="quiz-step" id="step-2">
        <h3>⭐ What matters most?</h3>
        <div class="quiz-options">
          <button class="quiz-opt" onclick="quizAnswer('priority','battery',this)">🔋 Battery Life</button>
          <button class="quiz-opt" onclick="quizAnswer('priority','camera',this)">📷 Camera Quality</button>
          <button class="quiz-opt" onclick="quizAnswer('priority','display',this)">🖥️ Display Quality</button>
          <button class="quiz-opt" onclick="quizAnswer('priority','performance',this)">⚡ Performance</button>
          <button class="quiz-opt" onclick="quizAnswer('priority','value',this)">💸 Best Value</button>
        </div>
      </div>
      <div class="quiz-step" id="step-3">
        <h3>📱 How will you use it?</h3>
        <div class="quiz-options">
          <button class="quiz-opt" onclick="quizAnswer('usage','gaming',this)">🎮 Gaming</button>
          <button class="quiz-opt" onclick="quizAnswer('usage','social',this)">📸 Photos & Social</button>
          <button class="quiz-opt" onclick="quizAnswer('usage','work',this)">💼 Work & Calls</button>
          <button class="quiz-opt" onclick="quizAnswer('usage','streaming',this)">🎬 Netflix & YouTube</button>
          <button class="quiz-opt" onclick="quizAnswer('usage','all',this)">🌟 All-Round Use</button>
        </div>
      </div>
      <div class="quiz-step" id="step-4">
        <h3>📶 Is 5G mandatory?</h3>
        <div class="quiz-options">
          <button class="quiz-opt" onclick="quizAnswer('network','5g',this)">Yes, 5G is a must</button>
          <button class="quiz-opt" onclick="quizAnswer('network','any',this)">4G is fine (saves money)</button>
        </div>
      </div>
      <div class="quiz-step" id="step-5">
        <h3>🖥️ Do you want an AMOLED screen?</h3>
        <div class="quiz-options">
          <button class="quiz-opt" onclick="quizAnswer('display_type','amoled',this)">Yes (Better colors)</button>
          <button class="quiz-opt" onclick="quizAnswer('display_type','any',this)">No Preference</button>
        </div>
      </div>
      <div class="quiz-step" id="step-6">
        <h3>🏷️ Any brand preference?</h3>
        <div class="quiz-options">
          <button class="quiz-opt" onclick="quizAnswer('brand','any',this)">No Preference</button>
          <button class="quiz-opt" onclick="quizAnswer('brand','samsung',this)">Samsung</button>
          <button class="quiz-opt" onclick="quizAnswer('brand','motorola',this)">Motorola</button>
          <button class="quiz-opt" onclick="quizAnswer('brand','poco',this)">POCO</button>
          <button class="quiz-opt" onclick="quizAnswer('brand','vivo',this)">Vivo</button>
        </div>
      </div>
    `;
  }
}

function quizAnswer(key, value, btn) {
  quizAnswers[key] = value;
  btn.closest('.quiz-options').querySelectorAll('.quiz-opt').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');

  setTimeout(() => {
    if (quizCurrentStep < 6) {
      document.getElementById(`step-${quizCurrentStep}`).classList.remove('active');
      quizCurrentStep++;
      document.getElementById(`step-${quizCurrentStep}`).classList.add('active');
      document.getElementById('quiz-step-label').textContent = `Step ${quizCurrentStep} of 6`;
      document.getElementById('quiz-progress').style.width = (quizCurrentStep / 6 * 100) + '%';
    } else {
      runQuiz();
    }
  }, 350);
}

async function runQuiz() {
  const params = new URLSearchParams(quizAnswers).toString();
  const resultsEl = document.getElementById('quiz-results');
  resultsEl.style.display = 'block';
  resultsEl.innerHTML = '<div class="loading-spinner" style="margin:20px auto"></div>';
  document.getElementById('quiz-card').style.display = 'none';

  try {
    const url = platformMode === 'phones' ? `${API}/api/quiz?${params}` : `${API}/api/laptops-quiz?${params}`;
    const res = await fetch(url);
    const items = await res.json();
    const wishlist = await getWishlist();
    resultsEl.innerHTML = `
      <div class="quiz-results-header"><h3>🎯 Your Top Matches</h3><button class="btn-outline btn-sm" onclick="resetQuiz()">Retake Quiz</button></div>
      <div class="phones-grid">${items.map((p,i) => buildPhoneCard(p, i, wishlist)).join('')}</div>`;
    initRevealAnimations();
  } catch {
    resultsEl.innerHTML = `<p>Error getting recommendations. <button onclick="resetQuiz()">Try again</button></p>`;
  }
}

function resetQuiz() {
  quizAnswers = {}; quizCurrentStep = 1;
  document.getElementById('quiz-card').style.display = 'block';
  document.getElementById('quiz-results').style.display = 'none';
  renderQuizSteps();
  document.getElementById('quiz-progress').style.width = '0';
  document.getElementById('quiz-step-label').textContent = 'Step 1 of 6';
}

// ── Side-by-side Comparator ──
let pickerTargetSlot = 0;

function openPhonePicker(slot) {
  pickerTargetSlot = slot;
  const list = document.getElementById('phone-picker-list');
  list.innerHTML = allPhones.map(p => `
    <button class="picker-item" onclick="addToCompare(${slot},'${p.id}')">
      <strong>${p.model}</strong>
      <span>${p.brand} · ${p.price ? '₹'+p.price.toLocaleString('en-IN') : ''}</span>
    </button>`).join('');
  document.getElementById('phone-picker-modal').style.display = 'flex';
}

function addToCompare(slot, phoneId) {
  compareSlots[slot] = allPhones.find(p => p.id === phoneId);
  document.getElementById('phone-picker-modal').style.display = 'none';
  renderComparatorSlots();
  renderComparatorTable();
}

function addCardToCompare(phoneId) {
  const phone = allPhones.find(p => p.id === phoneId);
  if (!phone) return;
  
  // Check if already added
  if (compareSlots.some(s => s && s.id === phoneId)) {
    return showToast('Already added to compare!');
  }
  
  // Find an empty slot
  const emptySlot = compareSlots.findIndex(s => s === null);
  if (emptySlot !== -1) {
    compareSlots[emptySlot] = phone;
    renderComparatorSlots();
    renderComparatorTable();
    showToast(`⚖️ Added ${phone.model} to compare!`);
  } else {
    showToast('❌ Comparison full! Remove a phone first.');
    document.getElementById('compare-section').scrollIntoView({ behavior:'smooth' });
  }
}

function renderComparatorSlots() {
  for (let i = 0; i < 3; i++) {
    const el = document.getElementById(`slot-${i}`);
    const phone = compareSlots[i];
    el.innerHTML = phone
      ? `<div class="slot-filled"><strong>${phone.model}</strong><span>${phone.brand}</span><button onclick="removeFromCompare(${i})">✕</button></div>`
      : `<button onclick="openPhonePicker(${i})">+ Add Phone</button>`;
  }
  
  // Update Floating Compare Badge
  const filledCount = compareSlots.filter(Boolean).length;
  const floatingBtn = document.getElementById('floating-compare');
  const countEl = document.getElementById('floating-compare-count');
  if (floatingBtn && countEl) {
    countEl.textContent = filledCount;
    floatingBtn.style.display = filledCount >= 1 ? 'block' : 'none';
  }
}

function removeFromCompare(slot) { compareSlots[slot] = null; renderComparatorSlots(); renderComparatorTable(); }

function renderComparatorTable() {
  const phones = compareSlots.filter(Boolean);
  const el = document.getElementById('comparator-table');
  if (phones.length < 2) { el.innerHTML = ''; return; }

  // 1. Define row rules and specs based on active platform mode
  const rows = platformMode === 'laptops' ? [
    ['Brand', p => p.brand, 'text'],
    ['Price', p => p.price ? '₹'+p.price.toLocaleString('en-IN') : '—', 'price-low'],
    ['Display size / Res', p => p.specs?.display || '—', 'text'],
    ['Processor CPU', p => p.specs?.processor || '—', 'text'],
    ['Webcam', p => p.specs?.camera || '—', 'text'],
    ['Battery capacity', p => p.specs?.battery || '—', 'num-high'],
    ['RAM size', p => p.specs?.ram || '—', 'num-high'],
    ['Storage size', p => p.specs?.storage || '—', 'num-high'],
    ['Charging rate', p => p.specs?.charging || '—', 'num-high'],
    ['Weight', p => p.specs?.weight || '—', 'text'],
    ['Display Quality Rating', p => p.rating?.display ? p.rating.display + '/5' : '—', 'rating-high'],
    ['Performance Speed Rating', p => p.rating?.performance ? p.rating.performance + '/5' : '—', 'rating-high'],
    ['Gaming / Graphics Rating', p => p.rating?.gaming ? p.rating.gaming + '/5' : '—', 'rating-high'],
    ['Battery Life Rating', p => p.rating?.battery ? p.rating.battery + '/5' : '—', 'rating-high'],
    ['Brand Trust Rating', p => p.rating?.trust ? p.rating.trust + '/5' : '—', 'rating-high'],
    ['Overall Rating Score', p => p.rating?.overall ? '⭐ '+p.rating.overall : '—', 'rating-high'],
  ] : [
    ['Brand', p => p.brand, 'text'],
    ['Price', p => p.price ? '₹'+p.price.toLocaleString('en-IN') : '—', 'price-low'],
    ['Display', p => p.specs?.display || '—', 'text'],
    ['Processor', p => p.specs?.processor || '—', 'text'],
    ['Camera', p => p.specs?.camera || '—', 'text'],
    ['Battery', p => p.specs?.battery || '—', 'num-high'],
    ['RAM', p => p.specs?.ram || '—', 'num-high'],
    ['Storage', p => p.specs?.storage || '—', 'num-high'],
    ['Charging', p => p.specs?.charging || '—', 'num-high'],
    ['Gaming Score', p => p.rating?.gaming ? p.rating.gaming + '/5' : '—', 'rating-high'],
    ['Heating Score', p => p.rating?.heating ? p.rating.heating + '/5 (Higher=Cooler)' : '—', 'rating-high'],
    ['Repair Score', p => p.rating?.repair ? p.rating.repair + '/10' : '—', 'rating-high'],
    ['Trust Score', p => p.rating?.trust ? p.rating.trust + '/5' : '—', 'rating-high'],
    ['NFC', p => p.specs?.nfc ? '✅ Yes' : '❌ No', 'bool'],
    ['Headphone Jack', p => p.specs?.headphone ? '✅ Yes' : '❌ No', 'bool'],
    ['Water Resistance', p => p.specs?.waterproof || '—', 'text'],
    ['Overall Rating', p => p.rating?.overall ? '⭐ '+p.rating.overall : '—', 'rating-high'],
  ];

  // Initialize H2H scores
  const scoreCard = {};
  phones.forEach(p => { scoreCard[p.id] = 0; });

  const rowsHTML = rows.map(([label, fn, type]) => {
    const vals = phones.map(fn);
    
    // Evaluate winning index dynamically
    let winnerIndex = -1;
    if (type === 'price-low') {
      const prices = phones.map(p => p.price || 99999);
      const minPrice = Math.min(...prices);
      if (prices.some(pr => pr !== minPrice)) {
        winnerIndex = prices.indexOf(minPrice);
      }
    } else if (type === 'num-high') {
      const nums = vals.map(v => {
        const m = v.match(/\d+/);
        return m ? parseInt(m[0]) : 0;
      });
      const maxNum = Math.max(...nums);
      if (maxNum > 0 && nums.some(n => n !== maxNum)) {
        winnerIndex = nums.indexOf(maxNum);
      }
    } else if (type === 'rating-high') {
      const ratings = vals.map(v => parseFloat(v) || 0);
      const maxRating = Math.max(...ratings);
      if (maxRating > 0 && ratings.some(r => r !== maxRating)) {
        winnerIndex = ratings.indexOf(maxRating);
      }
    } else if (type === 'bool') {
      const bools = vals.map(v => v.includes('Yes'));
      if (bools.includes(true) && bools.includes(false)) {
        winnerIndex = bools.indexOf(true);
      }
    }

    if (winnerIndex !== -1) {
      scoreCard[phones[winnerIndex].id] += 1;
    }

    return `<tr>
      <td class="spec-label">${label}</td>
      ${phones.map((p, idx) => {
        const isWinner = idx === winnerIndex;
        return `<td class="${isWinner ? 'highlight-cell' : ''}" style="${isWinner ? 'background:rgba(0, 206, 201, 0.08) !important; color:#00cec9; font-weight:700;' : ''}">${vals[idx]}</td>`;
      }).join('')}
    </tr>`;
  }).join('');

  // Find the overall H2H Spec Winner
  let bestScore = -1;
  let overallWinner = null;
  phones.forEach(p => {
    if (scoreCard[p.id] > bestScore) {
      bestScore = scoreCard[p.id];
      overallWinner = p;
    }
  });

  const h2hHeader = `
    <div class="h2h-winner-card" style="padding:24px; background:rgba(168, 85, 247, 0.06); border:1px solid rgba(168, 85, 247, 0.25); border-radius:12px; margin-bottom:24px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
      <div>
        <span style="font-size:0.75rem; text-transform:uppercase; letter-spacing:1px; color:#a29bfe; font-weight:700;">🏆 Head-to-Head Spec Winner</span>
        <h3 style="margin:6px 0 0 0; color:#fff; font-size:1.4rem;">${overallWinner ? overallWinner.model : 'Comparison'} Wins!</h3>
        <p style="margin:4px 0 0 0; font-size:0.85rem; color:var(--text-secondary);">Calculated across ${rows.length} technical hardware dimensions</p>
      </div>
      <div style="display:flex; gap:20px;">
        ${phones.map(p => `
          <div style="text-align:right; background:rgba(255,255,255,0.02); padding:10px 16px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
            <strong style="color:#fff; font-size:0.95rem;">${p.model}</strong><br/>
            <span style="color:#00cec9; font-size:0.85rem; font-weight:700;">${scoreCard[p.id]} Spec Wins</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  el.innerHTML = `
    ${h2hHeader}
    <div class="comparator-table-wrap">
      <table class="comparison-table">
        <thead><tr><th>Spec Dimension</th>${phones.map(p=>`<th>${p.model}</th>`).join('')}</tr></thead>
        <tbody>${rowsHTML}</tbody>
      </table>
    </div>
  `;
}

// ── EMI Calculator ──
function calcEMI() {
  const price = parseInt(document.getElementById('emi-price').value) || 0;
  const rate = parseFloat(document.getElementById('emi-rate').value) || 0;
  const n = emiTenure;
  let monthly;
  if (rate === 0) { monthly = price / n; }
  else { const r = rate / 100; monthly = (price * r * Math.pow(1+r,n)) / (Math.pow(1+r,n)-1); }
  const total = monthly * n;
  const interest = total - price;
  document.getElementById('emi-monthly').textContent = '₹' + Math.round(monthly).toLocaleString('en-IN');
  document.getElementById('emi-total').textContent = '₹' + Math.round(total).toLocaleString('en-IN');
  document.getElementById('emi-interest').textContent = '₹' + Math.round(interest).toLocaleString('en-IN');
}

function setTenure(months, btn) {
  emiTenure = months;
  document.querySelectorAll('.tenure-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  calcEMI();
}

// ── Load Offers ──
async function loadOffers() {
  try {
    const url = platformMode === 'phones' ? `${API}/api/offers` : `${API}/api/laptop-offers`;
    const res = await fetch(url);
    const offers = await res.json();
    document.getElementById('offers-grid').innerHTML = offers.map(o => `
      <div class="offer-card reveal">
        <div class="offer-icon">${o.icon}</div>
        <div class="offer-body">
          <h4>${o.bank}</h4>
          <p>${o.offer}</p>
          <div class="offer-platforms">${(o.platforms||[]).map(p=>`<span>${p}</span>`).join('')}</div>
        </div>
      </div>`).join('');
    initRevealAnimations();
  } catch(e) { console.log('Offers error',e); }
}

// ── Load Upcoming Phones/Laptops ──
async function loadUpcoming() {
  try {
    const url = platformMode === 'phones' ? `${API}/api/upcoming` : `${API}/api/laptop-upcoming`;
    const res = await fetch(url);
    const items = await res.json();
    document.getElementById('upcoming-grid').innerHTML = items.map(p => `
      <div class="upcoming-card reveal">
        <div class="upcoming-icon">🚀</div>
        <div class="upcoming-body">
          <div class="upcoming-brand">${p.brand}</div>
          <h4>${p.model}</h4>
          <div class="upcoming-details">
            <span class="upcoming-price">${p.expectedPrice}</span>
            <span class="upcoming-date">📅 ${p.launchDate}</span>
          </div>
          <div class="upcoming-tags">${(p.tags||[]).map(t=>`<span class="tag">${t}</span>`).join('')}</div>
        </div>
      </div>`).join('');
    initRevealAnimations();
  } catch(e) { console.log('Upcoming error',e); }
}

// ── Load Brands ──
async function loadBrands() {
  try {
    const url = platformMode === 'phones' ? `${API}/api/brands` : `${API}/api/laptop-brands`;
    const res = await fetch(url);
    const brands = await res.json();
    document.getElementById('brands-grid').innerHTML = brands.map(b => `
      <div class="brand-card reveal">
        <div class="brand-icon">${b.icon}</div>
        <h4>${b.brand}</h4>
        <div class="brand-score">${b.score}<span>/10</span></div>
        <div class="brand-bars">
          <div class="brand-bar"><span>Updates</span><span>${b.updates}</span></div>
          <div class="brand-bar"><span>Service</span><span>${b.service}</span></div>
          <div class="brand-bar"><span>Value</span><span>${b.value}</span></div>
        </div>
      </div>`).join('');
    initRevealAnimations();
  } catch(e) { console.log('Brands error',e); }
}
