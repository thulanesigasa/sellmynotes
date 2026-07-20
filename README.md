# 📚 SellMyNotes.co.za

A premium peer-to-peer marketplace designed specifically for South African students to securely buy and sell study notes, summaries, and past papers. 

Built with **Next.js (App Router)**, **FastAPI**, **Supabase**, and integrated with **PayFast** for localized secure transactions.

---

## ✨ What the App Does

- **Peer-to-Peer Marketplace:** Students can upload their study materials, set prices, and sell them directly to other students.
- **Secure File Delivery:** Uploaded PDFs and notes are securely stored. Buyers only get access to download the unwatermarked files *after* a successful payment.
- **PayFast Integration:** Fully integrated with South Africa's leading payment gateway, PayFast, to handle ZAR transactions, seller payouts, and instant payment notifications (IPN).
- **AI-Powered Organization:** Uses OpenAI to automatically categorize, tag, and extract key topics from uploaded notes to make searching and filtering seamless.
- **Modern User Experience:** Features a lightning-fast, glassmorphic UI built with Tailwind CSS, ensuring high conversion rates and an intuitive browsing experience.

---

## 🏗️ Architecture & Tech Stack

This platform uses a decoupled architecture to ensure scalability and secure payment processing.

- **Frontend (`/frontend`)**
  - **Framework:** Next.js 14 (App Router) with React 18
  - **Styling:** Tailwind CSS + custom UI components
- **Backend API (`/backend`)**
  - **Framework:** FastAPI (Python 3.11+)
  - **Responsibilities:** PayFast webhook verification (IPN), AI PDF processing, and secure file delivery.
- **Database & Auth**
  - **Platform:** Supabase (PostgreSQL, JWT Auth, Row Level Security, Private Storage Buckets)

---

## 🚀 How to Run the App (Local Setup)

### 1. Prerequisites
- **Node.js 18+** & **npm**
- **Python 3.11+**
- **Supabase Account** (For database and storage)

### 2. Environment Variables Configuration

You must configure the environment variables for both the backend and frontend.

**Frontend Configuration:**
Navigate to the `frontend/` directory and create a `.env.local` file with the following keys:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
BACKEND_URL=http://127.0.0.1:8000
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Backend Configuration:**
Navigate to the `backend/` directory and create a `.env` file with the necessary backend credentials:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-service-role-key
PAYFAST_MERCHANT_ID=your-merchant-id
PAYFAST_MERCHANT_KEY=your-merchant-key
PAYFAST_PASSPHRASE=your-passphrase
```

---

### 3. Running Locally (Manual Method)

You will need two terminals to run the frontend and backend simultaneously.

**Terminal 1: Backend (FastAPI)**
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate       # On Windows
source venv/bin/activate      # On macOS/Linux

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
*The backend API is now accessible at `http://localhost:8000/docs`.*

**Terminal 2: Frontend (Next.js)**
```bash
cd frontend
npm install
npm run dev
```
*The frontend is now accessible at `http://localhost:3000`.*

---

### 4. Running Locally (Docker Method)

If you prefer using Docker to orchestrate the services, ensure Docker Desktop is running and execute:

```bash
docker-compose up --build
```

---

## 📜 Legal & Security

By using this software, you agree to the integrated Terms of Service and Privacy Policy. All transactions are securely processed via PayFast. Notes and intellectual property remain the responsibility of the uploading user.
