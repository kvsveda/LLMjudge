# LLMJudge — Performance Analysis of AI Models

> Submit one prompt → GPT-3.5, Gemini, and Claude respond simultaneously → Llama 3 judges the winner.

---

## Folder Structure

```
llm-judge/
├── backend/
│   ├── config/
│   │   └── users.js            # In-memory user store
│   ├── controllers/
│   │   ├── authController.js   # Login / Signup logic
│   │   └── analysisController.js # LLM orchestration + judge
│   ├── middleware/
│   │   └── auth.js             # JWT verification
│   ├── routes/
│   │   ├── auth.js
│   │   └── analysis.js
│   ├── .env.example            # ← copy to .env and fill in keys
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ModelCard.jsx
│   │   │   ├── ComparisonTable.jsx
│   │   │   ├── JudgePanel.jsx
│   │   │   ├── ScoreBar.jsx
│   │   │   └── LoadingOverlay.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   └── DashboardPage.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── index.css
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
└── README.md
```

---

## Quick Start (VS Code)

### Step 1 — Get your API Keys

| Key | Where to get it | Cost |
|-----|----------------|------|
| `OPENROUTER_API_KEY` | [openrouter.ai](https://openrouter.ai) — create account, go to Keys | Free credits on signup |
| `GEMINI_API_KEY` | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) | Free tier |

> **OpenRouter** provides unified access to GPT-3.5-turbo, Claude Haiku, and Llama 3 (free tier) — one key for three models.

---

### Step 2 — Configure the backend

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and fill in:

```env
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxx
JWT_SECRET=any_long_random_string_you_choose
```

---

### Step 3 — Install dependencies

Open **two terminals** in VS Code:

**Terminal 1 — Backend:**
```bash
cd backend
npm install
npm run dev
# → Server running on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm start
# → App running on http://localhost:3000
```

---

### Step 4 — Open the app

Visit **http://localhost:3000**

1. Click **Sign up** → create an account
2. Go to **Dashboard**
3. Enter a prompt (or pick an example)
4. Click **Run Analysis**
5. Watch all 3 models respond, then read the Llama 3 verdict

---

## Models Used

| Role | Model | Provider | Via |
|------|-------|----------|-----|
| Model A | GPT-3.5 Turbo | OpenAI | OpenRouter |
| Model B | Gemini 1.5 Flash | Google | Direct API |
| Model C | Claude Haiku | Anthropic | OpenRouter |
| Judge | Grok 3 Mini | xAI | OpenRouter |

---

## How the Judge Works

The backend sends this to Grok:

```
User Prompt: [your input]

GPT-3.5 Response (latency: Xms): [response]
Gemini Response (latency: Xms): [response]
Claude Response (latency: Xms): [response]

Evaluate on: correctness, clarity, complexity_handling, overall
Return JSON with scores, winner, verdict, individual_analysis, recommendation
```

Grok returns structured JSON which is parsed and displayed in the Judge Panel.

---

## Tech Stack

- **Frontend**: React 18, React Router 6, Tailwind CSS, Axios
- **Backend**: Node.js, Express, JWT, bcryptjs
- **Theme**: Dark/Light via Tailwind `darkMode: 'class'`
- **Auth**: JWT stored in localStorage, verified on every protected route
- **Rate limiting**: 100 req/15min global, 20 analyses/hour per IP

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `401 Unauthorized` | Check `JWT_SECRET` in `.env` and restart backend |
| Model returns error | Check `OPENROUTER_API_KEY` has credits; try the OpenRouter dashboard |
| Gemini fails | Check `GEMINI_API_KEY` is valid and Gemini 1.5 Flash is available in your region |
| CORS error | Make sure backend is on port 5000 and `proxy` in frontend `package.json` points there |
| `npm start` crashes | Run `npm install` first in both `backend/` and `frontend/` directories |
