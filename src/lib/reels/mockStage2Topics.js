// Doctor Farmer Validation Engine v2 — Mock Stage 2 Topic Data
//
// 5 categories: myth (3 false + 2 true), problem, faq, contrarian, clinical
// Keyword Anchoring: every topic carries anchor_type A | B | C
//
// 4-Criterion Formula (normalised to 100):
//   Final = Math.round(((D×0.35 + S×0.40 + CG×0.20 + F×0.20) / 115) × 100)
//
// Verdicts: 70–100 APPROVED · 50–69 REFRAME REQUIRED · 0–49 REJECTED

function pick(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function dfScore(d, s, cg, f) {
  const raw = d * 0.35 + s * 0.40 + cg * 0.20 + f * 0.20;
  return Math.round((raw / 115) * 100);
}

function cap(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// anchor: "A" | "B" | "C"
// anchor_note: one line showing the connection
// dr/sr/cgr/fr: [min, max] score ranges

const T = {

  // ── MYTH: 3 false + 2 true ─────────────────────────────────────────────────
  myth: {
    false_myth: [
      {
        sfx:         "is completely safe for diabetics — the blood sugar truth your doctor skipped",
        desc:        "Debunks the dangerous belief that fasting is always safe for diabetics. High alarm + doctor authority makes this an immediate family-share reel.",
        anchor:      "A", anchor_note: "Keyword appears directly in title",
        dr:[82,90], sr:[90,97], cgr:[74,84], fr:[92,98],
      },
      {
        sfx:         "lowers blood sugar automatically — what actually happens inside your body",
        desc:        "Challenges the assumption that fasting always reduces blood sugar. Counterintuitive science creates strong comment and save behaviour.",
        anchor:      "A", anchor_note: "Keyword appears directly in title",
        dr:[80,88], sr:[88,95], cgr:[76,84], fr:[88,95],
      },
      {
        sfx:         "is the best way to lose weight for diabetics — what the research actually shows",
        desc:        "Breaks down why weight-loss-focused fasting misses the insulin reversal goal. Direct funnel to MHS lifestyle reversal program.",
        anchor:      "A", anchor_note: "Keyword appears directly in title",
        dr:[78,86], sr:[86,93], cgr:[72,82], fr:[86,93],
      },
    ],
    true_myth: [
      {
        sfx:         "actually protects against insulin resistance — here is the evidence doctors miss",
        desc:        "Validates what many patients suspect but cannot confirm. 'My doctor told me fasting was dangerous' creates enormous comment hunger.",
        anchor:      "A", anchor_note: "Keyword appears directly in title",
        dr:[80,88], sr:[88,95], cgr:[78,86], fr:[90,96],
      },
      {
        sfx:         "during Karthigai and Ekadasi actually improves your sugar numbers — here is why",
        desc:        "Religious fasting intersection. Tamil Nadu WhatsApp groups forward this within minutes. Zero competition from non-doctor creators on this specific angle.",
        anchor:      "C", anchor_note: "Cultural intersection — Karthigai/Ekadasi fasting is a direct South Indian form of the keyword",
        dr:[76,84], sr:[92,98], cgr:[86,94], fr:[94,99],
      },
    ],
  },

  // ── PROBLEM + SOLUTION: 5 topics ──────────────────────────────────────────
  // Every problem topic includes the fix — scripts follow Hook → Problem → Why Ignored → The Fix
  problem: [
    {
      sfx:         "is silently destroying your pancreas — and the 3-step protocol to reverse it",
      desc:        "PROBLEM: Beta-cell damage from wrong protocols is underdiagnosed. THE FIX: Dr. Raj's 3-step reversal protocol. Highest family-forward share potential — alarm + actionable solution.",
      anchor:      "A", anchor_note: "Keyword appears directly in title",
      dr:[82,90], sr:[92,98], cgr:[76,86], fr:[92,97],
    },
    {
      sfx:         "is why your medication dose keeps increasing — and how to stop it today",
      desc:        "PROBLEM: Wrong protocol causes worsening numbers. THE FIX: Specific timing adjustment patients can implement immediately. Creates urgency + opens natural door to MHS consultation.",
      anchor:      "B", anchor_note: "Medication dose increase is a direct consequence of improper protocol — stated in description",
      dr:[80,88], sr:[90,96], cgr:[74,84], fr:[90,97],
    },
    {
      sfx:         "done the wrong way resets your insulin resistance daily — here is how to fix it",
      desc:        "PROBLEM: Common habit silently undoing your progress every morning. THE FIX: Simple window adjustment with South Indian meal timing that any patient can follow. High save rate.",
      anchor:      "B", anchor_note: "Insulin resistance reset is a direct physiological consequence — fix is a timing change",
      dr:[78,86], sr:[88,94], cgr:[78,86], fr:[88,94],
    },
    {
      sfx:         "is pushing your HbA1c in the wrong direction — and the 2-step correction",
      desc:        "PROBLEM: HbA1c worsening despite 'doing everything right'. THE FIX: 2-step protocol adjustment Dr. Raj uses with his patients. Every diabetic tracking HbA1c will save this.",
      anchor:      "B", anchor_note: "HbA1c worsening is a documented consequence — 2-step correction is the solution",
      dr:[76,84], sr:[88,94], cgr:[80,88], fr:[90,96],
    },
    {
      sfx:         "during Ramadan is harming more diabetics than it helps — safe protocol inside",
      desc:        "PROBLEM: Unsupervised fasting during Ramadan causes glucose crashes. THE FIX: Dr. Raj's safe Ramadan protocol for diabetics. Extremely high WhatsApp share in Muslim South Indian audience.",
      anchor:      "C", anchor_note: "Ramadan is a direct religious cultural form of the keyword — South Indian Muslim audience",
      dr:[78,86], sr:[94,99], cgr:[84,92], fr:[94,99],
    },
  ],

  // ── FAQ: 5 topics ──────────────────────────────────────────────────────────
  faq: [
    {
      sfx:         "— can you really reverse Type 2 diabetes without lifelong medication?",
      desc:        "The single most-searched question by newly diagnosed Indian diabetics. Doctor answering this with patient outcome data = maximum save and consultation inquiry trigger.",
      anchor:      "B", anchor_note: "Medication reversal through lifestyle change is the primary goal of therapeutic fasting — connection explicit",
      dr:[86,93], sr:[90,96], cgr:[72,82], fr:[92,98],
    },
    {
      sfx:         "— is intermittent fasting actually safe for South Indian diabetics?",
      desc:        "Trending IF question with South Indian cultural weight — rice-eating patterns, late dinners, and festival eating make IF more complex for this audience than global advice suggests.",
      anchor:      "A", anchor_note: "Keyword appears directly in title — intermittent fasting is a form of the keyword",
      dr:[88,94], sr:[92,97], cgr:[74,84], fr:[92,98],
    },
    {
      sfx:         "— what happens to your body during Karthigai / Ekadasi / Navratri if you are diabetic?",
      desc:        "Religious fasting and diabetes safety is searched every single festival season. No doctor has made a comprehensive Tamil Nadu-specific reel on this. Competition gap = near zero.",
      anchor:      "C", anchor_note: "Karthigai/Ekadasi/Navratri are direct South Indian religious forms of the keyword",
      dr:[84,92], sr:[94,99], cgr:[88,96], fr:[96,100],
    },
    {
      sfx:         "— what should I eat to break my fast if I am a South Indian diabetic?",
      desc:        "Breaking fast correctly is the most-asked practical question by IF beginners. South Indian foods (idli, dosa, rice) make this uniquely specific — no generic content answers this well.",
      anchor:      "A", anchor_note: "Keyword appears directly — breaking fast is a direct component of fasting practice",
      dr:[82,90], sr:[90,96], cgr:[80,88], fr:[90,97],
    },
    {
      sfx:         "— how long should a diabetic fast and when should they stop immediately?",
      desc:        "Safety boundaries question. Patients want specific numbers from a doctor. Generic sources give no concrete answer. Doctor Farmer's clinical protocol fills this gap precisely.",
      anchor:      "A", anchor_note: "Keyword appears directly in title — fasting duration and safety are core fasting questions",
      dr:[80,88], sr:[88,94], cgr:[78,86], fr:[90,96],
    },
  ],

  // ── CONTRARIAN: 5 topics ───────────────────────────────────────────────────
  contrarian: [
    {
      sfx:         "is making your diabetes worse — what the wellness industry hides from you",
      desc:        "Directly challenges mainstream IF promotion. Shocking position that will generate comments from every IF advocate. The debate = algorithm push.",
      anchor:      "A", anchor_note: "Keyword appears directly in title",
      dr:[80,88], sr:[92,98], cgr:[76,86], fr:[88,94],
    },
    {
      sfx:         "one lifestyle shift outperforms 3 medications — my 600 patient reversals prove it",
      desc:        "Combines patient outcome data with lifestyle reversal claim. Only a doctor with patient data can say this. Highest DF Fit of any contrarian angle.",
      anchor:      "B", anchor_note: "Lifestyle reversal is the primary mechanism by which therapeutic fasting creates outcome — connection explicit",
      dr:[82,90], sr:[90,96], cgr:[74,84], fr:[92,98],
    },
    {
      sfx:         "the way your yoga instructor told you to fast is wrong — here is the science",
      desc:        "Targets the enormous overlap between yoga/wellness culture and fasting in South India. Doctor vs wellness instructor authority = high comment and share.",
      anchor:      "A", anchor_note: "Keyword appears directly in title",
      dr:[76,84], sr:[90,96], cgr:[82,90], fr:[86,93],
    },
    {
      sfx:         "skip breakfast advice is dangerous for South Indian diabetics — and here is why",
      desc:        "Challenges the global IF trend of skipping breakfast specifically in the South Indian context where breakfast timing affects insulin cycles differently.",
      anchor:      "A", anchor_note: "Skipping breakfast is a direct form of fasting — keyword derivative stated explicitly",
      dr:[78,86], sr:[88,95], cgr:[80,88], fr:[88,95],
    },
    {
      sfx:         "more does not mean better — the safe upper limit your doctor should have told you",
      desc:        "Challenges the 'fast longer for better results' culture. Clinical safety limits for diabetics = unique doctor authority that no fitness influencer can provide.",
      anchor:      "A", anchor_note: "Keyword appears directly in title — fasting duration is a core fasting parameter",
      dr:[74,82], sr:[86,93], cgr:[80,88], fr:[86,93],
    },
  ],

  // ── CLINICAL DEEP DIVE: 5 topics ──────────────────────────────────────────
  clinical: [
    {
      sfx:         "for Indian diabetics — what the 2024 research actually proves beyond the hype",
      desc:        "Research translation specifically for Indian metabolic physiology. No generic creator can cite India-specific studies. Zero competition from non-doctors on this angle.",
      anchor:      "A", anchor_note: "Keyword appears directly in title",
      dr:[80,88], sr:[82,90], cgr:[90,97], fr:[92,98],
    },
    {
      sfx:         "— what I tell my 1,000+ Tamil Nadu patients who ask me this every single day",
      desc:        "Patient community authority format. Only a doctor with a real clinical practice can speak from this position. MHS community recognition drives saves and comment engagement.",
      anchor:      "A", anchor_note: "Keyword appears directly in title",
      dr:[78,86], sr:[86,93], cgr:[88,95], fr:[94,100],
    },
    {
      sfx:         "works differently for South Indians — the rice-insulin connection doctors skip",
      desc:        "South Indian rice-eating metabolic profile creates a different fasting response than Western research predicts. This gap is completely unaddressed in existing content.",
      anchor:      "B", anchor_note: "Rice-insulin connection is a direct metabolic consequence of fasting in South Indian dietary context — stated explicitly",
      dr:[76,84], sr:[84,92], cgr:[92,98], fr:[90,97],
    },
    {
      sfx:         "the clinical protocol I use at My Health School — exactly what I prescribe and why",
      desc:        "Direct MHS program content. Highest possible funnel value. Only Dr. Prabhakar can describe his own clinical protocol. Saves are extremely high — people use this as a reference guide.",
      anchor:      "A", anchor_note: "Keyword appears directly in title",
      dr:[72,80], sr:[84,92], cgr:[92,98], fr:[96,100],
    },
    {
      sfx:         "the three types of patients who should never fast — a doctor's safety list",
      desc:        "Safety contraindication list. Only a medical doctor can provide this with authority. Extremely high save rate — people screenshot this to show their own doctors. No competition gap.",
      anchor:      "A", anchor_note: "Keyword appears directly in title — contraindications are a core clinical aspect of fasting",
      dr:[74,82], sr:[90,96], cgr:[90,97], fr:[94,99],
    },
  ],
};

export function generateMockStage2Topics(keyword) {
  const kw = (keyword || "health").trim().toLowerCase();

  function build(items) {
    return items.map((t) => {
      const d  = pick(t.dr[0],  t.dr[1]);
      const s  = pick(t.sr[0],  t.sr[1]);
      const cg = pick(t.cgr[0], t.cgr[1]);
      const f  = pick(t.fr[0],  t.fr[1]);
      return {
        title:           cap(`${kw} ${t.sfx}`),
        description:     t.desc,
        anchor_type:     t.anchor,
        anchor_note:     t.anchor_note,
        demand:          d,
        social:          s,
        competition_gap: cg,
        fit:             f,
        score:           dfScore(d, s, cg, f),
      };
    });
  }

  return {
    myth: {
      false_myth: build(T.myth.false_myth),
      true_myth:  build(T.myth.true_myth),
    },
    problem:    build(T.problem),
    faq:        build(T.faq),
    contrarian: build(T.contrarian),
    clinical:   build(T.clinical),
  };
}
