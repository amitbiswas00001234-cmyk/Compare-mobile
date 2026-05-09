const PHONES_DATA = [
  {
    id: 'poco-m7-plus', brand: 'POCO', model: 'POCO M7 Plus 5G', category: 'under15k',
    price: 11499, searchTerms: ['POCO M7 Plus 5G'],
    tags: ['battery', 'value', 'gaming', 'students', 'seniors'],
    image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-m7-plus.jpg',
    specs: {
      display: '6.9" LCD 120Hz', processor: 'Snapdragon 6s Gen 3',
      camera: '50MP AI', battery: '7000mAh', ram: '6GB', storage: '128GB',
      charging: '33W', os: 'Android 14', weight: '204g', thickness: '8.3mm',
      network: '5G', nfc: false, headphone: true, waterproof: 'IP52'
    },
    rating: {
      overall: 4.4, display: 4.0, camera: 4.0, battery: 4.9, performance: 4.3, value: 4.8,
      gaming: 4.1, heating: 4.5, repair: 4.2, trust: 4.4, camera_day: 4.0, camera_night: 3.5,
      selfie: 3.8, stabilization: 3.5, updates: 3.0, resale: 4.0
    },
    pros: ['Massive 7000mAh battery', 'Snapdragon 6s Gen 3 performance', 'Large 6.9" display', 'Affordable 5G'],
    cons: ['LCD panel (not AMOLED)', 'Heavy at 204g', 'No OIS on camera'],
    verdict: 'The undisputed battery king under ₹12K. Perfect for heavy users who hate charging daily.',
    badge: 'Battery King', badgeColor: '#fdcb6e',
    reviews: 12800, launchYear: 2025,
    offers: ['10% off with HDFC Credit Card', '₹500 off with exchange on Flipkart'],
    emi: { months6: 1983, months12: 1042 }
  },
  {
    id: 'lava-play-ultra', brand: 'Lava', model: 'Lava Play Ultra', category: 'under15k',
    price: 12999, searchTerms: ['Lava Play Ultra'],
    tags: ['camera', 'display', 'value', 'creator'],
    image: 'https://fdn2.gsmarena.com/vv/bigpic/lava-blaze-curve.jpg',
    specs: {
      display: '6.67" AMOLED 120Hz', processor: 'Dimensity 7300',
      camera: '64MP OIS', battery: '5000mAh', ram: '8GB', storage: '128GB',
      charging: '33W', os: 'Android 14', weight: '185g', thickness: '7.9mm',
      network: '5G', nfc: true, headphone: true, waterproof: 'IP54'
    },
    rating: {
      overall: 4.3, display: 4.5, camera: 4.6, battery: 4.1, performance: 4.2, value: 4.5,
      gaming: 3.9, heating: 4.2, repair: 3.5, trust: 3.8, camera_day: 4.7, camera_night: 4.2,
      selfie: 4.5, stabilization: 4.3, updates: 2.5, resale: 3.5
    },
    pros: ['64MP OIS camera is class-leading', 'AMOLED display under ₹13K', '8GB RAM', 'NFC support'],
    cons: ['Lava software updates uncertain', 'Average battery life', 'Brand value lower than Samsung/Moto'],
    verdict: 'Best camera phone under ₹13K. The 64MP OIS sensor competes with phones twice its price.',
    badge: 'Camera Pick', badgeColor: '#ff6b81',
    reviews: 8500, launchYear: 2025,
    offers: ['No-cost EMI on Amazon', 'Free screen protector'],
    emi: { months6: 2250, months12: 1183 }
  },
  {
    id: 'moto-g45', brand: 'Motorola', model: 'Moto G45 5G', category: 'under15k',
    price: 10999, searchTerms: ['Motorola Moto G45 5G'],
    tags: ['clean-android', 'value', 'students', 'seniors', 'office'],
    image: 'assets/images/moto_g45_5g.png',
    specs: {
      display: '6.58" LCD 120Hz', processor: 'Snapdragon 6s Gen 3',
      camera: '50MP', battery: '5000mAh', ram: '4GB', storage: '128GB',
      charging: '18W', os: 'Android 14 (near-stock)', weight: '179g', thickness: '8mm',
      network: '5G', nfc: false, headphone: true, waterproof: 'IP52'
    },
    rating: {
      overall: 4.2, display: 4.0, camera: 4.1, battery: 4.2, performance: 4.3, value: 4.6,
      gaming: 3.8, heating: 4.8, repair: 4.5, trust: 4.5, camera_day: 4.2, camera_night: 3.2,
      selfie: 3.5, stabilization: 3.0, updates: 4.0, resale: 4.2
    },
    pros: ['Cleanest Android experience', '3 years OS updates guaranteed', 'Lightweight 179g', 'Affordable price'],
    cons: ['Only 4GB RAM base', 'Slow 18W charging', 'LCD panel'],
    verdict: 'Best for users who want stock Android without bloatware. Motorola\'s update policy is unmatched.',
    badge: 'Clean Android', badgeColor: '#00cec9',
    reviews: 15200, launchYear: 2024,
    offers: ['₹1000 off on Flipkart with Axis card', 'Free back cover'],
    emi: { months6: 1900, months12: 999 }
  },
  {
    id: 'galaxy-m17', brand: 'Samsung', model: 'Galaxy M17 5G', category: 'under15k',
    price: 13999, searchTerms: ['Samsung Galaxy M17 5G'],
    tags: ['display', 'students', 'value', 'seniors', 'office'],
    image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m15.jpg',
    specs: {
      display: '6.5" Super AMOLED 90Hz', processor: 'Dimensity 6300',
      camera: '50MP', battery: '5000mAh', ram: '6GB', storage: '128GB',
      charging: '25W', os: 'Android 14 + One UI 6', weight: '197g', thickness: '8.4mm',
      network: '5G', nfc: false, headphone: true, waterproof: 'IP54'
    },
    rating: {
      overall: 4.3, display: 4.6, camera: 4.1, battery: 4.2, performance: 4.0, value: 4.1,
      gaming: 3.5, heating: 4.7, repair: 4.8, trust: 5.0, camera_day: 4.3, camera_night: 3.8,
      selfie: 4.0, stabilization: 3.8, updates: 5.0, resale: 4.8
    },
    pros: ['Super AMOLED display is stunning', '4 years OS updates', 'Trusted brand + service centers', 'Good resale value'],
    cons: ['Dimensity 6300 is mid-range', 'Slightly heavy', 'No NFC'],
    verdict: 'Best choice for Samsung loyalists. Unbeatable display quality and the best software support in this segment.',
    badge: 'Best Updates', badgeColor: '#6c5ce7',
    reviews: 9800, launchYear: 2025,
    offers: ['Samsung Finance+ 0% EMI', '₹2000 off on exchange at Samsung.com'],
    emi: { months6: 2416, months12: 1271 }
  },
  {
    id: 'tecno-pova7', brand: 'Tecno', model: 'Tecno Pova 7 5G', category: 'under15k',
    price: 13499, searchTerms: ['Tecno Pova 7 5G'],
    tags: ['battery', 'gaming', 'value'],
    image: 'https://fdn2.gsmarena.com/vv/bigpic/tecno-pova-6-pro.jpg',
    specs: {
      display: '6.78" IPS 120Hz', processor: 'Dimensity 7300 Ultimate',
      camera: '50MP AI', battery: '6000mAh', ram: '8GB', storage: '256GB',
      charging: '45W', os: 'Android 14 + HiOS 14', weight: '198g', thickness: '8.2mm',
      network: '5G', nfc: false, headphone: true, waterproof: 'IP54'
    },
    rating: { overall: 4.1, display: 4.0, camera: 3.9, battery: 4.7, performance: 4.2, value: 4.5 },
    pros: ['6000mAh + 45W fast charging', '256GB storage at this price', 'Dimensity 7300 Ultimate chip', 'Great gaming performance'],
    cons: ['HiOS has bloatware', 'IPS not AMOLED', 'Tecno service centers limited'],
    verdict: 'Best value storage deal — 256GB at ₹13.5K is unmatched. Great for media consumption.',
    badge: 'Storage King', badgeColor: '#a855f7',
    reviews: 6700, launchYear: 2025,
    offers: ['No-cost EMI on Flipkart', '₹500 coupon available'],
    emi: { months6: 2333, months12: 1229 }
  },
  {
    id: 'edge-60-fusion', brand: 'Motorola', model: 'Edge 60 Fusion', category: 'under20k',
    price: 18999, searchTerms: ['Motorola Edge 60 Fusion'],
    tags: ['premium', 'camera', 'display', 'clean-android', 'office', 'creator'],
    image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-40.jpg',
    specs: {
      display: '6.7" curved AMOLED 144Hz', processor: 'Dimensity 7400',
      camera: '50MP OIS', battery: '5000mAh', ram: '8GB', storage: '128GB',
      charging: '68W', os: 'Android 14 (near-stock)', weight: '175g', thickness: '7.8mm',
      network: '5G', nfc: true, headphone: false, waterproof: 'IP69'
    },
    rating: {
      overall: 4.6, display: 4.8, camera: 4.5, battery: 4.3, performance: 4.5, value: 4.6,
      gaming: 4.3, heating: 4.4, repair: 3.8, trust: 4.5, camera_day: 4.6, camera_night: 4.4,
      selfie: 4.2, stabilization: 4.8, updates: 4.0, resale: 4.0
    },
    pros: ['IP69 water resistance', 'Stunning 144Hz curved AMOLED', 'Vegan leather premium build', '68W ultra fast charging'],
    cons: ['No headphone jack', 'Only 128GB base storage', 'Slightly pricey'],
    verdict: 'Editor\'s pick for under ₹20K. The only phone in this range with IP69 rating + 144Hz curved AMOLED.',
    badge: "Editor's Pick", badgeColor: '#00cec9',
    reviews: 18500, launchYear: 2025,
    offers: ['₹2000 off with HDFC/ICICI cards on Flipkart', 'Free Moto Buds on select combos'],
    emi: { months6: 3283, months12: 1727 }
  },
  {
    id: 'poco-x7', brand: 'POCO', model: 'POCO X7 5G', category: 'under20k',
    price: 16999, searchTerms: ['POCO X7 5G'],
    tags: ['gaming', 'display', 'performance'],
    image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x7.jpg',
    specs: {
      display: '6.67" 1.5K curved AMOLED 120Hz', processor: 'Dimensity 7300 Ultra',
      camera: '50MP OIS', battery: '5110mAh', ram: '8GB', storage: '256GB',
      charging: '45W', os: 'Android 14 + HyperOS', weight: '181g', thickness: '7.7mm',
      network: '5G', nfc: true, headphone: false, waterproof: 'IP64'
    },
    rating: { overall: 4.5, display: 4.8, camera: 4.4, battery: 4.3, performance: 4.6, value: 4.5 },
    pros: ['1.5K resolution curved AMOLED — best display under ₹20K', 'Dimensity 7300 Ultra for gaming', 'NFC + IP64', '256GB storage'],
    cons: ['MIUI/HyperOS bloatware', 'No headphone jack', 'Average main camera in low light'],
    verdict: 'Best display phone under ₹17K. The 1.5K AMOLED makes everything look cinematic.',
    badge: 'Best Display', badgeColor: '#e91e63',
    reviews: 22100, launchYear: 2025,
    offers: ['₹1500 off with SBI card on Amazon', 'No-cost EMI 6 months'],
    emi: { months6: 2942, months12: 1548 }
  },
  {
    id: 'moto-g86-power', brand: 'Motorola', model: 'Moto G86 Power 5G', category: 'under20k',
    price: 17499, searchTerms: ['Motorola Moto G86 Power 5G'],
    tags: ['battery', 'clean-android', 'value'],
    image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g85.jpg',
    specs: {
      display: '6.67" AMOLED 120Hz', processor: 'Dimensity 7400',
      camera: '50MP OIS', battery: '6720mAh', ram: '8GB', storage: '128GB',
      charging: '33W', os: 'Android 14 (near-stock)', weight: '208g', thickness: '8.6mm',
      network: '5G', nfc: true, headphone: true, waterproof: 'IP68'
    },
    rating: { overall: 4.4, display: 4.5, camera: 4.3, battery: 4.9, performance: 4.4, value: 4.5 },
    pros: ['6720mAh — biggest battery under ₹18K', 'IP68 certified', 'Headphone jack present', 'Clean Android + NFC'],
    cons: ['Slow 33W charging for big battery', 'Heavy at 208g', 'Camera average in ultra-wide'],
    verdict: 'Best power user phone. 6720mAh battery lasts 2 days easily. Rare IP68 + headphone jack combo.',
    badge: 'Power Pack', badgeColor: '#fdcb6e',
    reviews: 11200, launchYear: 2025,
    offers: ['₹1000 Flipkart gift card with purchase', 'Exchange bonus ₹1500'],
    emi: { months6: 3025, months12: 1591 }
  },
  {
    id: 'cmf-phone2-pro', brand: 'CMF by Nothing', model: 'CMF Phone 2 Pro', category: 'under20k',
    price: 16499, searchTerms: ['CMF Phone 2 Pro'],
    tags: ['design', 'display', 'value'],
    image: 'https://fdn2.gsmarena.com/vv/bigpic/nothing-cmf-phone-1.jpg',
    specs: {
      display: '6.77" flexible AMOLED 120Hz', processor: 'Dimensity 7300 Pro',
      camera: '50MP OIS', battery: '5500mAh', ram: '8GB', storage: '256GB',
      charging: '33W', os: 'Android 14 + Nothing OS lite', weight: '192g', thickness: '7.8mm',
      network: '5G', nfc: true, headphone: false, waterproof: 'IP54'
    },
    rating: { overall: 4.3, display: 4.6, camera: 4.3, battery: 4.4, performance: 4.3, value: 4.5 },
    pros: ['Unique modular design — attachable accessories', 'Flexible AMOLED display', 'Nothing OS clean interface', '256GB at ₹16.5K'],
    cons: ['Accessories sold separately', 'No headphone jack', 'CMF brand still new'],
    verdict: 'Most stylish phone under ₹17K. The modular back and clean Nothing OS experience is truly unique.',
    badge: 'Style Icon', badgeColor: '#a855f7',
    reviews: 9500, launchYear: 2025,
    offers: ['Nothing community discount ₹500', 'No-cost EMI on Flipkart'],
    emi: { months6: 2858, months12: 1503 }
  },
  {
    id: 'vivo-t4r', brand: 'Vivo', model: 'Vivo T4R 5G', category: 'under20k',
    price: 17999, searchTerms: ['Vivo T4R 5G'],
    tags: ['camera', 'premium', 'display'],
    image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-t3-pro.jpg',
    specs: {
      display: '6.67" curved AMOLED 120Hz', processor: 'Snapdragon 7s Gen 2',
      camera: '50MP OIS', battery: '5700mAh', ram: '8GB', storage: '128GB',
      charging: '44W', os: 'Android 14 + FunTouch OS 14', weight: '186g', thickness: '7.9mm',
      network: '5G', nfc: true, headphone: false, waterproof: 'IP64'
    },
    rating: { overall: 4.2, display: 4.5, camera: 4.5, battery: 4.4, performance: 4.4, value: 4.1 },
    pros: ['Snapdragon 7s Gen 2 — fastest CPU here', 'Military-grade durability tested', 'Excellent OIS camera', '5700mAh battery'],
    cons: ['FunTouch OS heavy skin', 'Expensive vs POCO X7', 'No headphone jack'],
    verdict: 'Best Snapdragon chip in under ₹20K. Vivo\'s camera processing is excellent for social media shots.',
    badge: 'Fastest CPU', badgeColor: '#00cec9',
    reviews: 7800, launchYear: 2025,
    offers: ['Vivo store exchange ₹2000 off', 'Free screen replacement year 1'],
    emi: { months6: 3116, months12: 1638 }
  },
  {
    id: 'redmi-note-14', brand: 'Redmi', model: 'Redmi Note 14 5G', category: 'under15k',
    price: 14999, searchTerms: ['Redmi Note 14 5G'],
    tags: ['display', 'value', 'students'],
    image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-5g.jpg',
    specs: {
      display: '6.67" AMOLED 120Hz', processor: 'Dimensity 6080',
      camera: '108MP AI', battery: '5000mAh', ram: '6GB', storage: '128GB',
      charging: '33W', os: 'Android 14 + HyperOS', weight: '175g', thickness: '7.6mm',
      network: '5G', nfc: false, headphone: true, waterproof: 'IP54'
    },
    rating: { overall: 4.3, display: 4.5, camera: 4.3, battery: 4.1, performance: 4.0, value: 4.6, trust: 4.5, repair: 4.5 },
    pros: ['Super slim 7.6mm design', 'Stunning 120Hz AMOLED', '108MP camera details', 'HyperOS features'],
    cons: ['Processor is average for gaming', 'Mono speaker', 'Plastic build'],
    verdict: 'The all-rounder choice for 2026. Redmi reliability meets a stunning slim design.',
    badge: 'Popular Pick', badgeColor: '#6c5ce7',
    reviews: 45000, launchYear: 2025,
    offers: ['₹1000 off with ICICI cards', 'No-cost EMI on Amazon'],
    emi: { months6: 2500, months12: 1312 }
  },
  {
    id: 'realme-13-pro', brand: 'Realme', model: 'Realme 13 Pro 5G', category: 'under20k',
    price: 19999, searchTerms: ['Realme 13 Pro 5G'],
    tags: ['camera', 'design', 'creator'],
    image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-12-pro-plus-5g.jpg',
    specs: {
      display: '6.7" Curved AMOLED 120Hz', processor: 'Snapdragon 7s Gen 2',
      camera: '50MP Sony LYT-600 OIS', battery: '5200mAh', ram: '8GB', storage: '128GB',
      charging: '45W', os: 'Android 14 + Realme UI 5.0', weight: '188g', thickness: '8.2mm',
      network: '5G', nfc: true, headphone: false, waterproof: 'IP65'
    },
    rating: { overall: 4.5, display: 4.7, camera: 4.6, battery: 4.3, performance: 4.4, value: 4.2, trust: 4.2, repair: 3.8 },
    pros: ['Sony LYT-600 sensor is elite', 'Luxury watch inspired design', 'Curved AMOLED looks premium', 'Good battery life'],
    cons: ['Realme UI has bloatware', 'No headphone jack', 'Slow charging for this price'],
    verdict: 'Best camera phone for those who love premium aesthetics. The Sony sensor is a game changer.',
    badge: 'Pro Camera', badgeColor: '#ff6b81',
    reviews: 12500, launchYear: 2025,
    offers: ['₹2000 instant discount on HDFC', 'Free Realme Buds on select stores'],
    emi: { months6: 3333, months12: 1750 }
  },
  {
    id: 'iqoo-z10', brand: 'iQOO', model: 'iQOO Z10 5G', category: 'under20k',
    price: 18499, searchTerms: ['iQOO Z10 5G'],
    tags: ['gaming', 'performance'],
    image: 'https://fdn2.gsmarena.com/vv/bigpic/iqoo-z9.jpg',
    specs: {
      display: '6.67" AMOLED 120Hz 1800nits', processor: 'Dimensity 7300',
      camera: '50MP OIS', battery: '5000mAh', ram: '8GB', storage: '128GB',
      charging: '44W', os: 'Android 14 + FunTouch OS 14', weight: '185g', thickness: '7.8mm',
      network: '5G', nfc: false, headphone: false, waterproof: 'IP54'
    },
    rating: { overall: 4.4, display: 4.5, camera: 4.1, battery: 4.2, performance: 4.8, value: 4.4, trust: 4.0, repair: 3.5, gaming: 4.9 },
    pros: ['Best gaming performance in segment', 'Ultra-bright 1800 nits screen', 'Decent OIS camera', 'Sleek design'],
    cons: ['Bloatware in FunTouch OS', 'No headphone jack', 'Average ultra-wide camera'],
    verdict: 'The gamer\'s first choice. Dimensity 7300 at this price point is a steal for BGMI/Free Fire.',
    badge: 'Gaming King', badgeColor: '#fdcb6e',
    reviews: 15600, launchYear: 2025,
    offers: ['₹1500 off with SBI cards', 'Exchange bonus ₹2000'],
    emi: { months6: 3083, months12: 1618 }
  },
  {
    id: 'nord-ce-4-lite', brand: 'OnePlus', model: 'OnePlus Nord CE 4 Lite', category: 'under20k',
    price: 18999, searchTerms: ['OnePlus Nord CE 4 Lite'],
    tags: ['premium', 'display', 'office'],
    image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce4-lite-5g.jpg',
    specs: {
      display: '6.67" AMOLED 120Hz 2100nits', processor: 'Snapdragon 6s Gen 3',
      camera: '50MP OIS', battery: '5500mAh', ram: '8GB', storage: '128GB',
      charging: '80W', os: 'Android 14 + OxygenOS 14', weight: '191g', thickness: '8.1mm',
      network: '5G', nfc: false, headphone: true, waterproof: 'IP54'
    },
    rating: { overall: 4.3, display: 4.6, camera: 4.2, battery: 4.5, performance: 3.9, value: 4.0, trust: 4.8, repair: 4.0 },
    pros: ['Crazy bright 2100 nits display', '80W SuperVOOC is fastest here', 'OxygenOS is smooth', 'Headphone jack is back!'],
    cons: ['Processor is weak for gaming', 'No ultra-wide camera', 'Mostly plastic build'],
    verdict: 'Best for OnePlus fans and office users who want fast charging and a clean experience.',
    badge: 'Fast Charging', badgeColor: '#00cec9',
    reviews: 21000, launchYear: 2025,
    offers: ['₹1000 bank discount', 'Free OnePlus case'],
    emi: { months6: 3166, months12: 1662 }
  },
  {
    id: 'nord-4', brand: 'OnePlus', model: 'OnePlus Nord 4', category: 'under30k',
    price: 27999, searchTerms: ['OnePlus Nord 4'],
    tags: ['premium', 'performance', 'display'],
    image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-4.jpg',
    specs: {
      display: '6.74" AMOLED 120Hz 1.5K', processor: 'Snapdragon 7+ Gen 3',
      camera: '50MP OIS Sony', battery: '5500mAh', ram: '8GB', storage: '256GB',
      charging: '100W', os: 'Android 14 + OxygenOS', weight: '199g', thickness: '8.0mm',
      network: '5G', nfc: true, headphone: false, waterproof: 'IP65'
    },
    rating: { overall: 4.6, display: 4.7, camera: 4.4, battery: 4.6, performance: 4.8, value: 4.5, gaming: 4.7 },
    pros: ['Metal unibody design is premium', 'Snapdragon 7+ Gen 3 is crazy fast', '100W charging', 'Alert slider!'],
    cons: ['No headphone jack', 'Camera processing could be better in low light'],
    verdict: 'The ultimate mid-range phone. Metal build feels amazing and performance is top-tier.',
    badge: 'Metal Build', badgeColor: '#6c5ce7',
    reviews: 15000, launchYear: 2025,
    offers: ['₹2000 off on ICICI cards'],
    emi: { months6: 4666, months12: 2333 }
  },
  {
    id: 'iqoo-neo-9', brand: 'iQOO', model: 'iQOO Neo 9', category: 'under30k',
    price: 29999, searchTerms: ['iQOO Neo 9'],
    tags: ['gaming', 'performance'],
    image: 'https://fdn2.gsmarena.com/vv/bigpic/iqoo-neo-9.jpg',
    specs: {
      display: '6.78" AMOLED 144Hz', processor: 'Snapdragon 8 Gen 2',
      camera: '50MP OIS Sony', battery: '5160mAh', ram: '8GB', storage: '256GB',
      charging: '120W', os: 'Android 14 + FunTouch OS', weight: '190g', thickness: '7.9mm',
      network: '5G', nfc: true, headphone: false, waterproof: 'IP54'
    },
    rating: { overall: 4.7, display: 4.8, camera: 4.3, battery: 4.4, performance: 4.9, value: 4.7, gaming: 5.0 },
    pros: ['Flagship Snapdragon 8 Gen 2', '144Hz display for smooth gaming', '120W charging is insane'],
    cons: ['Bloatware in UI', 'Average secondary cameras'],
    verdict: 'The absolute gaming king under 30k. Snapdragon 8 Gen 2 destroys any game at high settings.',
    badge: 'Flagship Killer', badgeColor: '#fdcb6e',
    reviews: 18000, launchYear: 2024,
    offers: ['₹1500 off with HDFC'],
    emi: { months6: 5000, months12: 2500 }
  },
  {
    id: 'iqoo-12', brand: 'iQOO', model: 'iQOO 12 5G', category: 'under50k',
    price: 52999, searchTerms: ['iQOO 12 5G'],
    tags: ['performance', 'gaming', 'camera'],
    image: 'https://fdn2.gsmarena.com/vv/bigpic/iqoo-12.jpg',
    specs: {
      display: '6.78" AMOLED 144Hz 3000nits', processor: 'Snapdragon 8 Gen 3',
      camera: '50MP OIS + 50MP UW + 64MP Telephoto', battery: '5000mAh', ram: '12GB', storage: '256GB',
      charging: '120W', os: 'Android 14 + FunTouch OS', weight: '203g', thickness: '8.1mm',
      network: '5G', nfc: true, headphone: false, waterproof: 'IP64'
    },
    rating: { overall: 4.8, display: 4.8, camera: 4.6, battery: 4.5, performance: 5.0, value: 4.8, gaming: 5.0 },
    pros: ['Snapdragon 8 Gen 3 is a beast', 'Incredible periscope telephoto camera', '144Hz screen'],
    cons: ['FunTouch OS is heavy', 'No wireless charging'],
    verdict: 'The best value performance flagship. Beats phones twice its price in raw power.',
    badge: 'Performance King', badgeColor: '#ff7675',
    reviews: 12000, launchYear: 2024,
    offers: ['₹3000 off on ICICI'],
    emi: { months6: 8833, months12: 4416 }
  },
  {
    id: 'oneplus-12', brand: 'OnePlus', model: 'OnePlus 12', category: 'under70k',
    price: 64999, searchTerms: ['OnePlus 12'],
    tags: ['premium', 'display', 'camera'],
    image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-12.jpg',
    specs: {
      display: '6.82" AMOLED 120Hz 2K', processor: 'Snapdragon 8 Gen 3',
      camera: '50MP OIS + 48MP UW + 64MP Telephoto', battery: '5400mAh', ram: '12GB', storage: '256GB',
      charging: '100W Wired + 50W Wireless', os: 'Android 14 + OxygenOS', weight: '220g', thickness: '9.2mm',
      network: '5G', nfc: true, headphone: false, waterproof: 'IP65'
    },
    rating: { overall: 4.7, display: 4.9, camera: 4.5, battery: 4.7, performance: 4.9, value: 4.5 },
    pros: ['Stunning 2K display', 'Great battery life', 'Wireless charging is back'],
    cons: ['Slightly heavy and bulky', 'Curved screen might not appeal to all'],
    verdict: 'The most balanced flagship. Great display, great battery, and solid cameras.',
    badge: 'Balanced Flagship', badgeColor: '#74b9ff',
    reviews: 15000, launchYear: 2024,
    offers: ['₹2000 off on exchange'],
    emi: { months6: 10833, months12: 5416 }
  },
  {
    id: 'iphone-15-pro', brand: 'Apple', model: 'iPhone 15 Pro', category: 'under1.25l',
    price: 129900, searchTerms: ['iPhone 15 Pro'],
    tags: ['premium', 'camera', 'status'],
    image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro.jpg',
    specs: {
      display: '6.1" OLED 120Hz', processor: 'A17 Pro',
      camera: '48MP OIS + 12MP UW + 12MP Telephoto', battery: '3274mAh', ram: '8GB', storage: '128GB',
      charging: '20W', os: 'iOS 17', weight: '187g', thickness: '8.3mm',
      network: '5G', nfc: true, headphone: false, waterproof: 'IP68'
    },
    rating: { overall: 4.8, display: 4.8, camera: 4.9, battery: 4.0, performance: 5.0, value: 3.5 },
    pros: ['Titanium build is light', 'A17 Pro runs console games', 'Best video recording in the world'],
    cons: ['Very expensive', 'Slow charging', 'Only 128GB base storage'],
    verdict: 'The ultimate pro tool. Best for video creators and status seekers.',
    badge: 'Video King', badgeColor: '#fab1a0',
    reviews: 25000, launchYear: 2023,
    offers: ['₹5000 off with HDFC'],
    emi: { months6: 21650, months12: 10825 }
  },
  {
    id: 's24-ultra', brand: 'Samsung', model: 'Galaxy S24 Ultra', category: 'under1.25l',
    price: 129999, searchTerms: ['Samsung Galaxy S24 Ultra'],
    tags: ['premium', 'camera', 'status'],
    image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra.jpg',
    specs: {
      display: '6.8" Dynamic AMOLED 120Hz', processor: 'Snapdragon 8 Gen 3 for Galaxy',
      camera: '200MP OIS + 12MP UW + 50MP Telephoto + 10MP Telephoto', battery: '5000mAh', ram: '12GB', storage: '256GB',
      charging: '45W', os: 'Android 14 + One UI 6.1', weight: '232g', thickness: '8.6mm',
      network: '5G', nfc: true, headphone: false, waterproof: 'IP68'
    },
    rating: { overall: 4.9, display: 5.0, camera: 4.9, battery: 4.6, performance: 5.0, value: 4.0 },
    pros: ['Best display on any phone', 'Insane 200MP camera details', 'S-Pen included', '7 years of updates'],
    cons: ['Very heavy', 'Expensive', 'Boxy design might dig into palms'],
    verdict: 'The ultimate Android phone. If budget is no bar, this is the one to get.',
    badge: 'Ultimate Flagship', badgeColor: '#ffeaa7',
    reviews: 30000, launchYear: 2024,
    offers: ['Up to ₹10,000 exchange bonus'],
    emi: { months6: 21666, months12: 10833 }
  },
  {
    id: 'redmi-note-13-pro', brand: 'Redmi', model: 'Redmi Note 13 Pro 5G', category: 'under30k',
    price: 24999, searchTerms: ['Redmi Note 13 Pro 5G'],
    tags: ['camera', 'display', 'value'],
    image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-5g.jpg',
    specs: { display: '6.67" AMOLED 1.5K', processor: 'Snapdragon 7s Gen 2', camera: '200MP OIS', battery: '5100mAh', ram: '8GB', storage: '128GB' },
    rating: { overall: 4.4, camera: 4.6, display: 4.5, battery: 4.2, performance: 4.1, value: 4.4 },
    badge: '200MP Camera', badgeColor: '#6c5ce7'
  },
  {
    id: 'realme-gt-6t', brand: 'Realme', model: 'Realme GT 6T', category: 'under30k',
    price: 30999, searchTerms: ['Realme GT 6T'],
    tags: ['performance', 'gaming'],
    image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt-6t.jpg',
    specs: { display: '6.78" AMOLED 120Hz', processor: 'Snapdragon 7+ Gen 3', camera: '50MP OIS', battery: '5500mAh', ram: '8GB', storage: '128GB' },
    rating: { overall: 4.5, camera: 4.0, display: 4.6, battery: 4.7, performance: 4.8, value: 4.5 },
    badge: 'Performance King', badgeColor: '#ff7675'
  },
  {
    id: 'galaxy-a55', brand: 'Samsung', model: 'Galaxy A55 5G', category: 'under50k',
    price: 39999, searchTerms: ['Samsung Galaxy A55 5G'],
    tags: ['premium', 'status'],
    image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a55.jpg',
    specs: { display: '6.6" AMOLED 120Hz', processor: 'Exynos 1480', camera: '50MP OIS', battery: '5000mAh', ram: '8GB', storage: '128GB' },
    rating: { overall: 4.3, camera: 4.3, display: 4.5, battery: 4.4, performance: 4.0, value: 3.8 },
    badge: 'Premium Midranger', badgeColor: '#74b9ff'
  },
  {
    id: 'moto-edge-50-pro', brand: 'Motorola', model: 'Edge 50 Pro', category: 'under50k',
    price: 31999, searchTerms: ['Motorola Edge 50 Pro'],
    tags: ['camera', 'display', 'premium'],
    image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-pro.jpg',
    specs: { display: '6.7" OLED 144Hz', processor: 'Snapdragon 7 Gen 3', camera: '50MP OIS + Telephoto', battery: '4500mAh', ram: '8GB', storage: '256GB' },
    rating: { overall: 4.5, camera: 4.5, display: 4.7, battery: 3.8, performance: 4.2, value: 4.4 },
    badge: 'AI Camera', badgeColor: '#a855f7'
  },
  {
    id: 'poco-f6', brand: 'POCO', model: 'POCO F6', category: 'under30k',
    price: 29999, searchTerms: ['POCO F6'],
    tags: ['performance', 'gaming'],
    image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-f6.jpg',
    specs: { display: '6.67" AMOLED 120Hz', processor: 'Snapdragon 8s Gen 3', camera: '50MP OIS', battery: '5000mAh', ram: '8GB', storage: '256GB' },
    rating: { overall: 4.6, camera: 4.0, display: 4.5, battery: 4.2, performance: 4.9, value: 4.7 },
    badge: 'Raw Power', badgeColor: '#ff7675'
  },
  {
    id: 'iphone-15', brand: 'Apple', model: 'iPhone 15', category: 'under70k',
    price: 70999, searchTerms: ['Apple iPhone 15'],
    tags: ['premium', 'status', 'camera'],
    image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg',
    specs: { display: '6.1" OLED 60Hz', processor: 'A16 Bionic', camera: '48MP OIS', battery: '3349mAh', ram: '6GB', storage: '128GB' },
    rating: { overall: 4.6, camera: 4.7, display: 4.4, battery: 4.0, performance: 4.7, value: 3.5 },
    badge: 'Standard Flagship', badgeColor: '#fab1a0'
  },
  {
    id: 'pixel-8a', brand: 'Google', model: 'Pixel 8a', category: 'under50k',
    price: 52999, searchTerms: ['Google Pixel 8a'],
    tags: ['camera', 'clean-android'],
    image: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8a.jpg',
    specs: { display: '6.1" OLED 120Hz', processor: 'Google Tensor G3', camera: '64MP OIS', battery: '4492mAh', ram: '8GB', storage: '128GB' },
    rating: { overall: 4.4, camera: 4.8, display: 4.5, battery: 3.8, performance: 4.2, value: 4.0 },
    badge: 'AI & Camera', badgeColor: '#00cec9'
  }
];

