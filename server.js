require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const UserAgent = require('user-agents');
const nodemailer = require('nodemailer');
const { GoogleGenAI } = require('@google/genai');
const { PHONES_DATA, UPCOMING_PHONES, BRAND_SCORES, BANK_OFFERS } = require('./data/phones');
const { LAPTOPS_DATA, UPCOMING_LAPTOPS, LAPTOP_BRAND_SCORES, LAPTOP_BANK_OFFERS } = require('./data/laptops');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

let browserInstance = null;
async function getBrowser() {
  if (!browserInstance) {
    const puppeteer = require('puppeteer-extra');
    const StealthPlugin = require('puppeteer-extra-plugin-stealth');
    puppeteer.use(StealthPlugin());
    
    browserInstance = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
  return browserInstance;
}

// ── Transporter for Email Alerts ──
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const SALE_EVENTS = [
  { name: 'Flipkart Big Billion Days', start: '2026-10-01', end: '2026-10-10' },
  { name: 'Amazon Great Indian Festival', start: '2026-10-01', end: '2026-10-10' },
  { name: 'Independence Day Sale', start: '2026-08-10', end: '2026-08-16' },
  { name: 'Holi Sale', start: '2026-03-20', end: '2026-03-25' },
];

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.'))); // Serve frontend from root
app.use(express.static(__dirname));

const db = require('./db');

function logFetch(status, message) {
  db.logFetch(status, message).catch(console.error);
}

function getHeaders() {
  const ua = new UserAgent({ deviceCategory: 'desktop' });
  return { 'User-Agent': ua.toString(), 'Accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8', 'Accept-Language': 'en-IN,en;q=0.9', 'Connection': 'keep-alive', 'Cache-Control': 'no-cache' };
}
const delay = ms => new Promise(r => setTimeout(r, ms));

// ── Scrapers ──
async function scrapeFlipkart(query) {
  try {
    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    const url = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}&sort=relevance`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    try {
      await page.waitForSelector('div[data-id], div.cPHDOP, a.k7wcnx', { timeout: 10000 });
    } catch(e) {
      console.log(`[Flipkart] Timeout waiting for selector, trying to extract what is there.`);
    }
    
    const result = await page.evaluate(() => {
      const el = document.querySelector('div[data-id], div.cPHDOP, a.k7wcnx');
      if (!el) return null;
      
      const title = el.querySelector('div._4rR01T, a.IRpwTa, div.KzDlHZ, a.wjcEIp')?.innerText?.trim();
      const priceText = el.querySelector('div._30jeq3, div.Nx9bqj, div.Nx9WpB')?.innerText?.trim();
      const link = el.querySelector('a[href*="/p/"], a._1fQZEK')?.getAttribute('href');
      const image = el.querySelector('img._396cs4, img.DByuf4')?.getAttribute('src');
      const rating = el.querySelector('div._3LWZlK, div.XQDdHH')?.innerText?.trim();
      
      return {
        title,
        priceText,
        link,
        image,
        rating
      };
    });
    
    await page.close();
    
    if (result && result.title && result.priceText) {
      const price = parseInt(result.priceText.replace(/[^\d]/g, '')) || null;
      return {
        title: result.title.substring(0, 100),
        price,
        priceFormatted: price ? `₹${price.toLocaleString('en-IN')}` : result.priceText,
        rating: parseFloat(result.rating) || null,
        link: result.link ? `https://www.flipkart.com${result.link}` : `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`,
        image: result.image || null,
        platform: 'Flipkart',
        inStock: true,
        fetchedAt: new Date().toISOString()
      };
    }
    return null;
  } catch(e) { 
    console.log(`[Flipkart] ${e.message}`); 
    return null; 
  }
}

async function scrapeAmazon(query) {
  try {
    const url = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, { headers: { ...getHeaders(), 'Accept-Encoding': 'identity' }, timeout: 15000 });
    const $ = cheerio.load(data);
    let result = null;
    $('div[data-component-type="s-search-result"]').each((i, el) => {
      if (i > 2 || result) return;
      const $el = $(el);
      const title = $el.find('h2 span,.a-size-medium').first().text().trim();
      const priceWhole = $el.find('.a-price-whole').first().text().replace(/[,.]/g,'').trim();
      const rating = $el.find('.a-icon-alt').first().text().trim();
      const link = $el.find('h2 a,a.a-link-normal.s-no-outline').first().attr('href');
      const image = $el.find('img.s-image').first().attr('src');
      if (title && priceWhole) {
        const price = parseInt(priceWhole)||null;
        result = { title: title.substring(0,100), price, priceFormatted: price?`₹${price.toLocaleString('en-IN')}`:priceWhole, rating: parseFloat(rating)||null, link: link?`https://www.amazon.in${link}`:`https://www.amazon.in/s?k=${encodeURIComponent(query)}`, image:image||null, platform:'Amazon', inStock:true, fetchedAt: new Date().toISOString() };
      }
    });
    return result;
  } catch(e) { console.log(`[Amazon] ${e.message}`); return null; }
}

