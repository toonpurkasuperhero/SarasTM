# SarasTM

**Heritage-to-Global OS for Indian Artisans** — Built for Build for India AI Hackathon (Paytm)

> Unofficial hackathon concept built for Build for India AI Hackathon. Not an official Paytm product.

## Overview

SarasTM turns any Indian artisan's smartphone into a complete export desk:
- 🎙️ **Voice Listings** — Speak in 11 Indian languages, get a global-ready listing instantly
- 📸 **AI Photo Studio** — Background removal + studio compositing
- 🔐 **Authenticity Passport** — QR-linked, SHA-256 tamper-evident provenance
- 📋 **Export Compliance** — HSN RAG assistant + draft export declaration PDF
- 💰 **Escrow Payments** — Razorpay Test Mode + mock payout ledger + e-FIRA

## Setup

### 1. Clone and install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

### 2. Set up environment variables

Fill in `client/.env` and `server/.env` with your API keys.

### 3. Run Supabase migration

Copy `server/src/db/migrations/001_initial.sql` into the Supabase SQL Editor and run it.

### 4. Seed demo data

```bash
cd server
node data/seed/seed.js
```

### 5. Start development

```bash
# Terminal 1 — Server
cd server && npm run dev

# Terminal 2 — Client
cd client && npm run dev
```

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | Supabase (Postgres + pgvector) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Voice AI | Bhashini Dhruva API (ASR + NMT) |
| LLM | Gemini 2.5 Flash + Groq fallback |
| Images | HuggingFace RMBG + sharp |
| Payments | Razorpay Test Mode |
| PDF | pdfkit |
| QR | qrcode npm |

## Deployment

- **Frontend**: Vercel — connect GitHub repo, set root to `client/`
- **Backend**: Render.com — connect GitHub repo, set root to `server/`

## API Keys Required

| Key | Source |
|---|---|
| BHASHINI_API_KEY + BHASHINI_USER_ID | bhashini.gov.in |
| GEMINI_API_KEY | aistudio.google.com |
| GROQ_API_KEY | console.groq.com |
| SUPABASE_URL + keys | supabase.com |
| RAZORPAY_KEY_ID + SECRET | dashboard.razorpay.com (Test Mode) |
| HUGGINGFACE_API_TOKEN | huggingface.co/settings/tokens |
