# 🧵 SarasTM — Heritage-to-Global OS for Indian Artisans

> **Built for the Build for India AI Hackathon (Paytm · 2026)**  
> An unofficial hackathon concept. Not an official Paytm product.

<div align="center">

![SarasTM Banner](https://img.shields.io/badge/SarasTM-Heritage%20to%20Global-002970?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJsMi4wOSA2LjI2TDIyIDkuMjdsLTUgNC44NyAxLjE4IDYuODhMMTIgMTcuNzdsLTYuMTggMy4yNUw3IDE0LjE0IDIgOS4yN2w2LjkxLTEuMDFMMTIgMnoiIGZpbGw9IiMwMEJBRjIiLz48L3N2Zz4=)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?style=for-the-badge&logo=supabase)
![Gemini](https://img.shields.io/badge/Gemini-3.6%20Flash-4285F4?style=for-the-badge&logo=google)

</div>

---

## 📖 Table of Contents

- [What is SarasTM?](#-what-is-sarastm)
- [Problem Statement](#-problem-statement)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Seed Demo Data](#seed-demo-data)
  - [Running Locally](#running-locally)
- [User Flows](#-user-flows)
  - [Artisan Flow](#artisan-flow)
  - [Buyer Flow](#buyer-flow)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Design System](#-design-system)
- [Deployment](#-deployment)
- [Limitations & Disclaimers](#-limitations--disclaimers)

---

## 🌟 What is SarasTM?

**SarasTM** (Saras Trade Marketplace) is an AI-powered marketplace OS that turns any Indian artisan's smartphone into a complete global export desk — no English required, no expensive agency needed.

A Madhubani painter from Bihar speaks in Hindi. A Kanchipuram silk weaver describes her saree in Tamil. A Kashmiri walnut wood carver explains his technique in Urdu. SarasTM converts their voice into a globally competitive product listing, attaches a cryptographically verifiable authenticity passport, calculates live multi-currency pricing, handles cross-border payments with escrow protection, and generates draft customs compliance documents — all in one platform.

---

## 🎯 Problem Statement

India's 7 crore+ artisans produce some of the world's most prized handicrafts, but 90% of them:
- Cannot write English product descriptions
- Lack professional product photography
- Have no way to prove authenticity to overseas buyers
- Don't understand export compliance (HSN codes, FIRA)
- Are exploited by middlemen who capture 60–80% of value

SarasTM removes every one of these barriers with AI.

---

## ✨ Key Features

### 🎙️ Voice-Powered Listings
- Artisan speaks in **11 Indian languages**: Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Odia, Punjabi, Maithili
- **Sarvam AI (saaras:v4 + sarvam-translate:v1)** performs ASR (speech-to-text) + translation to English
- **Gemini** generates professional title, brand story, SEO tags, and multi-currency pricing
- **Fallback:** Type description in any language when voice is unavailable
- **LLM fallback chain:** Gemini → Groq (llama-3.1-8b-instant) automatically

### 📸 AI Photo Studio
- Upload up to 3 photos from phone
- **HuggingFace RMBG-1.4** removes background (AI-powered, no green screen needed)
- **Sharp** composites product onto studio backdrops:
  - Studio White, Neutral Beige, Dark Slate, Sage Green
- Before/After slider comparison
- Images stored in Supabase Storage

### 🔐 Authenticity Passport
- Every product gets a **QR code** linking to its public passport page
- Passport contains: artisan name, region, craft type, full story, price history
- **SHA-256 content hash** computed at publish time — any tampering is detectable
- Live tamper-evidence check on every passport page visit
- Buyers can scan QR and see verified provenance

### 📋 Export Compliance Assistant
- **HSN Code RAG System:**
  - 80+ handicraft HSN codes loaded from CSV into **pgvector** (Supabase)
  - **Text-embedding-004** creates semantic embeddings
  - Vector similarity search finds top 5 matching HSN codes
  - **Gemini** reasons about the best match with confidence level
- **Draft Export Declaration PDF** (pdfkit) — clearly watermarked "NOT A LEGAL DOCUMENT"
- **Draft e-FIRA PDF** (Foreign Inward Remittance Advice) for payout records — watermarked "SANDBOX DEMO"

### 💰 Escrow Payments
- **Razorpay Test Mode** integration:
  - Multi-currency order creation (INR, USD, EUR, GBP)
  - HMAC-SHA256 signature verification
  - Automatic escrow creation on payment
- **Forex:** Live rates from frankfurter.app with 6-hour cache
- **Payout simulation** with e-FIRA PDF generation
- Full payout ledger for artisans

### 🛍️ Marketplace (Buyer Side)
- Amazon-style storefront with Paytm design theme
- Filter by craft type, region, price band, currency
- Product detail page with full story, artisan info, QR passport
- Cart with multi-currency support
- Razorpay checkout
- Order tracking with status timeline
- Wishlist, reviews (post-delivery)
- Order history

### 🏪 Artisan Dashboard
- Draft/Published listing management
- Revenue metrics (mock)
- ONDC sync toggle
- Product editor (title, story, tags, pricing)
- Quick links to all tools

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (React + Vite)                │
│  Landing → Storefront → ProductDetail → Checkout            │
│  ArtisanDashboard → VoiceListing → PhotoStudio             │
│  ExportAssistant → PayoutLedger → Passport                 │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP (axios)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVER (Node.js + Express)                │
│                                                             │
│  /api/listing    → Bhashini ASR → Gemini listing gen        │
│  /api/images     → HuggingFace RMBG → Sharp compositing     │
│  /api/passport   → QR generation → SHA-256 hash             │
│  /api/compliance → pgvector RAG → Gemini HSN → pdfkit       │
│  /api/payments   → Razorpay → Escrow → e-FIRA PDF          │
│  /api/buyer      → Product search/filter/orders             │
│  /api/reviews    → Post-delivery review system              │
└───────┬────────────┬────────────┬──────────────────────────-┘
        │            │            │
        ▼            ▼            ▼
  Supabase       Bhashini     Gemini/Groq
  Postgres       Dhruva       LLM APIs
  pgvector       ASR+NMT      
  Storage                     
  Auth                       
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + Vite | SPA framework |
| **Styling** | Tailwind CSS + Vanilla CSS | Paytm design system |
| **State** | Zustand | Cart + Auth state |
| **Routing** | React Router v6 | Client-side navigation |
| **Backend** | Node.js + Express | REST API server |
| **Database** | Supabase (PostgreSQL) | Primary data store |
| **Vector DB** | pgvector (Supabase) | HSN code embeddings for RAG |
| **Auth** | Supabase Auth | JWT-based authentication |
| **Storage** | Supabase Storage | Product images + PDFs |
| **Voice AI** | Bhashini Dhruva API | ASR + NMT (11 Indian languages) |
| **LLM (Primary)** | Gemini 3.6 Flash | Listing generation, HSN reasoning |
| **LLM (Fallback)** | Groq (llama-3.1-8b-instant) | Auto-fallback when Gemini fails |
| **Embeddings** | Gemini text-embedding-004 | Semantic HSN code search |
| **BG Removal** | HuggingFace RMBG-1.4 | AI photo background removal |
| **Image Processing** | Sharp | Studio backdrop compositing |
| **Payments** | Razorpay (Test Mode) | Multi-currency checkout |
| **Forex** | Frankfurter.app | Live INR/USD/EUR/GBP rates |
| **PDF** | pdfkit | Export declaration + e-FIRA |
| **QR Codes** | qrcode npm | Passport QR generation |
| **HTTP Client** | Axios | API calls (client + server) |

---

## 📁 Project Structure

```
SarasTM/
├── client/                          # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── artisan/
│   │   │   │   ├── VoiceRecorder.jsx     # MediaRecorder + text fallback
│   │   │   │   ├── PhotoUploader.jsx     # Drag-drop + preview
│   │   │   │   ├── BeforeAfterSlider.jsx # Image comparison
│   │   │   │   └── ListingEditor.jsx     # Rich form editor
│   │   │   ├── buyer/
│   │   │   │   ├── ProductCard.jsx       # Amazon-style card
│   │   │   │   ├── CartDrawer.jsx        # Slide-in cart
│   │   │   │   ├── CurrencySelector.jsx  # INR/USD/EUR/GBP picker
│   │   │   │   ├── OrderTracker.jsx      # Status timeline
│   │   │   │   └── ReviewForm.jsx        # Star rating + comment
│   │   │   └── ui/
│   │   │       ├── NavBar.jsx            # Paytm navy top bar
│   │   │       ├── BottomNav.jsx         # Mobile tab bar
│   │   │       ├── Button.jsx
│   │   │       ├── Card.jsx
│   │   │       ├── Badge.jsx
│   │   │       ├── Modal.jsx
│   │   │       └── Spinner.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx              # Homepage with hero + categories
│   │   │   ├── artisan/
│   │   │   │   ├── ArtisanDashboard.jsx  # Metrics + listing manager
│   │   │   │   ├── VoiceListing.jsx      # Voice/text → AI listing
│   │   │   │   ├── PhotoStudio.jsx       # AI background removal
│   │   │   │   ├── ExportAssistant.jsx   # HSN lookup + PDF export
│   │   │   │   └── PayoutLedger.jsx      # Payout history + e-FIRA
│   │   │   └── buyer/
│   │   │       ├── Storefront.jsx        # Product grid + filters
│   │   │       ├── ProductDetail.jsx     # Full product page
│   │   │       ├── Passport.jsx          # QR passport public page
│   │   │       ├── Cart.jsx
│   │   │       ├── Checkout.jsx          # Razorpay integration
│   │   │       ├── OrderConfirm.jsx
│   │   │       ├── BuyerAccount.jsx
│   │   │       └── OrderDetail.jsx
│   │   ├── store/
│   │   │   ├── authStore.js             # Supabase auth state
│   │   │   └── cartStore.js             # Cart with multi-currency
│   │   ├── lib/
│   │   │   ├── constants.js             # Languages, currencies, API base URL
│   │   │   └── api.js                   # Axios API mapper (all endpoints)
│   │   ├── App.jsx                      # React Router config
│   │   ├── main.jsx
│   │   └── index.css                    # Paytm design system
│   ├── tailwind.config.js               # Exact Paytm colors
│   ├── vite.config.js
│   ├── .env                             # Client environment variables
│   └── package.json
│
├── server/                              # Node.js + Express backend
│   ├── src/
│   │   ├── index.js                     # App entry + route wiring
│   │   ├── middleware/
│   │   │   └── auth.js                  # Supabase JWT verification
│   │   ├── routes/
│   │   │   ├── listing.js               # Voice → listing pipeline
│   │   │   ├── images.js                # Upload + AI enhancement
│   │   │   ├── passport.js              # QR + tamper hash
│   │   │   ├── compliance.js            # HSN RAG + PDF export
│   │   │   ├── payments.js              # Razorpay + escrow + payout
│   │   │   ├── buyer.js                 # Products + orders + wishlist
│   │   │   └── reviews.js              
│   │   ├── services/
│   │   │   ├── bhashini.js              # Dhruva ASR + NMT
│   │   │   ├── gemini.js                # Gemini 3.6 Flash + Groq fallback
│   │   │   ├── imageProcessor.js        # HuggingFace RMBG + Sharp
│   │   │   ├── rag.js                   # pgvector HSN search
│   │   │   ├── pdfGenerator.js          # pdfkit documents
│   │   │   ├── qrGenerator.js           # QR code + SHA-256 hash
│   │   │   └── forex.js                 # Frankfurter.app rates
│   │   └── db/
│   │       ├── supabase.js              # Admin client
│   │       └── migrations/
│   │           └── 001_initial.sql      # Full schema + pgvector + RPC
│   ├── data/
│   │   ├── hsn_handicrafts.csv          # 80 HSN codes for crafts
│   │   └── seed/
│   │       ├── demo_products.json       # 5 demo artisan products
│   │       └── seed.js                  # DB seeder script
│   ├── .env                             # Server environment variables
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ (`node --version`)
- **npm** v9+
- A **Supabase** account (free tier is sufficient)
- API keys for: Gemini, Groq, Razorpay, HuggingFace
- (Later) Bhashini ULCA credentials for voice features

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd SarasTM

# 2. Install server dependencies
cd server
npm install

# 3. Install client dependencies
cd ../client
npm install
```

### Environment Variables

#### `server/.env`

```env
# Supabase
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Google Gemini (AQ key format — new standard from 2025)
GEMINI_API_KEY=AQ.xxxxxxxxxxxxxxxxxxxxxxxx

# Groq (LLM fallback — free tier)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx

# Bhashini (voice ASR + translation — pending approval)
BHASHINI_API_KEY=
BHASHINI_USER_ID=

# Razorpay (Test Mode only)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# HuggingFace (background removal)
HUGGINGFACE_API_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxx

# App config
FRONTEND_URL=http://localhost:5173
PORT=4000
```

#### `client/.env`

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_BASE_URL=http://localhost:4000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
```

### Where to Get Each Key

| Key | Source | Notes |
|---|---|---|
| `SUPABASE_URL` + keys | [supabase.com](https://supabase.com) → Settings → API | Free tier |
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) → Get API Key | New `AQ` format |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) → API Keys | Free, instant |
| `BHASHINI_API_KEY/USER_ID` | [bhashini.gov.in](https://bhashini.gov.in) → ULCA Dashboard | Takes 2+ days approval |
| `RAZORPAY_KEY_ID/SECRET` | [dashboard.razorpay.com](https://dashboard.razorpay.com) → Settings → API Keys | Use Test Mode |
| `HUGGINGFACE_API_TOKEN` | [huggingface.co](https://huggingface.co) → Settings → Access Tokens | Free |

### Database Setup

1. Go to your Supabase project → **SQL Editor** → **New query**
2. Copy the entire contents of `server/src/db/migrations/001_initial.sql`
3. Paste and click **Run**

This creates:
- All 12 tables (artisans, products, product_images, passports, buyers, wishlists, orders, order_status_log, escrow_entries, payouts, reviews, hsn_codes)
- `match_hsn_codes()` RPC function for vector similarity search
- `product-images` storage bucket (public)

### Seed Demo Data

After the migration, populate 5 demo artisan products:

```bash
cd server
node data/seed/seed.js
```

Expected output:
```
Seeding demo data...
Created: Madhubani Peacock Dance Painting
Created: Kanchipuram Pure Silk Saree — Temple Border
Created: Kashmiri Walnut Wood Carved Box — Chinar Leaf Motif
Created: Jaipur Blue Pottery Vase — Floral Garden Design
Created: Warli Tribal Art — Village Life Cycle Canvas
Seed complete!
```

### Running Locally

Open **two terminal windows**:

```bash
# Terminal 1 — Backend (port 4000)
cd server
npm run dev
# Expected: "SarasTM API running on port 4000"

# Terminal 2 — Frontend (port 5173)
cd client
npm run dev
# Expected: "Local: http://localhost:5173/"
```

Open **http://localhost:5173** in your browser.

> **Important:** Keep both terminals open at all times. If either process is killed, restart with the same command.

---

## 🔄 User Flows

### Artisan Flow

```
1. Register/Login → Artisan Dashboard
         ↓
2. New Listing → VoiceListing page
   a. [With Bhashini] Record voice in native language
      → Bhashini transcribes + translates to English
   b. [Without Bhashini] Type description in any language
      → Gemini generates full listing (title, story, tags, prices)
         ↓
3. Review + Edit listing in ListingEditor
   → Adjust title, story, SEO tags, prices
   → Publish (status: draft → published)
         ↓
4. Photo Studio
   → Upload product photos
   → AI removes background (HuggingFace RMBG-1.4)
   → Choose studio backdrop
   → Before/After comparison
         ↓
5. Export Compliance (optional)
   → Enter product description
   → AI finds best HSN code (pgvector RAG + Gemini)
   → Download draft Export Declaration PDF
         ↓
6. Payout Ledger
   → View order history
   → Simulate payout (sandbox)
   → Download e-FIRA PDF
```

### Buyer Flow

```
1. Landing page → Browse categories
         ↓
2. Storefront
   → Filter by craft type, region, price band
   → Select display currency (INR/USD/EUR/GBP)
         ↓
3. Product Detail page
   → Full story + artisan profile
   → Add to cart (with selected currency)
   → Scan QR → Passport page (verify authenticity)
         ↓
4. Cart → Checkout
   → Razorpay payment (Test Mode)
   → Test card: 4111 1111 1111 1111
         ↓
5. Order Confirm → Order Detail
   → Track status (pending → paid → shipped → delivered)
         ↓
6. (After delivery) Submit review
   → Star rating + comment
```

---

## 📡 API Reference

### Base URL
- **Local:** `http://localhost:4000`
- **Production:** `https://your-render-app.onrender.com`

### Endpoints

#### Listings
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/listing/generate` | Voice/text → AI listing (multipart form) |
| `GET` | `/api/listing/my` | Get artisan's own listings |
| `GET` | `/api/listing/:id` | Get single listing |
| `PATCH` | `/api/listing/:id` | Update listing fields |
| `POST` | `/api/listing/:id/publish` | Publish listing (adds content hash) |

#### Images
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/images/upload` | Upload raw photos (multipart, max 3) |
| `POST` | `/api/images/enhance` | Trigger AI background removal + compositing |
| `GET` | `/api/images/:productId` | Get all images for a product |

#### Passport
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/passport/generate/:productId` | Generate QR + compute content hash |
| `GET` | `/api/passport/:productId` | Get passport with live tamper check |

#### Compliance
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/compliance/hsn` | `{ description }` → HSN suggestion |
| `POST` | `/api/compliance/export-pdf/:productId` | Download draft export declaration |

#### Payments
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/payments/create-order` | Create Razorpay order |
| `POST` | `/api/payments/verify` | Verify payment signature → create escrow |
| `POST` | `/api/payments/simulate-payout` | Release escrow + generate e-FIRA |
| `GET` | `/api/payments/escrow` | List all escrow entries |
| `GET` | `/api/payments/payouts` | List all payouts |
| `GET` | `/api/payments/efira/:payoutId` | Download e-FIRA PDF |

#### Buyer
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/buyer/products` | List products (supports search, craft_type, region, price_band) |
| `GET` | `/api/buyer/products/:id` | Get single product |
| `GET` | `/api/buyer/orders?email=` | Get buyer's orders |
| `GET` | `/api/buyer/orders/:id` | Get single order |
| `PATCH` | `/api/buyer/orders/:id/status` | Update order status |
| `POST` | `/api/buyer/wishlist/toggle` | Toggle product in wishlist |
| `GET` | `/api/buyer/wishlist` | Get buyer's wishlist |

#### Reviews
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/reviews` | Submit review (delivered orders only) |
| `GET` | `/api/reviews/:productId` | Get reviews for a product |

#### Health
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server health check |

---

## 🗃️ Database Schema

```sql
artisans        — id, name, phone, region, language
products        — id, artisan_id, title, story_en, story_native, seo_tags,
                  price_inr/usd/eur/gbp, hsn_code, content_hash, status, craft_type
product_images  — id, product_id, raw_url, enhanced_url
passports       — id, product_id, qr_url, content_hash, verification_status
buyers          — id, name, email, preferred_currency
wishlists       — id, buyer_id, product_id
orders          — id, product_id, buyer_id, buyer_email, amount, currency,
                  razorpay_order_id, status, gift_message
order_status_log— id, order_id, status, note, updated_at
escrow_entries  — id, order_id, status (held/released)
payouts         — id, escrow_entry_id, artisan_id, amount_inr, efira_pdf_url
reviews         — id, order_id, buyer_id, product_id, rating (1-5), comment
hsn_codes       — id, code, description, category, embedding (vector 768)
```

The `match_hsn_codes(query_embedding, match_count)` PostgreSQL function performs cosine similarity search using pgvector.

---

## 🎨 Design System

SarasTM uses the **exact Paytm design language** extracted from paytm.com:

| Token | Value | Usage |
|---|---|---|
| Primary Navy | `#002970` | Header, buttons, titles |
| Dark Navy | `#00233E` | Sub-nav, footer |
| Accent Cyan | `#00BAF2` | CTAs, links, active states, search bar |
| Cyan Light | `#E0F5FD` | Hover backgrounds |
| Page Background | `#F7F9FC` | App background |
| Text Primary | `#101010` | Body text |
| Text Secondary | `#7E7E7E` | Meta, labels |
| Border | `#CACACA` | Dividers, input borders |
| Success | `#27AE60` | Verified badges |
| Error | `#EB5757` | Warnings, errors |
| Font | Inter | Paytm's official font |

**Signature elements:**
- Pill-shaped buttons (border-radius: 50px) — exactly like Paytm
- Dual-color stripe (cyan top + navy bottom) on header/footer
- Amazon-style layout: sticky nav → category sub-bar → sidebar filters → product grid

---

## 🚀 Deployment

### Frontend → Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. **Framework:** Vite
4. **Root Directory:** `client`
5. **Build Command:** `npm run build`
6. **Output Directory:** `dist`
7. Add all `VITE_*` environment variables in Vercel dashboard
8. Deploy

### Backend → Render.com

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo
3. **Root Directory:** `server`
4. **Build Command:** `npm install`
5. **Start Command:** `npm start`
6. Add all server environment variables in Render dashboard
7. Set `FRONTEND_URL` to your Vercel deployment URL
8. Deploy

### After Deployment

Update environment variables:
- `client/.env`: Set `VITE_API_BASE_URL` to your Render URL
- `server/.env`: Set `FRONTEND_URL` to your Vercel URL
- Redeploy both after updating

---

## ⚠️ Limitations & Disclaimers

| Feature | Status | Notes |
|---|---|---|
| **Voice Listings** | ⏳ Pending | Requires Bhashini ULCA approval (2+ days) |
| **Payments** | 🧪 Test Mode | Razorpay Test Mode only. No real money moves. |
| **e-FIRA** | 🧪 Sandbox | Not a legally valid FIRA. Watermarked "DEMO". |
| **Export PDF** | 📋 Draft | Not a legal filing document. Watermarked "NOT LEGAL". |
| **HSN Codes** | 🤖 AI-suggested | Must be verified by licensed CA before any real export. |
| **AI Photo Studio** | 🖼️ Functional | Quality depends on input photo lighting/background. |
| **ONDC Sync** | 🔄 Stub | UI toggle exists; real ONDC API integration not implemented. |
| **Cross-border payments** | ❌ Not live | Real cross-border requires AD-II licensed PA under RBI/FEMA. |

> This is an unofficial hackathon concept. SarasTM is not an official Paytm product.

---

## 🏆 Hackathon Context

**Event:** Build for India AI Hackathon by Paytm (2026)  
**Theme:** Using AI to solve real problems for India's underserved communities  
**Category:** Financial inclusion / artisan empowerment  
**AI Stack:** Gemini 3.6 Flash + Bhashini Dhruva + pgvector RAG + HuggingFace RMBG  

The name **Saras (सरस)** means "beautiful" or "graceful" in Sanskrit — reflecting the elegance of India's heritage crafts.

---

<div align="center">
  <strong>Made with ❤️ for India's 7 crore artisans</strong><br/>
  <sub>Build for India AI Hackathon · Paytm · 2026</sub>
</div>