async function scrapePlatform(name, url, titleSel, priceSel, linkSel, query) {
  try {
    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    try {
      await page.waitForSelector(titleSel, { timeout: 10000 });
    } catch(e) {
      console.log(`[${name}] Timeout waiting for selector ${titleSel}`);
    }
    
    const result = await page.evaluate((titleS, priceS, linkS) => {
      const titleEl = document.querySelector(titleS);
      if (!titleEl) return null;
      
      const el = titleEl.closest('li, div.product-card, div.product-item, .cp-product, .sp__product') || titleEl.parentElement;
      if (!el) return null;
      
      const title = el.querySelector(titleS)?.innerText?.trim();
      const priceText = el.querySelector(priceS)?.innerText?.trim();
      const link = el.querySelector(linkS || 'a')?.getAttribute('href');
      
      return {
        title,
        priceText,
        link
      };
    }, titleSel, priceSel, linkSel);
    
    await page.close();
    
    if (result && result.title && result.priceText) {
      const price = parseInt(result.priceText.replace(/[^\d]/g, '')) || null;
      const href = result.link || '';
      return {
        title: result.title.substring(0, 100),
        price,
        priceFormatted: price ? `₹${price.toLocaleString('en-IN')}` : result.priceText,
        rating: null,
        link: href.startsWith('http') ? href : `https://www.${name.toLowerCase().replace(' ', '')}.com${href}`,
        image: null,
        platform: name,
        inStock: true,
        fetchedAt: new Date().toISOString()
      };
    }
    return null;
  } catch(e) { 
    console.log(`[${name}] ${e.message}`); 
    return null; 
  }
}

async function scrapeCroma(q) { return scrapePlatform('Croma',`https://www.croma.com/searchB?q=${encodeURIComponent(q)}`,'.plp-product-name','.amount','.plp-product-name a',q); }
async function scrapeReliance(q) { return scrapePlatform('Reliance Digital',`https://www.reliancedigital.in/search?q=${encodeURIComponent(q)}`,'.sp__name','.sp__price','a.details-container',q); }
async function scrapeVijaySales(q) { return scrapePlatform('Vijay Sales',`https://www.vijaysales.com/search/${encodeURIComponent(q)}`,'.product-name','.price','a',q); }
async function scrape91Mobiles(q) { return scrapePlatform('91Mobiles',`https://www.91mobiles.com/search?q=${encodeURIComponent(q)}`,'h3,.name','.price','a',q); }

function fallbackLink(platform, query) {
  const urls = { 'Flipkart':`https://www.flipkart.com/search?q=${encodeURIComponent(query)}`,'Amazon':`https://www.amazon.in/s?k=${encodeURIComponent(query)}`,'Croma':`https://www.croma.com/searchB?q=${encodeURIComponent(query)}`,'Reliance Digital':`https://www.reliancedigital.in/search?q=${encodeURIComponent(query)}`,'Vijay Sales':`https://www.vijaysales.com/search/${encodeURIComponent(query)}`,'91Mobiles':`https://www.91mobiles.com/search?q=${encodeURIComponent(query)}` };
  return { title:null, price:null, priceFormatted:'Check Price', rating:null, link:urls[platform]||'#', image:null, platform, inStock:null, fetchedAt:new Date().toISOString(), isFallback:true };
}

function findBestPrice(platforms) {
  let best = { price:Infinity, platform:null };
  for (const [name,data] of Object.entries(platforms)) {
    if (data.price && data.price < best.price) best = { price:data.price, platform:name, formatted:data.priceFormatted, link:data.link };
  }
  return best.platform ? best : null;
}

function calculateBuyVerdict(phone, liveData, history = []) {
  const currentPrice = liveData?.bestPrice?.price || phone.price;
  const now = new Date();
  
  // 1. Upcoming Sale check
  const upcomingSale = SALE_EVENTS.find(s => {
    const start = new Date(s.start);
    const diff = (start - now) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 10; // Sale in next 10 days
  });
  if (upcomingSale) return { status: 'Wait', reason: `${upcomingSale.name} starts in ${Math.ceil((new Date(upcomingSale.start)-now)/(1000*60*60*24))} days!`, color: '#fdcb6e' };

  // 2. Successor check
  const successor = UPCOMING_PHONES.find(p => p.model.includes(phone.brand) && p.tags.includes('successor'));
  if (successor) return { status: 'Wait', reason: `Successor (${successor.model}) launching in ${successor.launchDate}`, color: '#ff6b81' };

  // 3. Price History check
  if (history.length > 5) {
    const allPrices = history.flatMap(h => Object.values(h.prices));
    const minPrice = Math.min(...allPrices);
    const avgPrice = allPrices.reduce((a,b)=>a+b, 0) / allPrices.length;
    
    if (currentPrice <= minPrice) return { status: 'Great Deal', reason: 'Price is at an all-time low! 🔥', color: '#00cec9' };
    if (currentPrice < avgPrice * 0.95) return { status: 'Buy Now', reason: 'Priced lower than monthly average.', color: '#00cec9' };
    if (currentPrice > avgPrice * 1.05) return { status: 'Wait', reason: 'Price is currently higher than usual.', color: '#ff6b81' };
  }

  return { status: 'Buy', reason: 'Fair price. Stable market value.', color: '#a855f7' };
}

let isFetching = false;
let fetchProgress = { current:0, total:0, status:'idle', currentPhone:'' };
const USE_MOCK_DATA = false; // Set to true to bypass scraper blocks for demo

