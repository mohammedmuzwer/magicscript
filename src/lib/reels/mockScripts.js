// Mock script generation for demo mode (no API key required)

export function generateMockScripts(topic, contentTypeId, bucketId) {
  const t = topic || "visceral fat";

  return {
    cinematic: generateCinematic(t, contentTypeId),
    education: generateEducation(t, contentTypeId),
    rebel: generateRebel(t, contentTypeId),
  };
}

function generateCinematic(topic, type) {
  const isMyth = type === "myth-buster";
  return `[0–3s] HOOK
AUDIO: "உங்க ${topic} problem fix ஆகல... because your body doesn't want it to. Yet."
VISUAL: Close-up of a frustrated face staring at a health app showing no progress
SUBTITLE: [TEXT OVERLAY: "Why nothing is working"]

[4–10s] CONTEXT
AUDIO: "Most people blame their diet. Doctors blame their effort. But the real answer is buried in a 2022 study most GPs never read."
VISUAL: Montage of food tracking apps, salads, and frustrated gym sessions

[11–35s] CONFLICT / FACT ESCALATION
AUDIO: "A meta-analysis published in the Journal of Clinical Endocrinology found that ${isMyth ? "the conventional approach fails 78% of the time" : topic + " affects 1 in 3 Indian adults — most don't know they have it"}. The reason isn't willpower. It's biology. Your body has a set point — a weight it actively defends. When you crash diet, cortisol spikes, ghrelin surges, and your metabolism slows by up to 23%. You're fighting your own hormones."
VISUAL: Split screen — brain scan showing hormonal activity on left, person eating salad on right. Text bubbles pop up: CORTISOL ↑ GHRELIN ↑ METABOLISM ↓

[36–50s] REFRAME / REVELATION
AUDIO: "So the fix isn't eating less. It's eating smarter. Protein at every meal. Sleep before midnight. And walking — yes, just walking — 20 minutes after dinner lowers post-meal blood sugar by 31%."
VISUAL: Creator to camera, calm and confident. Simple text cards appear behind: PROTEIN ✓ SLEEP ✓ WALK ✓

[51–60s] EMOTIONAL CTA
AUDIO: "Save this video and send it to someone still blaming themselves. The problem isn't them — it's the advice they were given."
VISUAL: Creator nods to camera. Soft glow fade out.
SUBTITLE: [TEXT OVERLAY: "It's not your fault. It's the advice."]`;
}

function generateEducation(topic, type) {
  const isFaq = type === "faq-explainer";
  return `[HOOK — 0-3s]
SCRIPT: "${isFaq ? `Everyone asks: does ${topic} actually work? Here's what 47 studies actually say.` : `97% of people dealing with ${topic} are making the same mistake — and it's not what you think.`}"
[TEXT OVERLAY: "${isFaq ? "47 Studies Analyzed" : "97% Are Doing It WRONG"}"]

[POINT 1 — 4-18s]
SCRIPT: "Point 1: The timing matters more than the amount. A 2021 study in Cell Metabolism showed that doing the same action at the wrong time of day reduced effectiveness by 40%."
[TEXT OVERLAY: "#1 — TIMING > QUANTITY"]

[POINT 2 — 19-33s]
SCRIPT: "Point 2: Inflammation is the hidden blocker. If your CRP levels are above 3, your body physically cannot respond normally to standard interventions. Most doctors don't test this."
[TEXT OVERLAY: "#2 — CHECK YOUR CRP"]

[POINT 3 — 34-48s]
SCRIPT: "Point 3 — and this one will surprise you. The cheapest fix works better than the expensive one. Walking 20 minutes after dinner outperforms a 60-minute gym session for ${topic} management. Published in Diabetologia, 2023."
[TEXT OVERLAY: "#3 — WALK > GYM (for this)"]

[CTA — 49-60s]
SCRIPT: "Save this. Share it with someone who's been struggling for months. They deserve better information."
[TEXT OVERLAY: "Save → Share → Change Someone's Life"]`;
}

function generateRebel(topic, type) {
  const isContrarian = type === "contrarian";
  return `[0–5s] CHALLENGE
SCRIPT: "${isContrarian ? `Your doctor is wrong about ${topic}. Not because they're bad doctors — because the guidelines are 15 years old.` : `Everyone's talking about ${topic} but nobody's telling you the part that actually matters.`}"
[TEXT OVERLAY: "${isContrarian ? "Your Doctor Is Using Outdated Info" : "The Part Nobody Tells You"}"]
TONE NOTE: Direct eye contact, calm confidence — not aggressive

[6–25s] EXPOSE
SCRIPT: "The standard advice says: reduce X, increase Y, take this supplement. Sounds logical. But here's the problem — that advice was based on a 2007 study with 200 participants. In 2023, a 40,000-person cohort study in Nature Medicine completely reversed those findings. The medical community knows. The guidelines haven't caught up."
[TEXT OVERLAY: "2007 Study: 200 people | 2023 Study: 40,000 people"]
TONE NOTE: Building momentum, slightly leaning forward

[26–48s] PROOF
SCRIPT: "The 2023 Nature Medicine study found that the real driver of ${topic} isn't what we thought. It's the combination of sleep quality and meal timing — not the food itself. Researchers from Harvard Medical School followed participants for 3 years. The ones who changed only their meal timing — without changing what they ate — showed 34% better outcomes than those who followed the traditional diet plan."
[TEXT OVERLAY: "Harvard, 2023 — 34% better outcomes"]
TONE NOTE: Measured, credible — cite the source clearly

[49–60s] DARE
SCRIPT: "இதை உங்க family doctor கிட்ட காட்டுங்க. என்ன சொல்றாங்கன்னு comments-ல போடுங்க. I want to know."
[TEXT OVERLAY: "Show This To Your Doctor →"]
TONE NOTE: Playful challenge, direct smile at camera`;
}

export function generateMockMedCheck(topic) {
  const score = Math.floor(Math.random() * 30) + 65; // 65–95
  const isSafe = score >= 70;
  return {
    evidence_score: score,
    safety_status: isSafe ? "safe" : "caution",
    flagged_claims: isSafe ? [] : [`Avoid absolute claims about "${topic}" reversing conditions`],
    suggested_rephrases: isSafe ? {} : {
      [`${topic} cures diabetes`]: `${topic} may help improve insulin sensitivity in some individuals`,
    },
    pubmed_references: [
      `${topic} and metabolic health: a systematic review (2022) - PMID: 35127832`,
      `Dietary interventions in insulin resistance: evidence from RCTs (2023) - PMID: 36891245`,
      `South Asian populations and cardiometabolic risk: WHO data (2021) - PMID: 34012198`,
    ],
    safety_note: `Keep claims framed as tendencies, not guarantees. Recommend consulting a healthcare professional for personal guidance.`,
  };
}

export function generateMockExpansion(word) {
  return [
    {
      angle: `The hidden danger of ${word} most ignore`,
      hook_preview: `You've been thinking about ${word} completely wrong.`,
      type: "myth",
      virality_score: 9,
    },
    {
      angle: `${word} and your daily habits — the link`,
      hook_preview: `What everyday habits are secretly affecting your ${word}?`,
      type: "problem",
      virality_score: 7,
    },
    {
      angle: `Science of ${word} — simplified in 60 seconds`,
      hook_preview: `Here's what 47 studies on ${word} actually found.`,
      type: "education",
      virality_score: 8,
    },
  ];
}
