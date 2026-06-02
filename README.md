# Magic Script

**The evidence-based multilingual AI content studio for health, fitness, wellness, nutrition and medical creators.**

Create viral health content backed by real science — generate medically responsible content in 7 languages, with every claim verified against PubMed, NIH, WHO, FDA and ClinicalTrials.gov.

> Think *"Perplexity AI for health creators."*

---

## ✨ Highlights

- **Scientific Verification Engine** — confidence score, evidence-strength, consensus, misinformation-risk and source cards before any content is written.
- **Multilingual Creator Mode** — native-voice output in **English, Tamil, Tanglish, Hindi, Malayalam, Telugu & Kannada**. Tamil/Tanglish read like a real creator wrote them — never literal translation.
- **Generation Studio** — split layout: content tabs (hooks, reel/shorts scripts, carousel, caption, CTA, thumbnail titles, hashtags) on the left, a sticky Scientific Verification panel on the right.
- **Safety System** — detects dangerous "cure" claims, blocks diagnosis/prescription, hardens verdicts and reframes misinformation responsibly.
- **One-click language switching** + side-by-side comparison of up to 3 languages.
- **Premium UI** — dark-first, glassmorphism, soft glows, Framer Motion animations, fully responsive.
- **Admin console** — users, generations, flagged claims, MRR, API usage charts and a content moderation queue.

## 🧱 Tech stack

- **Next.js 14** (App Router) · **React 18**
- **Tailwind CSS** · **Framer Motion** · **Recharts** · **lucide-react**
- **Supabase** (auth + Postgres) — schema in [`supabase/schema.sql`](supabase/schema.sql)
- **OpenAI** integration-ready ([`src/lib/ai.js`](src/lib/ai.js) + [`src/app/api/generate`](src/app/api/generate))

## 🚀 Getting started

```bash
npm install
npm run dev
```

Open **http://localhost:3000**.

The app runs fully in **demo mode** with rich mock data — no API keys required.

### Try it

1. **Landing page** → `/`
2. **Sign up / log in** → `/signup` (any email works)
   - Log in with an email starting with **`admin@`** to unlock the **Admin Console**.
3. **Dashboard** → `/dashboard` — type a topic (e.g. *Ashwagandha*, *Does turmeric cure cancer?*).
4. Watch the verification engine score the science, then explore the multilingual content tabs.

## 🔌 Going live (optional)

Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase auth + database |
| `OPENAI_API_KEY` | Routes generation through a live model |

Then run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor.
The verification/safety layer always runs server-side, so the safety engine is never bypassed.

## 📁 Structure

```
src/
  app/            Routes — landing, auth, dashboard, generate, admin, api
  components/     landing · auth · dashboard · generation · admin · ui
  lib/            languages · research-data · generator · ai · mock-data · auth
supabase/
  schema.sql      users · generations · saved_content · citations
                  subscriptions · flagged_content · usage_logs
```

## ⚖️ Responsible use

Magic Script is a **content tool, not a medical provider**. It never diagnoses, prescribes
or replaces professional medical advice. Every generation ships with a consult-a-professional
disclaimer.