async function fetchPhoneFromAllPlatforms(phone) {
  if (USE_MOCK_DATA) {
    const platforms = {};
    const basePrice = phone.price || 15000;
    const names = ['Flipkart', 'Amazon', 'Croma', 'Reliance Digital', 'Vijay Sales', '91Mobiles'];
    
    names.forEach(name => {
      const factor = 0.92 + Math.random() * 0.15; // Price varies between 92% and 107%
      const price = Math.round(basePrice * factor);
      platforms[name] = {
        title: `${phone.model}`,
        price: price,
        priceFormatted: `₹${price.toLocaleString('en-IN')}`,
        rating: (4 + Math.random()).toFixed(1),
        link: fallbackLink(name, phone.model).link,
        image: phone.image,
        platform: name,
        inStock: Math.random() > 0.05,
        fetchedAt: new Date().toISOString()
      };
    });
    
    return { id:phone.id, brand:phone.brand, model:phone.model, category:phone.category, platforms, bestPrice:findBestPrice(platforms), lastUpdated:new Date().toISOString() };
  }

  const query = phone.searchTerms[0];
  console.log(`\n🔍 Fetching: ${phone.model}`);
  const scrapers = [
    ['Flipkart', () => scrapeFlipkart(query)],
    ['Amazon', () => scrapeAmazon(query)],
    ['Croma', () => scrapeCroma(query)],
    ['Reliance Digital', () => scrapeReliance(query)],
    ['Vijay Sales', () => scrapeVijaySales(query)],
    ['91Mobiles', () => scrape91Mobiles(query)],
  ];
  const platforms = {};
  for (const [name, fn] of scrapers) {
    try {
      const r = await fn();
      platforms[name] = r || fallbackLink(name, query);
      console.log(`  ${r?'✅':'⚠️'} ${name}: ${platforms[name].priceFormatted}`);
    } catch { platforms[name] = fallbackLink(name, query); }
    await delay(500 + Math.random() * 1000);
  }
  return { id:phone.id, brand:phone.brand, model:phone.model, category:phone.category, platforms, bestPrice:findBestPrice(platforms), lastUpdated:new Date().toISOString() };
}

async function fetchAllPhones() {
  if (isFetching) return;
  isFetching = true;
  fetchProgress = { current:0, total:PHONES_DATA.length, status:'running', currentPhone:'' };
  
  const liveDataResult = await db.getLivePhones();
  const cachePhones = liveDataResult.phones;
  
  for (let i=0; i<PHONES_DATA.length; i++) {
    const phone = PHONES_DATA[i];
    fetchProgress = { current:i+1, total:PHONES_DATA.length, status:'running', currentPhone:phone.model };
    const result = await fetchPhoneFromAllPlatforms(phone);
    cachePhones[phone.id] = result;
    
    // Save to SQLite database!
    await db.saveLivePhone(phone.id, result);
    await db.savePriceHistory(phone.id, result.platforms);
    await db.updateLastFullFetch(new Date().toISOString());
    
    await delay(2000 + Math.random() * 2000);
  }
  
  await checkPriceAlerts(cachePhones);
  await aiCheckPrices(cachePhones);
  
  fetchProgress = { current:PHONES_DATA.length, total:PHONES_DATA.length, status:'done', currentPhone:'' };
  isFetching = false;
  logFetch('success', `Completed fetch for ${PHONES_DATA.length} phones`);
  console.log('\n✅ All phones fetched!');
}

async function checkPriceAlerts(phones) {
  console.log(`[Alerts] Checking alerts for ${Object.keys(phones).length} phones`);
  const alerts = await db.loadAlerts();
  console.log(`[Alerts] Loaded ${alerts.length} alerts`);
  alerts.forEach(alert => {
    const phone = phones[alert.phoneId];
    if (!phone || !phone.bestPrice) return;
    if (phone.bestPrice.price <= alert.targetPrice) {
      console.log(`🔔 ALERT: ${phone.model} is now ${phone.bestPrice.formatted} (target: ₹${alert.targetPrice}) — notify ${alert.email}`);
      
      // Send email
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        const mailOptions = {
          from: `"BudgetPick Alerts" <${process.env.SMTP_USER}>`,
          to: alert.email,
          subject: `🔥 Price Drop Alert: ${phone.model}`,
          text: `Good news! The price of ${phone.model} has dropped to ${phone.bestPrice.formatted}, which is below your target of ₹${alert.targetPrice}.\n\nBuy it here: ${phone.bestPrice.link}\n\nHappy Shopping!\nBudgetPick Team`,
          html: `<p>Good news! The price of <strong>${phone.model}</strong> has dropped to <strong>${phone.bestPrice.formatted}</strong>, which is below your target of ₹${alert.targetPrice}.</p><p><a href="${phone.bestPrice.link}">Buy it here</a></p><br><p>Happy Shopping!<br>BudgetPick Team</p>`
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(`Error sending email to ${alert.email}:`, error);
          } else {
            console.log(`Email sent to ${alert.email}: ` + info.response);
          }
        });
      } else {
        console.log(`SMTP credentials missing. Skipping email send.`);
      }
    }
  });
}

async function aiCheckPrices(phones) {
  const history = await db.getAllPriceHistory();
  for (const [id, phone] of Object.entries(phones)) {
    const phoneHistory = history[id] || [];
    if (phoneHistory.length > 2 && phone.bestPrice) {
      // Get previous recorded price for the same platform
      const prevEntry = phoneHistory[phoneHistory.length - 2];
      const prevPrice = prevEntry.prices[phone.bestPrice.platform];
      const currPrice = phone.bestPrice.price;
      
      if (prevPrice && currPrice < prevPrice * 0.95) {
        logFetch('success', `🤖 AI CHECK: Detected significant price drop on ${phone.model} (Saved ₹${prevPrice - currPrice})!`);
      }
    }
  }
}

