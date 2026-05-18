const LAPTOPS_DATA = [
  {
    id: 'acer-aspire-lite', brand: 'Acer', model: 'Acer Aspire Lite 15', category: 'under30k',
    price: 26990, searchTerms: ['Acer Aspire Lite 15 Core i3'],
    tags: ['office', 'students', 'value'],
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200',
    specs: {
      display: '15.6" FHD IPS 60Hz', processor: 'Core i3 12th Gen',
      camera: '720p HD', battery: '36Whr (Up to 5h)', ram: '8GB DDR4', storage: '512GB SSD',
      charging: '45W', os: 'Windows 11 Home', weight: '1.59kg', thickness: '18.9mm',
      network: 'Wi-Fi 5', nfc: false, headphone: true, waterproof: 'N/A'
    },
    rating: {
      overall: 4.2, display: 4.1, camera: 3.5, battery: 3.8, performance: 4.2, value: 4.7,
      gaming: 2.5, heating: 4.3, repair: 4.5, trust: 4.1, updates: 4.0, resale: 3.8
    },
    pros: ['Excellent price-to-specs ratio', '512GB NVMe SSD storage', 'Very lightweight (1.59kg) for 15.6"', 'Full-size keyboard'],
    cons: ['Small 36Whr battery', 'Average built-in webcam', 'No backlit keyboard'],
    verdict: 'Best all-rounder laptop under ₹30K. Highly recommended for students and daily office productivity tasks.',
    badge: 'Best Budget All-Rounder', badgeColor: '#00cec9',
    reviews: 5800, launchYear: 2025,
    offers: ['10% off with SBI Credit Cards', 'No-cost EMI for 6 months on Amazon'],
    emi: { months6: 4500, months12: 2250 }
  },
  {
    id: 'asus-vivobook-15', brand: 'ASUS', model: 'ASUS Vivobook 15 Thin', category: 'under35k',
    price: 32990, searchTerms: ['ASUS Vivobook 15 Ryzen 5'],
    tags: ['performance', 'students', 'display'],
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=200',
    specs: {
      display: '15.6" FHD Anti-Glare', processor: 'AMD Ryzen 5 5500U',
      camera: '720p with Privacy Shutter', battery: '42Whr (Up to 6h)', ram: '16GB DDR4', storage: '512GB SSD',
      charging: '65W Fast Charge', os: 'Windows 11 + Office 2021', weight: '1.7kg', thickness: '19.9mm',
      network: 'Wi-Fi 6', nfc: false, headphone: true, waterproof: 'N/A'
    },
    rating: {
      overall: 4.4, display: 4.3, camera: 4.0, battery: 4.1, performance: 4.6, value: 4.5,
      gaming: 3.8, heating: 4.4, repair: 4.2, trust: 4.6, updates: 4.0, resale: 4.2
    },
    pros: ['AMD Ryzen 5 6-Core processor is extremely fast', 'Comes with 16GB dual-channel RAM', 'USB-C fast charging support', 'Camera privacy shield'],
    cons: ['Chassis is entirely plastic', 'Display brightness capped at 250 nits', 'Only 1 year warranty'],
    verdict: 'The absolute speed champion under ₹35K. 16GB RAM combined with 6 cores handles intense multitasking easily.',
    badge: 'Speed Champ', badgeColor: '#ff7675',
    reviews: 8900, launchYear: 2024,
    offers: ['₹2000 off on exchange on Flipkart', '10% HDFC card discount'],
    emi: { months6: 5498, months12: 2749 }
  },
  {
    id: 'lenovo-ideapad-slim3', brand: 'Lenovo', model: 'Lenovo IdeaPad Slim 3', category: 'under35k',
    price: 33990, searchTerms: ['Lenovo IdeaPad Slim 3 Core i3'],
    tags: ['office', 'students', 'premium'],
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200',
    specs: {
      display: '15.6" FHD IPS Bright', processor: 'Core i3 13th Gen',
      camera: '1080p FHD Camera', battery: '47Whr (Up to 7h)', ram: '8GB LPDDR5', storage: '512GB SSD',
      charging: '65W Fast Charge', os: 'Windows 11 Home', weight: '1.62kg', thickness: '17.9mm',
      network: 'Wi-Fi 6', nfc: false, headphone: true, waterproof: 'N/A'
    },
    rating: {
      overall: 4.3, display: 4.4, camera: 4.6, battery: 4.3, performance: 4.1, value: 4.3,
      gaming: 2.8, heating: 4.6, repair: 4.7, trust: 4.8, updates: 4.2, resale: 4.4
    },
    pros: ['IPS display has excellent viewing angles', 'Modern 13th Gen Intel Core i3', 'High-quality 1080p FHD camera', 'Lenovo Rapid Charge (80% in 1h)'],
    cons: ['LPDDR5 RAM is soldered (not upgradable)', 'Keyboard has moderate key travel', 'Basic audio output'],
    verdict: 'Excellent durability and brand trust. The 1080p camera makes it perfect for video conferences and online classes.',
    badge: 'Best build quality', badgeColor: '#6c5ce7',
    reviews: 6400, launchYear: 2025,
    offers: ['Lenovo warranty upgrade for ₹99', 'Flat ₹1500 off on Axis cards'],
    emi: { months6: 5665, months12: 2833 }
  },
  {
    id: 'hp-laptop-15s', brand: 'HP', model: 'HP Laptop 15s', category: 'under40k',
    price: 37990, searchTerms: ['HP 15s Ryzen 5'],
    tags: ['students', 'premium', 'office'],
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=200',
    specs: {
      display: '15.6" FHD Micro-Edge', processor: 'AMD Ryzen 5 7520U',
      camera: '720p with Temporal Noise Reduction', battery: '41Whr (Up to 6h)', ram: '8GB LPDDR5', storage: '512GB SSD',
      charging: '45W Smart AC adapter', os: 'Windows 11 + MS Office', weight: '1.59kg', thickness: '17.9mm',
      network: 'Wi-Fi 5', nfc: false, headphone: true, waterproof: 'N/A'
    },
    rating: {
      overall: 4.2, display: 4.0, camera: 4.2, battery: 4.0, performance: 4.3, value: 4.1,
      gaming: 3.2, heating: 4.5, repair: 4.6, trust: 5.0, updates: 4.0, resale: 4.6
    },
    pros: ['Premium silver design', 'Backlit keyboard support', 'HP True Vision camera with noise reduction', 'Lightweight and slim frame'],
    cons: ['No Type-C charging support', 'Upgrading RAM is impossible', 'IPS panel missing (uses TN Micro-Edge)'],
    verdict: 'Best for brand-conscious users. Sleek looks and excellent resale value combined with reliable HP after-sales support.',
    badge: 'Premium Style', badgeColor: '#fdcb6e',
    reviews: 14500, launchYear: 2025,
    offers: ['Free HP wireless mouse included', '₹3000 off on exchange'],
    emi: { months6: 6332, months12: 3166 }
  },
  {
    id: 'msi-modern-14', brand: 'MSI', model: 'MSI Modern 14 Thin', category: 'under30k',
    price: 27990, searchTerms: ['MSI Modern 14 Core i3'],
    tags: ['design', 'students', 'value'],
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200',
    specs: {
      display: '14" FHD IPS 100% sRGB', processor: 'Intel Core i3 1215U',
      camera: '720p HD', battery: '39Whr (Up to 5.5h)', ram: '8GB DDR4 (Upgradable)', storage: '512GB NVMe SSD',
      charging: '65W Type-C adapter', os: 'Windows 11 Home', weight: '1.4kg', thickness: '16.9mm',
      network: 'Wi-Fi 6', nfc: false, headphone: true, waterproof: 'N/A'
    },
    rating: {
      overall: 4.3, display: 4.7, camera: 3.8, battery: 3.9, performance: 4.2, value: 4.6,
      gaming: 2.8, heating: 4.2, repair: 4.0, trust: 3.9, updates: 4.0, resale: 3.5
    },
    pros: ['Stunning 14" IPS 100% sRGB screen', 'Extremely lightweight at 1.4kg', 'Type-C power delivery support', 'White backlit keyboard'],
    cons: ['14 inch display is small for spreadsheet tasks', 'Average battery runtime', 'Single-channel memory preinstalled'],
    verdict: 'The screen of this laptop is stunning. Perfect for entry-level digital design, video creators, and frequent travelers.',
    badge: 'Best Display under 30K', badgeColor: '#e91e63',
    reviews: 3200, launchYear: 2024,
    offers: ['MSI gaming backpack for ₹499', 'No-cost EMI up to 9 months'],
    emi: { months6: 4665, months12: 2333 }
  },
  {
    id: 'xiaomi-notebook-ultra', brand: 'Xiaomi', model: 'Xiaomi Notebook Ultra', category: 'under40k',
    price: 39990, searchTerms: ['Xiaomi Notebook Ultra Core i5'],
    tags: ['display', 'performance', 'premium'],
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200',
    specs: {
      display: '15.6" 3.2K IPS 90Hz', processor: 'Core i5 11th Gen H-Series',
      camera: '720p HD', battery: '70Whr (Up to 10h)', ram: '16GB DDR4', storage: '512GB NVMe SSD',
      charging: '65W Type-C Fast', os: 'Windows 11 + Office', weight: '1.7kg', thickness: '17.9mm',
      network: 'Wi-Fi 6', nfc: false, headphone: true, waterproof: 'N/A'
    },
    rating: {
      overall: 4.6, display: 4.9, camera: 3.9, battery: 4.8, performance: 4.5, value: 4.8,
      gaming: 3.6, heating: 4.1, repair: 3.8, trust: 4.1, updates: 4.0, resale: 4.0
    },
    pros: ['Stunning 3.2K resolution screen with 90Hz refresh rate', 'Massive 70Whr battery lasts up to 10 hours', 'Aerospace-grade Aluminum unibody', 'Thunderbolt 4 support'],
    cons: ['Slightly older processor gen', 'Glossy panel reflections', 'Xiaomi service coverage is moderately limited compared to HP'],
    verdict: 'A premium masterpiece under ₹40K. Standard-setting 3.2K display, massive battery, and elite premium aluminum build.',
    badge: 'Premium Flagship Specs', badgeColor: '#ffeaa7',
    reviews: 9500, launchYear: 2024,
    offers: ['₹2500 off on HDFC Cards', 'Xiaomi smart speaker free'],
    emi: { months6: 6665, months12: 3333 }
  }
];

