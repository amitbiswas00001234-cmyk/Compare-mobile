# BudgetPick India 📱

An automated, high-performance price comparison platform for Indian budget smartphones (2026).

![BudgetPick Hero](assets/images/hero-phone.png)

## 🚀 Features

- **Live Price Tracking**: Real-time price updates from Amazon, with fallback links for Flipkart, Croma, and Reliance Digital.
- **AI-Powered Insights**: Uses Google Gemini to provide a "Buy Verdict" and analyze pros/cons of each device.
- **Smart Finder Quiz**: Interactive quiz to find the perfect phone based on your budget and usage (Gaming, Camera, Battery, etc.).
- **Comparison Engine**: Compare up to 3 phones side-by-side with detailed specs.
- **Scam Link Verifier**: AI-powered tool to check if a phone deal link is safe or a scam.
- **Email Price Alerts**: Sign up to receive email notifications when a phone's price drops!
- **Mobile Responsive**: Polished Glassmorphism UI that looks premium on all devices.
- **SEO Optimized**: Meta tags, Open Graph, Sitemap, and Robots.txt are all configured.

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML5, CSS3 (Custom Glassmorphism design), JavaScript.
- **Backend**: Node.js, Express.
- **Scraping**: Puppeteer Extra with Stealth Plugin.
- **AI**: Google Gen AI (Gemini).
- **Database**: Local JSON file storage (simulating a database for simplicity).

## 💻 Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/amitbiswas00001234-cmyk/Compare-mobile.git
   cd Compare-mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your keys:
   ```env
   PORT=3000
   GEMINI_API_KEY=your_gemini_api_key_here
   EMAIL_USER=your_ethereal_email_or_smtp_user
   EMAIL_PASS=your_ethereal_password_or_smtp_pass
   ```

4. **Run the server**:
   ```bash
   npm start
   ```
   Open `http://localhost:3000` in your browser.

## 📁 Project Structure

- `server.js`: Express backend and API endpoints.
- `script.js`: Core frontend logic and DOM manipulation.
- `features.js`: Quiz and secondary feature logic.
- `utils.js`: Helper functions for fetch and state.
- `style.css`: Custom premium styling.
- `data/`: Contains phone data, logs, and database files.

## 📝 License

This project is open-source and available under the MIT License.