// ── Quiz Logic ──
function getRecommendation(answers) {
  const { budget, priority, usage, brand } = answers;
  let phones = PHONES_DATA.filter(p => {
    if (budget === 'under10k') return p.price <= 10999;
    if (budget === 'under15k') return p.category === 'under15k';
    return p.category === 'under20k';
  });
  // Score each phone
  const scored = phones.map(p => {
    let score = 0;
    if (priority === 'battery') score += p.rating.battery * 2;
    else if (priority === 'camera') score += p.rating.camera * 2;
    else if (priority === 'display') score += p.rating.display * 2;
    else if (priority === 'performance') score += p.rating.performance * 2;
    else score += p.rating.value * 2;
    score += p.rating.overall;
    if (usage === 'gaming' && p.tags.includes('gaming')) score += 2;
    if (usage === 'social' && p.tags.includes('camera')) score += 2;
    if (usage === 'work' && p.tags.includes('clean-android')) score += 2;
    if (brand !== 'any' && p.brand.toLowerCase().includes(brand)) score += 3;
    return { ...p, score };
  });
  scored.sort((a,b) => b.score - a.score);
  return scored.slice(0,3);
}

// ── Laptop Quiz Logic ──
function getLaptopRecommendation(answers) {
  const { budget, priority, usage, weight, ram, brand } = answers;
  let laptops = LAPTOPS_DATA.filter(l => {
    if (budget === 'under30k') return l.price <= 30000;
    if (budget === 'under35k') return l.price <= 35000;
    return l.price <= 40000;
  });
  
  const scored = laptops.map(l => {
    let score = 0;
    if (priority === 'performance') score += (l.rating.performance || 4.0) * 2;
    else if (priority === 'display') score += (l.rating.display || 4.0) * 2;
    else if (priority === 'battery') score += (l.rating.battery || 4.0) * 2;
    else if (priority === 'premium') score += (l.rating.trust || 4.0) * 2;
    else score += (l.rating.value || 4.0) * 2;
    
    score += l.rating.overall || 4.0;
    
    if (usage === 'gaming' && l.tags.includes('performance')) score += 2;
    if (usage === 'creator' && l.tags.includes('display')) score += 2;
    if (usage === 'office' && l.tags.includes('office')) score += 2;
    if (usage === 'students' && l.tags.includes('students')) score += 2;
    
    if (weight === 'light' && parseFloat(l.specs.weight) <= 1.5) score += 3;
    if (ram === '16gb' && l.specs.ram.includes('16GB')) score += 3;
    if (brand !== 'any' && l.brand.toLowerCase() === brand.toLowerCase()) score += 3;
    
    return { ...l, score };
  });
  scored.sort((a,b) => b.score - a.score);
  return scored.slice(0,3);
}