const UPCOMING_PHONES = [
  { model: 'POCO M8 Pro 5G', brand: 'POCO', expectedPrice: '₹14,999', launchDate: 'June 2026', tags: ['gaming', 'battery'] },
  { model: 'Realme 14 Pro+', brand: 'Realme', expectedPrice: '₹19,999', launchDate: 'June 2026', tags: ['camera', 'display'] },
  { model: 'Samsung Galaxy M25 5G', brand: 'Samsung', expectedPrice: '₹17,999', launchDate: 'July 2026', tags: ['display', 'updates'] },
  { model: 'iQOO Z10 Lite', brand: 'iQOO', expectedPrice: '₹12,999', launchDate: 'June 2026', tags: ['gaming', 'value'] },
  { model: 'Motorola Edge 70 Neo', brand: 'Motorola', expectedPrice: '₹18,499', launchDate: 'August 2026', tags: ['clean-android', 'camera'] },
];

const BRAND_SCORES = [
  { brand: 'Motorola', score: 9.1, updates: '5/5', service: '4/5', value: '4.5/5', icon: '🔵' },
  { brand: 'Samsung', score: 8.8, updates: '5/5', service: '5/5', value: '3.5/5', icon: '🔷' },
  { brand: 'OnePlus', score: 8.6, updates: '4.5/5', service: '4/5', value: '3.5/5', icon: '🔴' },
  { brand: 'Redmi', score: 8.5, updates: '4/5', service: '5/5', value: '4.5/5', icon: '🟠' },
  { brand: 'POCO', score: 8.4, updates: '3/5', service: '4/5', value: '5/5', icon: '🟡' },
  { brand: 'Realme', score: 8.2, updates: '3.5/5', service: '4/5', value: '4.5/5', icon: '🟡' },
  { brand: 'iQOO', score: 8.1, updates: '3.5/5', service: '4/5', value: '4.5/5', icon: '🟣' },
  { brand: 'Vivo', score: 7.9, updates: '3/5', service: '4.5/5', value: '4/5', icon: '🟠' },
  { brand: 'CMF', score: 7.8, updates: '4/5', service: '3/5', value: '4.5/5', icon: '⚫' },
  { brand: 'Lava', score: 7.2, updates: '3/5', service: '3/5', value: '4.5/5', icon: '🔴' },
  { brand: 'Tecno', score: 7.0, updates: '2/5', service: '3/5', value: '5/5', icon: '🟢' },
];

const BANK_OFFERS = [
  { bank: 'HDFC Bank', offer: '10% off up to ₹1,500 on Credit Cards', platforms: ['Flipkart', 'Amazon'], icon: '🏦' },
  { bank: 'SBI Card', offer: '₹1,500 instant discount on purchases above ₹15,000', platforms: ['Amazon'], icon: '🏛️' },
  { bank: 'ICICI Bank', offer: '5% cashback up to ₹750 on Debit Cards', platforms: ['Flipkart'], icon: '💳' },
  { bank: 'Axis Bank', offer: '₹1,000 off with Axis Ace Credit Card', platforms: ['Flipkart', 'Croma'], icon: '💰' },
  { bank: 'Kotak Bank', offer: '7.5% off up to ₹2,000 on Select Cards', platforms: ['Amazon'], icon: '🏧' },
  { bank: 'No-Cost EMI', offer: '0% EMI for 3-6 months on all major cards', platforms: ['Flipkart', 'Amazon', 'Croma'], icon: '📅' },
];

module.exports = { PHONES_DATA, UPCOMING_PHONES, BRAND_SCORES, BANK_OFFERS };