const UPCOMING_LAPTOPS = [
  { model: 'ASUS Vivobook Go 14 2026', brand: 'ASUS', expectedPrice: '₹28,999', launchDate: 'July 2026', tags: ['students', 'value'] },
  { model: 'Acer Aspire Lite Ryzen 2026', brand: 'Acer', expectedPrice: '₹31,999', launchDate: 'June 2026', tags: ['performance', 'value'] },
  { model: 'HP Pavilion Aero Slim', brand: 'HP', expectedPrice: '₹44,999', launchDate: 'July 2026', tags: ['premium', 'office'] },
  { model: 'Lenovo IdeaPad Slim 3i Gen 9', brand: 'Lenovo', expectedPrice: '₹36,999', launchDate: 'June 2026', tags: ['office', 'students'] }
];

const LAPTOP_BRAND_SCORES = [
  { brand: 'Lenovo', score: 9.0, updates: '4.5/5', service: '4.8/5', value: '4.2/5', icon: '🔵' },
  { brand: 'HP', score: 8.9, updates: '4.0/5', service: '5.0/5', value: '3.8/5', icon: '🔷' },
  { brand: 'ASUS', score: 8.7, updates: '4.2/5', service: '4.3/5', value: '4.5/5', icon: '🔴' },
  { brand: 'Acer', score: 8.4, updates: '4.0/5', service: '4.1/5', value: '4.8/5', icon: '🟠' },
  { brand: 'Xiaomi', score: 8.1, updates: '3.8/5', service: '3.8/5', value: '4.9/5', icon: '🟡' },
  { brand: 'MSI', score: 7.9, updates: '3.5/5', service: '3.7/5', value: '4.3/5', icon: '⚫' }
];

const LAPTOP_BANK_OFFERS = [
  { bank: 'SBI Card', offer: '10% instant discount up to ₹3,000 on Laptops', platforms: ['Amazon'], icon: '🏛️' },
  { bank: 'HDFC Bank', offer: 'Flat ₹2,500 instant off on laptops above ₹30,000', platforms: ['Flipkart'], icon: '🏦' },
  { bank: 'Axis Bank', offer: '5% unlimited cashback with Flipkart Axis Credit Card', platforms: ['Flipkart'], icon: '💳' },
  { bank: 'No-Cost EMI', offer: '0% EMI up to 12 months on select premium laptops', platforms: ['Flipkart', 'Amazon'], icon: '📅' }
];

module.exports = { LAPTOPS_DATA, UPCOMING_LAPTOPS, LAPTOP_BRAND_SCORES, LAPTOP_BANK_OFFERS };