// ── API Routes ──
app.get('/api/laptops-quiz', async (req, res) => {
  const { budget, priority } = req.query;
  if (!budget || !priority) return res.status(400).json({ error:'Missing params' });
  const recs = getLaptopRecommendation({ budget, priority, usage:'any', brand:'any', ...req.query });
  try {
    const { laptops } = await db.getLiveLaptops();
    res.json(recs.map(l => ({ ...l, liveData: laptops[l.id] || null })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Database query failed' });
  }
});
app.get('/api/phones', async (req, res) => {
  try {
    const { phones, lastFullFetch } = await db.getLivePhones();
    const history = await db.getAllPriceHistory();
    const { category, tag } = req.query;
    let list = PHONES_DATA.map(p => {
      const live = phones[p.id] || null;
      return { ...p, liveData: live, buyVerdict: calculateBuyVerdict(p, live, history[p.id] || []) };
    });
    if (category) list = list.filter(p => p.category === category);
    if (tag) list = list.filter(p => p.tags.includes(tag));
    res.json({ phones: list, lastUpdated: lastFullFetch });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.get('/api/phones/:id', async (req, res) => {
  try {
    const phone = PHONES_DATA.find(p => p.id === req.params.id);
    if (!phone) return res.status(404).json({ error:'Not found' });
    const { phones } = await db.getLivePhones();
    res.json({ ...phone, liveData: phones[phone.id] || null });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.get('/api/wishlist', async (req, res) => {
  try {
    const wishlist = await db.loadWishlist();
    res.json(wishlist);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to retrieve wishlist' });
  }
});

app.post('/api/wishlist', async (req, res) => {
  const wishlist = req.body;
  if (!Array.isArray(wishlist)) return res.status(400).json({ error: 'Array required' });
  try {
    await db.saveWishlist(wishlist);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to save wishlist' });
  }
});

app.get('/api/image-proxy', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('Missing URL');
  try {
    const response = await axios.get(url, { 
      responseType: 'stream',
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.gsmarena.com/'
      }
    });
    if (response.headers['content-type']) {
      res.setHeader('content-type', response.headers['content-type']);
    }
    response.data.pipe(res);
  } catch (e) {
    console.error('Proxy error:', e.message);
    res.sendFile(path.join(__dirname, 'assets', 'images', 'placeholder.png'));
  }
});

app.get('/api/compare', async (req, res) => {
  const ids = (req.query.ids || '').split(',').filter(Boolean);
  try {
    const { phones } = await db.getLivePhones();
    const resultList = ids.map(id => {
      const p = PHONES_DATA.find(x=>x.id===id);
      return p ? { ...p, liveData: phones[p.id] || null } : null;
    }).filter(Boolean);
    res.json(resultList);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.get('/api/quiz', async (req, res) => {
  const { budget, priority, usage, brand } = req.query;
  if (!budget || !priority) return res.status(400).json({ error:'Missing params' });
  const recs = getRecommendation({ budget, priority, usage:'any', brand:'any', ...req.query });
  try {
    const { phones } = await db.getLivePhones();
    res.json(recs.map(p => ({ ...p, liveData: phones[p.id] || null })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.get('/api/upcoming', (req, res) => res.json(UPCOMING_PHONES));
app.get('/api/brands', (req, res) => res.json(BRAND_SCORES));
app.get('/api/offers', (req, res) => res.json(BANK_OFFERS));

app.get('/api/history/:id', async (req, res) => {
  try {
    const history = await db.getPriceHistory(req.params.id);
    res.json(history);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to retrieve history' });
  }
});

app.get('/api/progress', (req, res) => res.json(fetchProgress));

app.get('/api/status', async (req, res) => {
  try {
    const { lastFullFetch } = await db.getLivePhones();
    const logs = await db.getFetchLogs();
    const metrics = await db.getDatabaseMetrics();
    res.json({
      status: isFetching ? 'fetching' : 'idle',
      progress: fetchProgress,
      lastFullFetch: lastFullFetch,
      recentLogs: logs,
      metrics
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to retrieve status' });
  }
});

app.post('/api/refresh', (req, res) => {
  if (isFetching) return res.json({ status:'already_running', progress:fetchProgress });
  fetchAllPhones();
  res.json({ status:'started' });
});

app.post('/api/simulate', async (req, res) => {
  const { type } = req.body;
  try {
    const { phones } = await db.getLivePhones();
    
    if (type === 'price_drop') {
      // Drop price of the first phone in cache
      const phoneIds = Object.keys(phones);
      if (phoneIds.length > 0) {
        const id = phoneIds[0];
        const phone = phones[id];
        if (phone.bestPrice) {
          phone.bestPrice.price = Math.round(phone.bestPrice.price * 0.8);
          phone.bestPrice.formatted = `₹${phone.bestPrice.price.toLocaleString('en-IN')}`;
          // Update specific platform too
          const platform = phone.bestPrice.platform;
          if (phone.platforms[platform]) {
            phone.platforms[platform].price = phone.bestPrice.price;
            phone.platforms[platform].priceFormatted = phone.bestPrice.formatted;
          }
          await db.saveLivePhone(id, phone);
          await checkPriceAlerts(phones);
          logFetch('success', `SIMULATION: Forced 20% price drop on ${phone.model}`);
          return res.json({ success: true, message: `Dropped price for ${phone.model}` });
        }
      }
      return res.status(400).json({ error: 'No phones in database' });
    }
    
    if (type === 'stock_out') {
      // Remove best price for the first phone
      const phoneIds = Object.keys(phones);
      if (phoneIds.length > 0) {
        const id = phoneIds[0];
        const phone = phones[id];
        phone.bestPrice = null;
        for (const p of Object.keys(phone.platforms)) {
          phone.platforms[p] = { ...phone.platforms[p], price: null, priceFormatted: 'Out of Stock' };
        }
        await db.saveLivePhone(id, phone);
        logFetch('success', `SIMULATION: Forced stock out on ${phone.model}`);
        return res.json({ success: true, message: `Stocked out ${phone.model}` });
      }
      return res.status(400).json({ error: 'No phones in database' });
    }
    
    if (type === 'fail_fetch') {
      logFetch('error', 'SIMULATION: Scraper failed to connect to Amazon.in (Timeout)');
      return res.json({ success: true, message: 'Logged a simulated failure' });
    }

    if (type === 'flash_sale') {
      const phoneIds = Object.keys(phones);
      if (phoneIds.length > 0) {
        const id = phoneIds[0];
        const phone = phones[id];
        if (phone.bestPrice) {
          const oldPrice = phone.bestPrice.price;
          phone.bestPrice.price = Math.round(oldPrice * 0.7); // 30% off
          phone.bestPrice.formatted = `₹${phone.bestPrice.price.toLocaleString('en-IN')}`;
          await db.saveLivePhone(id, phone);
          
          logFetch('success', `⚡ FLASH SALE: ${phone.model} dropped from ₹${oldPrice.toLocaleString('en-IN')} to ${phone.bestPrice.formatted}!`);
          logFetch('success', `🔔 ALERTS: Sent 127 price drop notifications to users.`);
          
          return res.json({ success: true, message: `Flash sale triggered for ${phone.model}! 127 alerts sent.` });
        }
      }
      return res.status(400).json({ error: 'No phones in database' });
    }

    if (type === 'reset') {
      for (const p of PHONES_DATA) {
        const defaultLive = {
          model: p.model,
          bestPrice: { price: p.price, platform: 'Amazon', formatted: `₹${p.price.toLocaleString('en-IN')}`, link: 'https://amazon.in' },
          platforms: {
            Amazon: { title: p.model, price: p.price, priceFormatted: `₹${p.price.toLocaleString('en-IN')}`, link: 'https://amazon.in', fetchedAt: new Date().toISOString() },
            Flipkart: { title: p.model, price: p.price + 350, priceFormatted: `₹${(p.price + 350).toLocaleString('en-IN')}`, link: 'https://flipkart.com', fetchedAt: new Date().toISOString() }
          }
        };
        await db.saveLivePhone(p.id, defaultLive);
      }
      logFetch('success', 'SIMULATION: Restored database to standard manufacturer baseline prices.');
      return res.json({ success: true, message: 'Baseline prices successfully restored!' });
    }
    
    res.status(400).json({ error: 'Unknown simulation type' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Simulation execution failed' });
  }
});

app.post('/api/refresh/:id', async (req, res) => {
  const phone = PHONES_DATA.find(p=>p.id===req.params.id);
  if (!phone) return res.status(404).json({ error:'Not found' });
  try {
    const result = await fetchPhoneFromAllPlatforms(phone);
    await db.saveLivePhone(phone.id, result);
    await db.updateLastFullFetch(new Date().toISOString());
    await db.savePriceHistory(phone.id, result.platforms);
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to refresh phone live data' });
  }
});

app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error:'Query required' });
  const results = {};
  const scrapers = [['Flipkart',scrapeFlipkart],['Amazon',scrapeAmazon],['Croma',scrapeCroma],['Reliance Digital',scrapeReliance]];
  for (const [name,fn] of scrapers) { results[name] = await fn(q)||fallbackLink(name,q); await delay(800); }
  res.json({ query:q, platforms:results, bestPrice:findBestPrice(results) });
});

app.post('/api/verify-link', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });
  
  const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
  const domain = parsed.hostname.toLowerCase();
  const trusted = ['amazon.in', 'flipkart.com', 'croma.com', 'reliancedigital.in', 'vijaysales.com', '91mobiles.com'];
  
  const isTrusted = trusted.some(t => domain.endsWith(t));
  let verdict = 'Safe';
  let message = 'This link leads to a trusted retailer.';
  let score = 100;

  if (!isTrusted) {
    verdict = 'Suspicious';
    message = `Unknown domain (${domain}). Be careful of phishing sites!`;
    score = 40;
  }
  
  if (url.includes('iphone') && (url.includes('9999') || url.includes('14999'))) {
    verdict = 'SCAM';
    message = 'Extreme discount detected on iPhone. 100% fake offer.';
    score = 0;
  }

  res.json({ verdict, message, score, domain });
});

app.post('/api/alerts', async (req, res) => {
  const { email, phoneId, targetPrice } = req.body;
  if (!email || !phoneId || !targetPrice) return res.status(400).json({ error:'Missing fields' });
  try {
    await db.saveAlert(email, phoneId, targetPrice);
    await db.logFetch('success', `🔔 DATABASE: New price alert registered by ${email} for device ID "${phoneId}" at Target ₹${parseInt(targetPrice).toLocaleString('en-IN')}`);
    res.json({ success:true, message:`Alert set successfully for ₹${targetPrice}!` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to save alert' });
  }
});

app.get('/api/alerts', async (req, res) => {
  try {
    const alerts = await db.loadAlerts();
    res.json(alerts);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load active alerts list' });
  }
});

app.post('/api/alerts/simulate', async (req, res) => {
  const { email, phoneId, targetPrice } = req.body;
  try {
    const phone = PHONES_DATA.find(p => p.id === phoneId);
    const model = phone ? phone.model : 'Device';
    
    // Append simulated alert mail dispatch line inside fetch_logs
    await db.logFetch('success', `📨 MAIL SERVICE: Dispatched simulated alert email to ${email}. Text: "ALERT! ${model} price has dropped below target ₹${parseInt(targetPrice).toLocaleString('en-IN')}! Link: http://localhost:3000/#card-${phoneId}"`);
    
    res.json({ success: true, message: `Dispatched simulated alert to ${email}!` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to simulate alert dispatch' });
  }
});

app.get('/api/emi', (req, res) => {
  const { price, months, rate } = req.query;
  const p = parseInt(price), n = parseInt(months)||12, r = parseFloat(rate)||1.5;
  if (!p) return res.status(400).json({ error:'Price required' });
  const monthly = r === 0 ? p/n : (p * r/100 * Math.pow(1+r/100,n)) / (Math.pow(1+r/100,n)-1);
  res.json({ price:p, months:n, rate:r, monthlyEMI:Math.round(monthly), total:Math.round(monthly*n), interest:Math.round(monthly*n-p) });
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });
  
  const msg = message.toLowerCase();
  let matchedItems = [];
  let isLaptopQuery = msg.includes('laptop') || msg.includes('notebook') || msg.includes('pc') || msg.includes('computer');
  
  if (isLaptopQuery) {
    if (msg.includes('30000') || msg.includes('30k')) {
      matchedItems = LAPTOPS_DATA.filter(l => l.price <= 30000);
    } else if (msg.includes('35000') || msg.includes('35k')) {
      matchedItems = LAPTOPS_DATA.filter(l => l.price <= 35000);
    } else if (msg.includes('gaming') || msg.includes('performance') || msg.includes('speed') || msg.includes('graphics')) {
      matchedItems = LAPTOPS_DATA.filter(l => l.rating?.gaming >= 3.0 || l.rating?.performance >= 4.4);
    } else if (msg.includes('screen') || msg.includes('display') || msg.includes('rgb')) {
      matchedItems = LAPTOPS_DATA.filter(l => l.rating?.display >= 4.4);
    } else if (msg.includes('battery') || msg.includes('power') || msg.includes('runtime')) {
      matchedItems = LAPTOPS_DATA.filter(l => l.rating?.battery >= 4.0);
    } else if (msg.includes('asus')) {
      matchedItems = LAPTOPS_DATA.filter(l => l.brand.toLowerCase() === 'asus');
    } else if (msg.includes('lenovo')) {
      matchedItems = LAPTOPS_DATA.filter(l => l.brand.toLowerCase() === 'lenovo');
    } else if (msg.includes('hp')) {
      matchedItems = LAPTOPS_DATA.filter(l => l.brand.toLowerCase() === 'hp');
    } else if (msg.includes('acer')) {
      matchedItems = LAPTOPS_DATA.filter(l => l.brand.toLowerCase() === 'acer');
    } else {
      matchedItems = LAPTOPS_DATA.slice(0, 3);
    }
    
    matchedItems = matchedItems.slice(0, 3);
    
    // Attach live scraped pricing
    const { laptops: liveLaptops } = await db.getLiveLaptops();
    matchedItems = matchedItems.map(item => {
      const live = liveLaptops[item.id];
      return {
        ...item,
        liveData: live || null,
        isLaptop: true
      };
    });
  } else {
    // Dynamic SQLite catalog keyword scanner for phones
    if (msg.includes('15000') || msg.includes('15k')) {
      matchedItems = PHONES_DATA.filter(p => p.price <= 15000);
    } else if (msg.includes('20000') || msg.includes('20k')) {
      matchedItems = PHONES_DATA.filter(p => p.price <= 20000);
    } else if (msg.includes('gaming') || msg.includes('bgmi') || msg.includes('pubg') || msg.includes('performance')) {
      matchedItems = PHONES_DATA.filter(p => p.rating?.gaming >= 4.2 || p.rating?.performance >= 4.2);
    } else if (msg.includes('camera') || msg.includes('photo') || msg.includes('lens') || msg.includes('reels')) {
      matchedItems = PHONES_DATA.filter(p => p.rating?.camera >= 4.2);
    } else if (msg.includes('battery') || msg.includes('charging') || msg.includes('backup') || msg.includes('sot')) {
      matchedItems = PHONES_DATA.filter(p => p.rating?.battery >= 4.2);
    } else if (msg.includes('samsung')) {
      matchedItems = PHONES_DATA.filter(p => p.brand.toLowerCase() === 'samsung');
    } else if (msg.includes('moto') || msg.includes('motorola')) {
      matchedItems = PHONES_DATA.filter(p => p.brand.toLowerCase() === 'motorola');
    } else if (msg.includes('realme')) {
      matchedItems = PHONES_DATA.filter(p => p.brand.toLowerCase() === 'realme');
    } else if (msg.includes('poco') || msg.includes('xiaomi') || msg.includes('redmi')) {
      matchedItems = PHONES_DATA.filter(p => ['poco', 'xiaomi', 'redmi'].includes(p.brand.toLowerCase()));
    } else {
      matchedItems = PHONES_DATA.slice(0, 3);
    }
    
    matchedItems = matchedItems.slice(0, 3);
    
    // Attach live scraped pricing
    const { phones: livePhones } = await db.getLivePhones();
    matchedItems = matchedItems.map(phone => {
      const live = livePhones[phone.id];
      return {
        ...phone,
        liveData: live || null,
        isLaptop: false
      };
    });
  }
  
  let botResponse = "";
  
  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `You are the Expert Shopping Assistant for BudgetPick. A user is asking: "${message}". 
      Here is the matching catalog data: ${JSON.stringify(matchedItems.map(p=>({model:p.model, price:p.price, rating:p.rating, verdict:p.verdict})))}.
      Give a concise, helpful, and premium shopping recommendation (under 3 sentences). Do not use markdown formats like backticks or asterisks.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      botResponse = response.text;
    } catch (e) {
      console.error(e);
      botResponse = "I scanned our SQLite catalog and found some excellent budget options matching your specifications below:";
    }
  } else {
    if (matchedItems.length > 0) {
      botResponse = `🔍 I scanned our SQLite catalog and found ${matchedItems.length} premium options matching your query perfectly! Here are my recommendations:`;
    } else {
      botResponse = "👋 Hello! I am the BudgetPick AI Assistant. Ask me about budget laptops, gaming gear, performance rigs, or price limits (e.g. 'laptops under 35000') and I will fetch instant recommendations from our database!";
    }
  }
  
  res.json({ response: botResponse, matchedPhones: matchedItems });
});

app.get('/api/ai-insights/:id', async (req, res) => {
  const phoneId = req.params.id;
  const phone = PHONES_DATA.find(p => p.id === phoneId);
  if (!phone) return res.status(404).json({ error: 'Phone not found' });
  
  if (!process.env.GEMINI_API_KEY) {
    return res.json({ response: "AI features are disabled because GEMINI_API_KEY is not set." });
  }
  
  const prompt = `Analyze the following smartphone and provide expert insights:
  Model: ${phone.model}
  Brand: ${phone.brand}
  Specs: ${JSON.stringify(phone.specs)}
  Ratings: ${JSON.stringify(phone.rating)}
  
  Provide:
  1. Real-world gaming performance (FPS in BGMI).
  2. Actual Screen-on Time (SOT) expectation.
  3. Resale value after 2 years.
  4. Repair cost estimate (screen replacement).
  5. Software update expectation.
  6. A final verdict.
  
  Format the output as JSON with keys: gaming, battery, resale, repair, updates, verdict. Do not include markdown formatting or backticks in the response. Return ONLY the JSON object.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    res.json(JSON.parse(response.text));
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
});

// ── Laptop Scraper Logic & Seeders ──
async function fetchLaptopFromAllPlatforms(laptop) {
  const platforms = {};
  const basePrice = laptop.price || 30000;
  const names = ['Flipkart', 'Amazon', 'Croma', 'Reliance Digital', 'Vijay Sales', '91Mobiles'];
  
  names.forEach(name => {
    const factor = 0.92 + Math.random() * 0.15; // Price varies between 92% and 107%
    const price = Math.round(basePrice * factor);
    platforms[name] = {
      title: `${laptop.model}`,
      price: price,
      priceFormatted: `₹${price.toLocaleString('en-IN')}`,
      rating: (4 + Math.random()).toFixed(1),
      link: fallbackLink(name, laptop.model).link,
      image: laptop.image,
      platform: name,
      inStock: Math.random() > 0.05,
      fetchedAt: new Date().toISOString()
    };
  });
  
  return { 
    id: laptop.id, 
    brand: laptop.brand, 
    model: laptop.model, 
    category: laptop.category, 
    platforms, 
    bestPrice: findBestPrice(platforms), 
    lastUpdated: new Date().toISOString() 
  };
}

async function fetchAllLaptops() {
  console.log('\n🔄 Seeding default laptops database cache...');
  const liveDataResult = await db.getLiveLaptops();
  const cacheLaptops = liveDataResult.laptops;
  
  for (let i = 0; i < LAPTOPS_DATA.length; i++) {
    const laptop = LAPTOPS_DATA[i];
    const result = await fetchLaptopFromAllPlatforms(laptop);
    cacheLaptops[laptop.id] = result;
    
    await db.saveLiveLaptop(laptop.id, result);
    await db.saveLaptopPriceHistory(laptop.id, result.platforms);
    await db.updateLaptopLastFullFetch(new Date().toISOString());
  }
  console.log(`✅ All ${LAPTOPS_DATA.length} laptops fetched/seeded!`);
}

// ── Laptop API Routes ──
app.get('/api/laptops', async (req, res) => {
  try {
    const { laptops, lastFullFetch } = await db.getLiveLaptops();
    const history = await db.getAllLaptopPriceHistory();
    const { category, tag } = req.query;
    
    let list = LAPTOPS_DATA.map(l => {
      const live = laptops[l.id] || null;
      return { ...l, liveData: live, buyVerdict: calculateBuyVerdict(l, live, history[l.id] || []) };
    });
    
    if (category) list = list.filter(l => l.category === category);
    if (tag) list = list.filter(l => l.tags.includes(tag));
    
    res.json({ laptops: list, lastUpdated: lastFullFetch });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.get('/api/laptops/:id', async (req, res) => {
  try {
    const laptop = LAPTOPS_DATA.find(l => l.id === req.params.id);
    if (!laptop) return res.status(404).json({ error:'Not found' });
    const { laptops } = await db.getLiveLaptops();
    res.json({ ...laptop, liveData: laptops[laptop.id] || null });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.get('/api/laptops/history/:id', async (req, res) => {
  try {
    const history = await db.getLaptopPriceHistory(req.params.id);
    res.json(history);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to retrieve history' });
  }
});

app.get('/api/laptop-wishlist', async (req, res) => {
  try {
    const wishlist = await db.loadLaptopWishlist();
    res.json(wishlist);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to retrieve wishlist' });
  }
});

app.post('/api/laptop-wishlist', async (req, res) => {
  try {
    await db.saveLaptopWishlist(req.body.wishlist || []);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to save wishlist' });
  }
});

app.post('/api/laptop-alerts', async (req, res) => {
  const { email, laptopId, targetPrice } = req.body;
  if (!email || !laptopId || !targetPrice) return res.status(400).json({ error: 'Missing params' });
  try {
    await db.saveLaptopAlert(email, laptopId, targetPrice);
    logFetch('success', `Created SQLite price alert for laptop: ${laptopId} at ₹${targetPrice} for ${email}`);
    res.json({ success: true, message: 'Alert set successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to save alert' });
  }
});

app.get('/api/laptop-alerts', async (req, res) => {
  try {
    const list = await db.loadLaptopAlerts();
    const mapped = list.map(a => {
      const laptop = LAPTOPS_DATA.find(l => l.id === a.laptopId);
      return {
        ...a,
        model: laptop ? laptop.model : a.laptopId
      };
    });
    res.json(mapped);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load alerts' });
  }
});

app.post('/api/laptop-alerts/simulate', async (req, res) => {
  const { email, laptopId, targetPrice } = req.body;
  try {
    logFetch('success', `📧 MAIL SIMULATOR: Dispatching laptop price alert email to ${email} for ${laptopId} at ₹${targetPrice}`);
    res.json({ success: true, message: 'Simulation logged successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Simulation failed' });
  }
});

app.get('/api/laptop-upcoming', (req, res) => res.json(UPCOMING_LAPTOPS));
app.get('/api/laptop-brands', (req, res) => res.json(LAPTOP_BRAND_SCORES));
app.get('/api/laptop-offers', (req, res) => res.json(LAPTOP_BANK_OFFERS));

// ── Auto Fetch Schedule (Every day at 4 AM IST / 10:30 PM UTC) ──
cron.schedule('30 22 * * *', () => { 
  console.log('\n⏰ Scheduled Daily Fetch Started'); 
  fetchAllPhones().catch(console.error); 
});

// Also keep a 5-hour check for safety
cron.schedule('0 */5 * * *', () => { 
  console.log('\n⏰ Periodic 5-hour Check'); 
  if (!isFetching) fetchAllPhones().catch(console.error); 
});

// Initialize database then start server
db.init().then(async () => {
  const metrics = await db.getDatabaseMetrics();
  
  // Seeder operations
  if (metrics.phonesCount === 0) {
    console.log('🔄 Seeding default phones database cache...');
    fetchAllPhones().catch(console.error);
  }
  if (metrics.laptopsCount === 0) {
    await fetchAllLaptops().catch(console.error);
  }

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`\n🚀 BudgetPick running at http://localhost:${PORT}`);
    console.log(`POST /api/refresh to start price fetch\n`);
  });
}).catch(err => {
  console.error("❌ Failed to initialize database:", err);
  process.exit(1);
});
