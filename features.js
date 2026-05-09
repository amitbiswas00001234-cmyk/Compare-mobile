// ── Quiz ──
function openQuiz() { document.getElementById('quiz-section').scrollIntoView({ behavior:'smooth' }); }

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
    const res = await fetch(`${API}/api/quiz?${params}`);
    const phones = await res.json();
    const wishlist = await getWishlist();
    resultsEl.innerHTML = `
      <div class="quiz-results-header"><h3>🎯 Your Top Matches</h3><button class="btn-outline btn-sm" onclick="resetQuiz()">Retake Quiz</button></div>
      <div class="phones-grid">${phones.map((p,i) => buildPhoneCard(p, i, wishlist)).join('')}</div>`;
    initRevealAnimations();
  } catch {
    resultsEl.innerHTML = `<p>Error getting recommendations. <button onclick="resetQuiz()">Try again</button></p>`;
  }
}

function resetQuiz() {
  quizAnswers = {}; quizCurrentStep = 1;
  document.getElementById('quiz-card').style.display = 'block';
  document.getElementById('quiz-results').style.display = 'none';
  document.querySelectorAll('.quiz-step').forEach((s,i) => s.classList.toggle('active', i === 0));
  document.querySelectorAll('.quiz-opt').forEach(b => b.classList.remove('selected'));
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

  const rows = [
    ['Brand', p => p.brand],
    ['Price', p => p.price ? '₹'+p.price.toLocaleString('en-IN') : '—'],
    ['Display', p => p.specs?.display || '—'],
    ['Processor', p => p.specs?.processor || '—'],
    ['Camera', p => p.specs?.camera || '—'],
    ['Battery', p => p.specs?.battery || '—'],
    ['RAM', p => p.specs?.ram || '—'],
    ['Storage', p => p.specs?.storage || '—'],
    ['Charging', p => p.specs?.charging || '—'],
    ['Gaming Score', p => p.rating?.gaming ? p.rating.gaming + '/5' : '—'],
    ['Heating Score', p => p.rating?.heating ? p.rating.heating + '/5 (Higher=Cooler)' : '—'],
    ['Repair Score', p => p.rating?.repair ? p.rating.repair + '/10' : '—'],
    ['Trust Score', p => p.rating?.trust ? p.rating.trust + '/5' : '—'],
    ['NFC', p => p.specs?.nfc ? '✅ Yes' : '❌ No'],
    ['Headphone Jack', p => p.specs?.headphone ? '✅ Yes' : '❌ No'],
    ['Water Resistance', p => p.specs?.waterproof || '—'],
    ['Overall Rating', p => p.rating?.overall ? '⭐ '+p.rating.overall : '—'],
  ];

  el.innerHTML = `<div class="comparator-table-wrap">
    <table class="comparison-table">
      <thead><tr><th>Spec</th>${phones.map(p=>`<th>${p.model}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(([label, fn]) => {
        const vals = phones.map(fn);
        const allNums = vals.map(v => parseFloat(v.replace(/[^0-9.]/g,''))).filter(n => !isNaN(n));
        const best = allNums.length === phones.length ? Math.max(...allNums) : null;
        return `<tr><td class="spec-label">${label}</td>${phones.map((p,i) => {
          const v = vals[i]; const num = parseFloat(v.replace(/[^0-9.]/g,''));
          const isWinner = best && num === best;
          return `<td class="${isWinner?'highlight-cell':''}">${v}</td>`;
        }).join('')}</tr>`;
      }).join('')}</tbody>
    </table>
  </div>`;
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
    const res = await fetch(`${API}/api/offers`);
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

// ── Load Upcoming Phones ──
async function loadUpcoming() {
  try {
    const res = await fetch(`${API}/api/upcoming`);
    const phones = await res.json();
    document.getElementById('upcoming-grid').innerHTML = phones.map(p => `
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
    const res = await fetch(`${API}/api/brands`);
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
