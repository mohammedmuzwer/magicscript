// Mock data for all 10 podcast pipeline stages (demo mode)

export const MOCK_STAGE1_TOPICS = [
  {
    id: 1,
    title: "Why Belly Fat is Harder to Lose After 40 — And What Actually Works",
    score: 84,
    demand: 22, social: 26, competitionGap: 17, doctorFit: 19,
    weakness: "High competition from fitness influencers with generic content",
    reframe: "Angle on hormonal shift post-40 — a doctor's clinical view vs. gym advice",
    verdict: "proceed",
    whyNow: "Search volume for 'belly fat after 40' up 34% MoM. Audience frustration with standard diet advice is peaking.",
  },
  {
    id: 2,
    title: "The Hidden Connection Between Poor Sleep and Diabetes Risk",
    score: 78,
    demand: 19, social: 24, competitionGap: 16, doctorFit: 19,
    weakness: "Broad topic — needs a sharp angle to cut through",
    reframe: "Focus on the 3 AM cortisol spike mechanism — visual and dramatic",
    verdict: "proceed",
    whyNow: "Sleep-diabetes co-search trending. WHO data on India's diabetes surge drives high save rates.",
  },
  {
    id: 3,
    title: "Is Ghee Actually Good for You? What Indian Research Actually Says",
    score: 91,
    demand: 24, social: 28, competitionGap: 19, doctorFit: 20,
    weakness: "Subject has been covered — must win on authority and Indian data",
    reframe: "Lead with ICMR study vs. Western demonisation of ghee — myth-buster format",
    verdict: "proceed",
    whyNow: "Ghee debate evergreen in Indian health space. ICMR Q1 data gives fresh authority peg.",
  },
  {
    id: 4,
    title: "Metformin for Weight Loss — Should Non-Diabetics Take It?",
    score: 62,
    demand: 16, social: 19, competitionGap: 13, doctorFit: 14,
    weakness: "Pharma-adjacent — needs careful framing to avoid off-label interpretation",
    reframe: "Reframe as 'why doctors are watching this molecule' — science curiosity angle",
    verdict: "reframe",
    whyNow: "Longevity community driving search. Needs medical authority framing only a doctor can provide.",
  },
  {
    id: 5,
    title: "What Your HbA1c Number Is Really Telling You",
    score: 73,
    demand: 20, social: 22, competitionGap: 14, doctorFit: 17,
    weakness: "Technical — needs story-based entry to hook non-diabetic audience",
    reframe: "Open with 'You can be diabetic for 5 years without knowing it' — fear → relief arc",
    verdict: "proceed",
    whyNow: "Post-festival season sugar spikes drive HbA1c search. Diagnosis anxiety content performs well.",
  },
];

// Legacy (kept for fallback compatibility)
export const MOCK_STAGE2 = {
  topic: "Is Ghee Actually Good for You? What Indian Research Actually Says",
  angle: "Lead with the ICMR findings that contradict Western demonisation of ghee. Use a myth-buster structure with Dr. Prabhakar's clinical experience of thousands of students who improved their lipid profiles after reintroducing ghee.",
  episodeType: "Myth-Buster",
  estimatedRuntime: "28–32 minutes",
};

// ── Stage 2 Topic Lock mock data ──────────────────────────────────────────────
const PILLAR_TEMPLATES = {
  Myth: [
    {
      name: "Truth First",
      commits: "Lead with what the evidence genuinely shows BEFORE addressing the myth — the correction is grounded in evidence, not assertion.",
      stage3_impact: "Questions must include 'what does the research actually show?' before any myth questions — evidence discovery precedes myth discovery.",
      stage4_impact: "Research must find the positive evidence first, then trace the myth's origin — not the other way around.",
      stage6_impact: "Every myth answer opens with the correct position and its source, then names the myth and corrects it — never lead with the wrong belief.",
      stage8_impact: "Script structure must present evidence before the myth correction in every myth-busting segment — the correction lands harder after the truth is established.",
    },
    {
      name: "Myth Named",
      commits: "State the specific wrong belief explicitly and clearly — the audience must recognise the exact myth they have believed, not a vague version of it.",
      stage3_impact: "Myth questions must state the myth verbatim as the audience believes it — not a paraphrase but the exact belief being corrected.",
      stage4_impact: "The Myth Ledger entry must include the exact phrasing of the myth as patients state it — word-for-word, not sanitised.",
      stage6_impact: "Answer writer must quote the myth before correcting it — the audience must feel recognised before they feel corrected.",
      stage8_impact: "Myth-busting segment opens with the myth stated boldly — then demolished with evidence. Never soften the myth statement.",
    },
    {
      name: "South Indian Anchored",
      commits: "The myth correction must be grounded in Indian dietary context — ICMR data, Indian metabolic research, and Tamil Nadu patient outcomes — not Western guidelines applied generically.",
      stage3_impact: "Include at least one question about the South Indian cultural practice or food directly connected to this myth.",
      stage4_impact: "Prioritise ICMR, AIIMS, and Indian Journal of Endocrinology sources over Western guidelines for every claim.",
      stage6_impact: "Every correction includes a South Indian food, practice, or cultural reference the Tamil Nadu audience immediately recognises.",
      stage8_impact: "Script opens with a South Indian cultural or food reference before the myth correction to create immediate audience recognition.",
    },
    {
      name: "Reversal Bridge",
      commits: "Connect the corrected information honestly to the lifestyle reversal pathway — myth correction opens the door to what actually works, and that door leads to MHS.",
      stage3_impact: "Questions must include at least one 'what actually works then?' question so the reversal pathway has content to draw from.",
      stage4_impact: "Research must include evidence for the positive lifestyle intervention, not just the myth disproof — the replacement belief must be evidenced.",
      stage6_impact: "Final answer in the myth section must bridge to the reversal approach — not just 'the myth is wrong' but 'and here is what works instead.'",
      stage8_impact: "Script must close the myth segment with a reversal bridge pointing toward MHS — the correction is the door, the reversal pathway is what is behind it.",
    },
  ],
  Problem: [
    {
      name: "Problem Revealed",
      commits: "Show the hidden problem fully and clearly before any solution is offered — the audience must feel the weight of the problem before the fix is given.",
      stage3_impact: "First three questions must build the problem picture — no solution questions until the problem is fully established.",
      stage4_impact: "Research must verify the clinical reality and prevalence of the problem first — solution evidence comes second.",
      stage6_impact: "Problem section answers must be complete before solution section begins — no solution content bleeding into the problem revelation.",
      stage8_impact: "Script must not mention any solution until the Discovery segment closes — the problem must land fully and completely before the fix appears.",
    },
    {
      name: "Patient Evidence",
      commits: "Ground the problem in real patient observation or clinical data — 'I see this in my patients' is more credible and more shareable than 'studies show' for this audience.",
      stage3_impact: "Include at least one question framed as 'how common is this really?' to anchor the patient evidence section.",
      stage4_impact: "Blue clinical experience data from Dr. Prabhakar is actively sought alongside published research — patient observation is primary evidence, not supplementary.",
      stage6_impact: "At least one answer must include a patient observation framed as clinical experience (Blue-tagged) — real patient story, not just statistics.",
      stage8_impact: "Script includes a patient observation or clinical story in the Discovery segment — a real moment from Dr. Prabhakar's practice.",
    },
    {
      name: "Warning Specific",
      commits: "Name exactly who is at risk and the precise consequence — not a general warning. Specific people, specific conditions, specific outcomes.",
      stage3_impact: "Questions must include 'who specifically is most at risk?' — the specificity question is non-negotiable for this pillar.",
      stage4_impact: "Research must find risk-stratification data for specific subgroups — not just general population warnings.",
      stage6_impact: "Warning answers must name specific patient types and specific risks — 'Type 2 diabetics on metformin' not 'some diabetics.'",
      stage8_impact: "Script includes a named-risk statement the audience can self-identify with — the viewer must be able to say 'that is me.'",
    },
    {
      name: "Action Clear",
      commits: "Close with one specific thing the viewer can do TODAY — not 'see a doctor' and not a vague lifestyle recommendation.",
      stage3_impact: "Final question must be 'what can I do about this starting today?' to ensure actionable content is generated.",
      stage4_impact: "Research must verify the specific actionable intervention with evidence — the action step must be evidence-grounded.",
      stage6_impact: "Final answer must include a specific, immediate, safe action step — not a professional referral as the only advice.",
      stage8_impact: "Script closes the episode with the action step before the CTA — the last clinical content is what the viewer does next.",
    },
  ],
  FAQ: [
    {
      name: "Question Honoured",
      commits: "Answer the exact question the audience asked — not a nearby easier question. The content is built for the specific question, not a paraphrase.",
      stage3_impact: "Questions must be phrased as the audience actually asks them — verbatim from search autocomplete or comment sections, not tidied up.",
      stage4_impact: "Research must verify the specific claim in the specific question — not adjacent claims about the same broad topic.",
      stage6_impact: "Answer writer must open by acknowledging the exact question before answering it — recognition before the answer.",
      stage8_impact: "Script uses the audience's own question phrasing — the scroll-stop moment is the recognition of their exact words.",
    },
    {
      name: "India Specific",
      commits: "Answer in the Indian context — South Indian rice-based diet, ICMR guidelines, Indian BMI thresholds, and Indian metabolic patterns must be addressed where they differ from Western defaults.",
      stage3_impact: "Include at least one question specific to Indian food or Indian lifestyle that changes the answer from the Western default.",
      stage4_impact: "ICMR and NIN sources must be checked alongside PubMed for every major claim — Indian data is not optional.",
      stage6_impact: "Every answer notes where Indian data differs from Western data — the difference is named explicitly, not glossed over.",
      stage8_impact: "Script includes at least one India-specific contextualisation per major claim — 'for a South Indian eating rice twice a day, this means...'",
    },
    {
      name: "Nuance Protected",
      commits: "Never over-simplify. If the answer is 'it depends,' the episode says so and explains what it depends on specifically — FAQs fail when they pretend complex topics are simple.",
      stage3_impact: "Include 'does it depend on the type of diabetes, medication, or age?' type questions to surface the nuance.",
      stage4_impact: "Research must capture the conditions under which the answer changes — not just the most common case.",
      stage6_impact: "Answers include at least one 'it depends on...' qualification with the specific conditions named — nuance is structural, not optional.",
      stage8_impact: "Script includes a nuance moment where Dr. Prabhakar names what the generic answer misses — 'What no one tells you is that it depends on...'",
    },
    {
      name: "Next Step Clear",
      commits: "End with what the viewer should DO with this answer — not just the information. The question is answered and then converted into an action.",
      stage3_impact: "Final question is always 'what should I do with this information?' to ensure actionable content follows the answer.",
      stage4_impact: "Research includes evidence for the recommended next action — the action step must be evidence-grounded.",
      stage6_impact: "Final answer closes with a specific next step for the viewer — the action is named, not implied.",
      stage8_impact: "Script closes the FAQ section with an action bridge into the CTA — the audience leaves with something to do, not just something they know.",
    },
  ],
  Contrarian: [
    {
      name: "Claim Upfront",
      commits: "State the contrarian position in the first 15 seconds — no building to it slowly. The surprise must land immediately or the audience scrolls past.",
      stage3_impact: "First question must set up the contrarian claim directly — the opening of Stage 3 work frames the surprise, not the setup.",
      stage4_impact: "Research must verify the contrarian position first, before gathering supporting context — the claim drives the research agenda.",
      stage6_impact: "Opening answer states the contrarian claim before any explanation — the claim is the first thing spoken.",
      stage8_impact: "Script cold-open is the contrarian claim — no warm-up before it. The first words must surprise the audience.",
    },
    {
      name: "Evidence Grounded",
      commits: "The contrarian position is backed by data — studies, patient outcomes, Indian research, or clinical observation. Contrarian without evidence is clickbait. Doctor Farmer does not do clickbait.",
      stage3_impact: "Include 'what does the research actually show?' as a core question — the evidence question is non-negotiable for this category.",
      stage4_impact: "Must find minimum two credible sources supporting the contrarian position — if two cannot be found, the angle must be adjusted to what the evidence actually supports.",
      stage6_impact: "Every contrarian claim is followed immediately by its evidence — claim and source appear in the same breath, never separated.",
      stage8_impact: "Script never lets a contrarian claim stand alone without its source in the same beat — evidence is structurally inseparable from the claim.",
    },
    {
      name: "Mainstream Fair",
      commits: "The mainstream position is represented fairly before it is challenged — the audience must feel heard and the mainstream view respected before the contrarian pivot.",
      stage3_impact: "Include 'why do most people believe [mainstream position]?' as a question — the mainstream view is examined, not dismissed.",
      stage4_impact: "Research the mainstream position's evidence base — understand what supports it before challenging it.",
      stage6_impact: "One answer presents the mainstream view with empathy, then pivots — 'Here is what most doctors believe — and here is why' before the challenge.",
      stage8_impact: "Script has a fair-witness segment before the contrarian pivot — the mainstream position is given its moment before it is challenged.",
    },
    {
      name: "Action Bridge",
      commits: "The contrarian insight leads to something useful for the audience — specifically toward the lifestyle reversal pathway and MHS. Surprise without action is entertainment. Surprise with action is transformation.",
      stage3_impact: "Final question is 'what should I do differently now?' — the contrarian insight must generate a specific action, not just a changed belief.",
      stage4_impact: "Research must include the positive intervention, not just the challenge to mainstream advice — what to do instead must be evidenced.",
      stage6_impact: "Final answer converts the contrarian insight into a specific action — the surprise leads somewhere useful, not just to a changed mind.",
      stage8_impact: "Script closes the contrarian segment with a reversal bridge to MHS — the surprise is the door, the lifestyle reversal pathway is what is behind it.",
    },
  ],
  "Clinical Deep Dive": [
    {
      name: "Evidence Exact",
      commits: "Named studies with specific numbers — not 'research shows.' Every claim cites a specific paper, year, and finding at the standard of 'A 2024 ICMR study of 300 Indian Type 2 diabetics found...'",
      stage3_impact: "Questions must include 'what does the specific research show?' — not general 'is this good or bad?' questions that allow vague answers.",
      stage4_impact: "Research must return named studies with specific data points — summaries without citations are not acceptable for this category.",
      stage6_impact: "Every answer cites its specific source inline — the study name and finding appear in the same sentence, not in a footnote.",
      stage8_impact: "Script includes study references naturally in Dr. Prabhakar's speaking voice — specific but conversational. 'A study from AIIMS in 2023 found...' not 'studies show.'",
    },
    {
      name: "India Lens",
      commits: "Every piece of Western research is filtered through the Indian metabolic lens — rice-based diet, South Indian eating patterns, Indian BMI thresholds, genetic insulin resistance patterns.",
      stage3_impact: "Include India-specific questions alongside global science questions — the Indian context is explicitly asked for, not assumed.",
      stage4_impact: "ICMR and NIN checked for every major claim; Western studies flagged where Indian applicability is uncertain — uncertainty is surfaced, not suppressed.",
      stage6_impact: "Every Western finding is contextualised for the Indian audience in the same answer — the contextualisation is structural, not a footnote.",
      stage8_impact: "Script has at least one India-specific contextualisation per major clinical point — 'For a Tamil Nadu diabetic eating rice twice a day, this finding means...'",
    },
    {
      name: "Honest Uncertainty",
      commits: "Where the evidence is weak, mixed, or absent, the episode says so explicitly — Doctor Farmer's credibility comes from intellectual honesty, not from pretending certainty where none exists.",
      stage3_impact: "Include 'where is the evidence weak or missing?' as a question — the uncertainty question is non-negotiable for this category.",
      stage4_impact: "Yellow and Red flags are not hidden — they are surfaced prominently and the weak-evidence areas are listed explicitly for Stage 6.",
      stage6_impact: "Answers include 'where we do not yet have good evidence on this' as a section when warranted — the honest uncertainty is named, not buried.",
      stage8_impact: "Script includes a 'what we don't know yet' moment — this builds more trust than pretending everything is proven. Dr. Prabhakar says it plainly.",
    },
    {
      name: "Patient Practical",
      commits: "Every scientific point has a practical implication for a Tamil Nadu diabetic patient — the science serves the patient, the patient does not serve the science.",
      stage3_impact: "Final questions translate science to action: 'what does this mean for what I eat, do, or avoid?' — patient-implication questions close every science sequence.",
      stage4_impact: "Research must include practical application evidence, not just mechanism evidence — what changes for a patient as a result of this finding.",
      stage6_impact: "Every answer closes with what it means for the patient — the 'so what for a 50-year-old Tamil Nadu Type 2 diabetic' is mandatory.",
      stage8_impact: "Script alternates between the science and its patient implication throughout — never three consecutive clinical points without a patient bridge.",
    },
  ],
};

const AUDIENCE_PORTRAITS = {
  Myth: {
    primary: "A 54-year-old Tamil Nadu housewife who has been cooking with ghee for 30 years but switched to vegetable oil after her husband's diabetes diagnosis — now confused by conflicting information from her doctor, her son, and Instagram.",
    secondary: "A 48-year-old Type 2 diabetic man on metformin who follows Doctor Farmer but is unsure whether the health habits he grew up with are actually helping or hurting him.",
    forward_sharer: "An adult child of a diabetic parent who follows Doctor Farmer on Instagram and forwards reels to the family WhatsApp group when a myth directly affects their parents' daily food choices — the bridge between Doctor Farmer and 10+ family members who will never search for it themselves.",
  },
  Problem: {
    primary: "A 58-year-old Tamil Nadu man whose HbA1c has been worsening for 18 months despite following his doctor's advice — increasingly frustrated and starting to wonder if there is a hidden reason his numbers are not improving.",
    secondary: "A 46-year-old woman recently diagnosed with pre-diabetes who is actively searching for anything she can do immediately to reverse the trajectory before it becomes full Type 2.",
    forward_sharer: "A caregiver — spouse or adult child — of a diabetic patient who is the one actually managing the day-to-day food, exercise, and medication schedule and will share warning content immediately because the threat feels real and personal.",
  },
  FAQ: {
    primary: "A 52-year-old Tamil Nadu woman managing her husband's Type 2 diabetes at home, who has a specific unanswered question she has been unable to get a clear answer to from any doctor, website, or previous content she has consumed.",
    secondary: "A newly diagnosed Type 2 diabetic aged 45 who is in the research phase — absorbing as much information as possible before his next consultation — and who saves content that gives clinical precision.",
    forward_sharer: "An adult child of a diabetic parent who follows Doctor Farmer and forwards FAQ content to the family WhatsApp group specifically because it answers questions the family has been unable to get clear answers to from their own doctor.",
  },
  Contrarian: {
    primary: "A 50-year-old Type 2 diabetic who has been following mainstream advice for 3 years with disappointing results and is increasingly open to the idea that something in the standard advice may be wrong.",
    secondary: "A 42-year-old pre-diabetic who is health-informed, follows multiple health creators, and specifically values content that challenges consensus — uses contrarian medical content to form better questions at doctor visits.",
    forward_sharer: "A health-aware adult child who shares contrarian medical content to generate conversation in the family about whether the parents should reconsider something in their current treatment or lifestyle approach.",
  },
  "Clinical Deep Dive": {
    primary: "A 49-year-old Tamil Nadu professional who has been managing Type 2 diabetes for 4 years, has done their research, and is specifically looking for Indian clinical data that goes beyond the generic Western advice they have been receiving.",
    secondary: "A medical or paramedical professional (pharmacist, nurse, dietitian) in South India who follows Doctor Farmer for clinical depth and saves deep-dive content as a reference for patient education.",
    forward_sharer: "An educated adult child of a diabetic parent who actively researches on their parent's behalf and forwards clinical deep-dive content specifically to prove a point to a sceptical family member or to inform their parent's next doctor visit.",
  },
};

const SIGNALS_TEMPLATES = {
  Myth: {
    stage3: {
      prioritise: [
        "Questions phrased as 'Is [topic] actually good or bad?' — these are the exact questions that keep the myth alive and must be the primary discovery targets.",
        "Questions where the audience already suspects the mainstream advice is wrong — 'Why do doctors say X when my grandmother/traditional practice says Y?' formats.",
        "Questions from diabetic and PCOD audiences who experience direct personal impact from this myth in their daily food choices.",
      ],
      avoid: "Generic 'what is [topic]?' or 'how does [topic] work?' information questions that address the topic as abstract knowledge rather than as a lived myth the audience actively believes.",
      cultural_angle: "A question about the specific South Indian food, cooking practice, or religious fasting context where this myth most directly affects Tamil Nadu household decisions today.",
    },
    stage4: {
      evidence_type: "ICMR and Indian Journal of Endocrinology sources that directly address the specific myth in an Indian population — Indian metabolic data is more credible to this audience than Western guidelines.",
      indian_sources: "ICMR-NIN Dietary Guidelines, AIIMS Indian metabolic research, and any published South Indian population study that speaks directly to the myth being corrected.",
      blue_experience: "Dr. Prabhakar's specific clinical observation of what happened to MHS students or patients when they corrected this myth — patient outcomes with numbers if available, clinical narrative if not.",
      red_flag: "Watch for overclaimed 'studies show' language on both sides — both the myth and the correction can be overstated. Flag any claim that uses small pilot studies to make population-level conclusions.",
    },
    stage5: {
      sequencing_logic: "Open with the myth as a question the audience believes is true — create the recognition moment before the correction. Sequence: myth identification → evidence correction → practical implication → MHS reversal bridge.",
      myth_question_to_protect: "The question that states the primary myth verbatim as the audience currently believes it — this is the recognition moment and must not be dropped, softened, or paraphrased.",
    },
    stage6: {
      tone_constraint: "Never correct a myth without explaining why it became so widely believed in the first place — the audience needs to feel understood before they feel corrected. Empathy before evidence.",
      structure_constraint: "Every myth answer must follow: (1) correct position with source, (2) myth named explicitly, (3) why it spread, (4) South Indian specific context — in that order, every time.",
    },
    stage7: {
      demonstration_idea: "A side-by-side comparison prop or whiteboard showing 'what the myth says' versus 'what the ICMR / NIN actually recommends' — a physical object Dr. Prabhakar can hold or point to.",
      cta_timing: "After the myth-busting block closes and before the Practical segment — the CTA lands at peak clarity when the audience has just had a belief corrected and is most receptive to next steps.",
      superfood_suggestion: "A South Indian food that the myth incorrectly demonised or that the corrected evidence actively endorses — the superfood segment directly reinforces the myth correction made in the episode.",
    },
    stage8: {
      cold_open: "Open with the exact myth stated as a belief the audience holds — not 'many people think' but 'you have probably been told that...' — personal recognition in the first 15 seconds.",
      closing: "Close with the reversal bridge — not a summary of what was said but a specific next step using the new information. The last thing heard is what the viewer does, not what they learned.",
      pillar_check: "Truth First → Science segment. Myth Named → Opening myth-busting beat. South Indian Anchored → Discovery and Science segments. Reversal Bridge → Closing segment before CTA.",
    },
    stage9: {
      follow_up_topic: "A follow-up reel on the practical reversal pathway this myth correction opens — showing what actually works now that the wrong belief has been removed. The correction creates demand for the solution.",
      best_reel_moment: "The moment where Dr. Prabhakar states the myth exactly as the audience believes it and pivots to the evidence — the recognition-then-correction beat is the single most shareable moment in any myth episode.",
    },
  },
  Problem: {
    stage3: {
      prioritise: [
        "Questions that reveal the hidden or underappreciated nature of the problem — 'Why doesn't my doctor tell me about this?' or 'How would I even know if I had this problem?'",
        "Questions from patients whose numbers are not improving despite compliance — this audience is most at risk and most receptive to a problem-reveal episode.",
        "Questions about specific risk factors — 'am I at higher risk because of [specific condition / medication / age / diet]?' to build the warning-specific content.",
      ],
      avoid: "Solution-first questions like 'what should I take for this?' or 'what is the best treatment?' — these questions must not appear until the problem has been fully established.",
      cultural_angle: "A question about the specific South Indian food pattern, lifestyle habit, or medication management practice that makes Tamil Nadu patients particularly susceptible to this hidden problem.",
    },
    stage4: {
      evidence_type: "Patient prevalence data and clinical incidence figures for the specific problem — how common it is in Indian diabetic populations. Numbers make the hidden problem feel real.",
      indian_sources: "ICMR, Indian Journal of Diabetes, and Chennai-based or Tamil Nadu-specific clinical studies where available — local data has more impact than global statistics for this audience.",
      blue_experience: "Dr. Prabhakar's direct clinical observation of how often he sees this problem in his Tamil Nadu patient population — frequency data from MHS intake assessments if available.",
      red_flag: "Watch for alarmist overclaiming — the problem must be real and documented, not exaggerated. Any claim that overstates risk without evidence must be flagged Yellow or Red.",
    },
    stage5: {
      sequencing_logic: "Build the problem picture completely before introducing any solution — sequence: problem revelation → patient evidence → who is specifically at risk → what the consequence is → only then: what to do.",
      myth_question_to_protect: "The question that names who is specifically at risk — this is the self-identification moment where the viewer recognises themselves in the warning and must not be dropped.",
    },
    stage6: {
      tone_constraint: "Never soften the problem to protect the audience's comfort — the audience needs to feel the weight of the problem to be motivated. Clarity is kindness here, not alarming.",
      structure_constraint: "Every problem answer must close with the patient implication before moving to the next point — 'what this means for a Tamil Nadu Type 2 diabetic specifically' is mandatory in each answer.",
    },
    stage7: {
      demonstration_idea: "A visual showing the timeline or progression of the hidden problem — a before/after chart or a simple diagram Dr. Prabhakar can draw on a whiteboard showing what happens when this goes undetected.",
      cta_timing: "After the Warning Specific segment closes — when the viewer has identified the risk and is asking 'what do I do about this?' the CTA for the MHS program lands with maximum relevance.",
      superfood_suggestion: "A South Indian food that directly addresses the biological mechanism behind the problem — one the audience already has at home but may not know has clinical relevance to this specific risk.",
    },
    stage8: {
      cold_open: "Open with the consequence of the hidden problem — a patient observation or clinical scenario that makes the audience ask 'could this be happening to me?' in the first 15 seconds.",
      closing: "Close with the one specific action the viewer can take today — before the CTA, the last clinical content is the action step. Make it specific, immediate, and safe to do without a doctor visit.",
      pillar_check: "Problem Revealed → Opening and Discovery segments. Patient Evidence → Discovery segment. Warning Specific → dedicated named-risk segment. Action Clear → closing segment before CTA.",
    },
    stage9: {
      follow_up_topic: "A follow-up reel that goes deeper on the specific action step introduced at the close — the problem episode creates demand for 'how to actually fix this' content.",
      best_reel_moment: "The named-risk statement — the moment where Dr. Prabhakar names exactly who is at risk and what the specific consequence is. Self-identification moments are the most saved and shared.",
    },
  },
  FAQ: {
    stage3: {
      prioritise: [
        "Questions phrased exactly as the audience searches them — autocomplete phrasing, not tidied-up versions. The recognition value is in the exact wording.",
        "Follow-up questions that commonly appear after the primary question is answered — 'what about if I am also on insulin?' or 'does it change if I am Type 1?' reveal what the audience still does not understand.",
        "Questions from South Indian–specific contexts that reveal the local variant — what does this question mean for someone eating rice twice a day, cooking with coconut oil, fasting for Ekadasi?",
      ],
      avoid: "Questions that drift to adjacent topics not asked by the audience — the FAQ discipline requires answering the exact question, not a nearby question that is easier or safer to answer.",
      cultural_angle: "A question about how the answer applies specifically to a Tamil Nadu diabetic — the South Indian diet, cooking practices, or religious fasting patterns that change the answer from the Western default.",
    },
    stage4: {
      evidence_type: "India-specific clinical studies that answer the exact question in an Indian population — the answer for a South Indian diabetic may differ significantly from the Western default.",
      indian_sources: "ICMR, NIN, and the Indian Journal of Endocrinology checked specifically for this question — any Indian population data that makes the answer more or less applicable to Tamil Nadu patients.",
      blue_experience: "Dr. Prabhakar's direct experience of how hundreds of MHS patients have asked and acted on this exact question — what the real-world outcome was when patients followed the common advice.",
      red_flag: "Watch for 'yes/no' oversimplifications — the most common overclaim in FAQ topics is a definitive answer where the honest answer is 'it depends.' Any binary answer must be scrutinised.",
    },
    stage5: {
      sequencing_logic: "Lead with the exact question verbatim — do not paraphrase. Sequence: exact question acknowledged → direct answer → conditions and qualifications → South Indian specifics → action step.",
      myth_question_to_protect: "The question that asks about the most common misconception embedded in the FAQ topic — the secondary belief the audience holds about this question that must be corrected alongside the direct answer.",
    },
    stage6: {
      tone_constraint: "Never give a yes/no answer without immediately stating what it depends on — the audience deserves the complexity, presented clearly. Oversimplification fails the patient.",
      structure_constraint: "Every answer must close with a specific next step — the question is answered and then converted into an action. Information without an action step leaves the audience passive.",
    },
    stage7: {
      demonstration_idea: "A visual comparison showing two scenarios — 'the answer for this patient type' versus 'the answer for that patient type' — a whiteboard or on-screen graphic that makes the nuance visible and memorable.",
      cta_timing: "After the nuance segment — when the viewer has understood that the answer depends on their specific situation, the CTA for a personalised consultation or MHS assessment lands with maximum relevance.",
      superfood_suggestion: "A South Indian food directly relevant to the FAQ topic — one that either supports the correct answer or that the FAQ question is implicitly about.",
    },
    stage8: {
      cold_open: "Open with the question stated in the audience's own exact words — 'Patients ask me this every single day. Here is my honest clinical answer.' Recognition first, then the answer.",
      closing: "Close with the specific action the viewer should take with this information — not a summary of the answer but the next step. The audience leaves knowing what to do, not just what is true.",
      pillar_check: "Question Honoured → cold open and primary answer segment. India Specific → contextualisation segment. Nuance Protected → 'it depends' segment. Next Step Clear → closing action segment.",
    },
    stage9: {
      follow_up_topic: "A follow-up reel that goes deeper on the most complex 'it depends' condition revealed in this episode — for viewers who want the full clinical nuance on their specific situation.",
      best_reel_moment: "The nuance moment — where Dr. Prabhakar explains what the generic yes/no answer misses and names the specific conditions that change the answer. This is the 'save and share to my diabetic parent' moment.",
    },
  },
  Contrarian: {
    stage3: {
      prioritise: [
        "Questions that reveal the gap between mainstream advice and patient experience — 'I followed the advice but it did not work' questions that validate the contrarian position from the audience's lived experience.",
        "Questions about what the research actually shows — the contrarian position must be evidence-backed and Stage 3 must find the questions that the evidence answers.",
        "Questions from competitor comment sections where the audience already doubts the mainstream advice — this is unmet demand for the contrarian position already present in the audience.",
      ],
      avoid: "Questions that assume the mainstream position is correct — framing questions around 'why is X the best approach?' pre-validates the mainstream advice that this episode is challenging.",
      cultural_angle: "A question about how mainstream advice has specifically failed South Indian patients — the Tamil Nadu cultural context (diet, lifestyle, medication patterns) that makes the mainstream failure particularly visible here.",
    },
    stage4: {
      evidence_type: "Peer-reviewed studies that support the contrarian position — minimum two credible sources. If two cannot be found, the angle must be adjusted to what the evidence actually supports, not expanded with weak evidence.",
      indian_sources: "Indian patient outcome data that supports the contrarian claim — domestic clinical evidence is more credible to this audience than Western studies when challenging mainstream advice.",
      blue_experience: "Dr. Prabhakar's direct MHS patient outcome data that contradicts the mainstream position — real numbers from the Tamil Nadu patient community are the strongest contrarian evidence available.",
      red_flag: "Watch for the contrarian claim being supported only by low-quality evidence — case reports, single studies, or overclaimed mechanisms. The contrarian position must be more evidence-solid than the mainstream, not less.",
    },
    stage5: {
      sequencing_logic: "Lead with the contrarian claim stated directly — then sequence: mainstream position acknowledged fairly → evidence for the contrarian claim → implication for the audience → action step. The claim is first, not last.",
      myth_question_to_protect: "The question that presents the mainstream position so it can be fairly represented and then challenged — this is the 'fair witness' question that establishes Doctor Farmer's intellectual honesty before the challenge.",
    },
    stage6: {
      tone_constraint: "Represent the mainstream position fairly and accurately before challenging it — the audience must feel the mainstream view was respected, not strawmanned. Intellectual honesty is the contrarian brand.",
      structure_constraint: "Every contrarian claim must be followed immediately by its evidence in the same answer — the claim and the source are structurally inseparable. Claim-then-source is the non-negotiable format.",
    },
    stage7: {
      demonstration_idea: "A visual showing the evidence Doctor Farmer is citing versus what the mainstream advice cites — two stacks of research or a graphic comparing outcomes. The visual makes the evidence feel tangible.",
      cta_timing: "Immediately after the contrarian claim lands with its evidence — when the viewer is most surprised and most receptive. Before the fair witness segment, not after. Surprise creates attention; attention creates conversions.",
      superfood_suggestion: "A South Indian food or ingredient that the contrarian position rehabilitates or recommends — one that mainstream advice incorrectly restricted and that Doctor Farmer's evidence defends.",
    },
    stage8: {
      cold_open: "Open with the contrarian claim directly and boldly — 'I am a doctor. I am supposed to tell you X. But after treating 600+ patients, here is what I actually see.' The claim is the cold open.",
      closing: "Close with the action step that follows from the contrarian insight — not a debate summary but the specific lifestyle or clinical implication. What should the viewer do differently starting today?",
      pillar_check: "Claim Upfront → cold open. Evidence Grounded → Science segment. Mainstream Fair → fair-witness segment before the pivot. Action Bridge → closing segment pointing to MHS.",
    },
    stage9: {
      follow_up_topic: "A follow-up reel that translates the contrarian insight into a practical protocol — the surprise creates demand for 'so what do I do instead?' The follow-up answers that question specifically.",
      best_reel_moment: "The moment where Dr. Prabhakar states the mainstream advice that everyone expects him to endorse — and then pivots to the evidence that contradicts it. The pivot is the shareable moment.",
    },
  },
  "Clinical Deep Dive": {
    stage3: {
      prioritise: [
        "Questions that specifically ask about studies, evidence, or research — 'what does the science say about [topic]?' This audience wants clinical depth, not general advice.",
        "Questions that reveal where existing content on this topic is shallow or generic — the gaps in available answers are the exact opportunity for the clinical deep dive to fill.",
        "Questions specific to Indian patients, Indian food contexts, and South Indian metabolic patterns that Western clinical content does not address.",
      ],
      avoid: "General 'is this good or bad?' questions that allow vague answers — the clinical deep dive demands specific evidence questions, not opinion-inviting questions.",
      cultural_angle: "A question about how the clinical findings apply specifically to a Tamil Nadu diabetic's daily life — the rice-based diet, South Indian cooking practices, or Indian metabolic patterns that change what the global research means locally.",
    },
    stage4: {
      evidence_type: "Named studies with specific numbers and years — 'A 2024 study in the Indian Journal of Endocrinology found X in N patients' is the minimum standard. No unnamed research.",
      indian_sources: "ICMR, NIN, AIIMS, and Indian Journal of Endocrinology checked for every major claim. Every Western study must be flagged with a note on whether its findings apply to Indian metabolic patterns.",
      blue_experience: "Dr. Prabhakar's clinical observation data from the MHS Tamil Nadu patient community — frequency, outcomes, or pattern data that validates or contextualises the published research with local evidence.",
      red_flag: "Watch for mechanism-only claims without outcome data — a mechanism that sounds credible does not mean the intervention works. All mechanism claims must be matched with outcome evidence or clearly labelled as mechanism-only.",
    },
    stage5: {
      sequencing_logic: "Sequence from most searched and practical to most clinical and nuanced — begin where the audience already is, then bring them deeper. The practical questions come first; the mechanism questions come after.",
      myth_question_to_protect: "The question that asks where the evidence is weak or missing — the honest uncertainty question. This is the trust-building moment of the clinical deep dive and must not be dropped.",
    },
    stage6: {
      tone_constraint: "Always name the study before the finding — 'Researchers at [institution] found...' not 'research shows...' The specificity is the credibility. Generic 'studies show' language is not acceptable in a clinical deep dive.",
      structure_constraint: "Every answer must alternate between the scientific finding and its patient-level implication — never three consecutive clinical points without a patient bridge. Science serves the patient, not the other way around.",
    },
    stage7: {
      demonstration_idea: "A visual showing the specific mechanism being discussed — a diagram of the biological process, a chart comparing Indian versus Western population data, or a prop that makes the clinical finding tangible.",
      cta_timing: "After the 'what we don't know yet' segment — when the viewer has just heard intellectual honesty about uncertainty, the CTA for a personalised consultation lands with maximum credibility. Honest uncertainty makes the offer of personalised guidance more valuable.",
      superfood_suggestion: "A South Indian food with documented clinical evidence directly relevant to the deep dive topic — one where Dr. Prabhakar can cite a specific study connecting the food to the mechanism being discussed.",
    },
    stage8: {
      cold_open: "Open with the specific clinical question and why Doctor Farmer's patient data gives him a unique position to answer it — 'I treat 1,000+ Tamil Nadu diabetics and here is what the data from my own practice shows alongside the published research.'",
      closing: "Close with the patient-level protocol — not a research summary but the specific takeaway for a Tamil Nadu diabetic viewer who just heard the evidence. What do they do with this research starting today?",
      pillar_check: "Evidence Exact → Science segment (named studies throughout). India Lens → contextualisation segment. Honest Uncertainty → 'what we don't know' segment. Patient Practical → closing protocol segment.",
    },
    stage9: {
      follow_up_topic: "A follow-up reel that translates the most actionable finding from this clinical deep dive into a practical 60-second guide — for viewers who want to act on the research immediately without rewatching the full episode.",
      best_reel_moment: "The honest uncertainty moment — where Dr. Prabhakar says plainly 'here is where the evidence is weak and what we do not yet know.' This is the most shareable moment because it is the most unexpected from a doctor.",
    },
  },
};

/**
 * Generate a full Stage 2 Topic Lock document for a given topic.
 * Falls back to Myth templates if category is not matched.
 */
export function generateMockStage2Lock(topicData) {
  const title    = topicData?.title   ?? MOCK_STAGE2.topic;
  const score    = topicData?.score   ?? 84;
  const reframe  = topicData?.reframe ?? null;
  const weakness = topicData?.weakness ?? null;

  // Infer category from topic/verdict (rough heuristic for demo mode)
  let category = "Myth";
  if (topicData?.verdict === "drop")     category = "FAQ";
  if (title.toLowerCase().includes("science") || title.toLowerCase().includes("research"))
    category = "Clinical Deep Dive";
  if (title.toLowerCase().includes("why") && title.toLowerCase().includes("wrong"))
    category = "Contrarian";
  if (title.toLowerCase().includes("silent") || title.toLowerCase().includes("hiding") || title.toLowerCase().includes("destroying"))
    category = "Problem";

  const pillars  = PILLAR_TEMPLATES[category]   ?? PILLAR_TEMPLATES.Myth;
  const audience = AUDIENCE_PORTRAITS[category] ?? AUDIENCE_PORTRAITS.Myth;
  const signals  = SIGNALS_TEMPLATES[category]  ?? SIGNALS_TEMPLATES.Myth;

  // Build category-specific angle
  const FRAMES = {
    Myth:               "A doctor-led myth correction that separates dangerous misinformation from clinical reality — using Indian research and patient data that generic creators cannot access.",
    Problem:            "A patient-safety-first warning that reveals the hidden consequence most patients and their doctors are missing, grounded in real clinical observation from Tamil Nadu practice.",
    FAQ:                "A direct clinical answer to the question every South Indian diabetic is asking but getting incomplete or wrong information on — delivered with doctor authority and cultural specificity.",
    Contrarian:         "A data-backed challenge to mainstream medical advice that reveals what the wellness industry and standard guidelines obscure — supported by patient outcomes and Indian research.",
    "Clinical Deep Dive": "An evidence-first breakdown of what Indian and global research actually shows — specific studies, specific numbers, and clinical honesty about what is known and what is not.",
  };
  const PROMISES = {
    Myth:               "Viewers will leave knowing exactly what the science says and what it does not say — and why they were told the wrong thing in the first place. They will also understand the specific South Indian context that makes this myth particularly dangerous for Tamil Nadu families.",
    Problem:            "Viewers will leave understanding the hidden problem clearly, who is specifically at risk, and what one specific action they can take today to reduce that risk. They will also understand the clinical mechanism behind the problem — something most online health content never explains.",
    FAQ:                "Viewers will leave with a direct, clinically honest answer to the question they came with — plus the qualifications and conditions that make the answer specific to their situation. They will also understand what to do next with this information.",
    Contrarian:         "Viewers will leave with a specific contrarian position that is scientifically backed — and the evidence they need to evaluate whether it applies to their own situation. They will also understand what to do differently as a result of this new information.",
    "Clinical Deep Dive": "Viewers will leave with a clear, evidence-based understanding of what the research actually shows — including what is certain, what is uncertain, and what it means specifically for a Tamil Nadu diabetic's daily life.",
  };
  const AUTHORITY = {
    Myth:               "Doctor Farmer brings direct clinical experience treating thousands of Tamil Nadu patients who followed this myth for years — and patient outcome data showing what changed when the correction was applied.",
    Problem:            "Doctor Farmer brings 10+ years of treating South Indian diabetics who present with this exact hidden problem — real clinical observation that no fitness influencer or generic health creator can claim.",
    FAQ:                "Doctor Farmer brings the specific experience of answering this exact question in hundreds of MHS consultations — hearing how patients phrase it, what they misunderstand, and what clinical answer actually changes their behaviour.",
    Contrarian:         "Doctor Farmer brings patient reversal outcome data from the MHS program that directly contradicts the mainstream position — real numbers from real Tamil Nadu patients, not theoretical arguments.",
    "Clinical Deep Dive": "Doctor Farmer brings access to the specific Indian research literature and direct patient data from a Tamil Nadu clinical practice that makes this deep dive applicable to South Indian metabolic patterns, not just Western populations.",
  };
  const SAFETY_FLAGS = {
    Myth:               "Safety flag: None — this topic corrects misinformation but carries no direct patient safety risk beyond the harm of continuing to believe the original myth.",
    Problem:            "Safety boundary: patients with the specific conditions named in this episode must not attempt self-management changes without direct medical supervision — and the episode will make this non-negotiable and specific.",
    FAQ:                "Safety boundary: the answer to this question changes significantly for patients on insulin, Type 1 diabetics, and patients with co-morbidities — and these exceptions will be named explicitly.",
    Contrarian:         "Safety boundary: the contrarian position applies to specific patient profiles only — it must not be taken as universal advice, and the episode will name exactly who should and should not apply it.",
    "Clinical Deep Dive": "Safety boundary: clinical research findings apply at a population level — individual patient variation is real, and the episode will clarify which findings require individualised medical assessment before action.",
  };

  const versionLocked = reframe ? "Reframed" : "Original";

  return {
    locked_topic:   title,
    category,
    stage1_score:   score,
    version_locked: versionLocked,
    angle: {
      frame:        FRAMES[category]    ?? FRAMES.Myth,
      promise:      PROMISES[category]  ?? PROMISES.Myth,
      authority:    AUTHORITY[category] ?? AUTHORITY.Myth,
      safety_flag:  SAFETY_FLAGS[category] ?? SAFETY_FLAGS.Myth,
    },
    pillars,
    audience,
    signals,
  };
}

export const MOCK_STAGE3_QUESTIONS = [
  { id: "q1",  type: "audience",  text: "Does ghee increase cholesterol?" },
  { id: "q2",  type: "audience",  text: "Is ghee good for weight loss or does it make you fat?" },
  { id: "q3",  type: "audience",  text: "Can diabetics eat ghee?" },
  { id: "q4",  type: "audience",  text: "How much ghee per day is safe?" },
  { id: "q5",  type: "audience",  text: "Is cow ghee better than buffalo ghee?" },
  { id: "q6",  type: "audience",  text: "What does ICMR say about ghee?" },
  { id: "q7",  type: "audience",  text: "Can ghee improve digestion?" },
  { id: "q8",  type: "audience",  text: "Why did doctors say ghee was bad for the heart?" },
  { id: "q9",  type: "audience",  text: "Is ghee better than olive oil?" },
  { id: "q10", type: "audience",  text: "Should I give ghee to my child?" },
  { id: "q11", type: "audience",  text: "Can ghee help with joint pain?" },
  { id: "q12", type: "audience",  text: "Does cooking in ghee produce harmful chemicals?" },
  { id: "q13", type: "myth",      text: "Ghee is pure fat and will block your arteries — MYTH?" },
  { id: "q14", type: "myth",      text: "Vegetable oils are always healthier than ghee — MYTH?" },
  { id: "q15", type: "myth",      text: "Ghee has no nutritional value beyond fat — MYTH?" },
  { id: "q16", type: "myth",      text: "People with heart disease must completely avoid ghee — MYTH?" },
  { id: "q17", type: "myth",      text: "Low-fat diet is always better than a ghee-inclusive diet — MYTH?" },
];

export const MOCK_STAGE4_RESEARCH = {
  claims: [
    {
      id: "c1",
      question: "q1",
      claim: "Ghee raises LDL cholesterol",
      grade: "YELLOW",
      source: "PubMed",
      citation: "Sharma RD et al. (2019). Dietary fats and lipid profiles: a systematic review. Indian J Clin Biochem. PMID: 30956432",
      note: "Mixed findings — small studies show moderate increase in LDL; larger meta-analyses show no significant effect in the context of a balanced Indian diet. Language must be softened.",
    },
    {
      id: "c2",
      question: "q2",
      claim: "Ghee does not cause weight gain when consumed in moderate quantities (1–2 tsp/day)",
      grade: "GREEN",
      source: "ICMR",
      citation: "ICMR-NIN (2020). Dietary Guidelines for Indians. Chapter 4, Fat intake recommendations. ISBN 978-81-908280-2-8.",
      note: "ICMR explicitly endorses moderate ghee as part of traditional Indian diet without association with weight gain.",
    },
    {
      id: "c3",
      question: "q3",
      claim: "Moderate ghee consumption is safe for type 2 diabetics and may improve glycaemic response",
      grade: "YELLOW",
      source: "PubMed",
      citation: "Jain RB, Mehra R (2021). Effect of clarified butter (ghee) on blood glucose: a pilot trial. J Diabetes Metab Disord. PMID: 34805041",
      note: "Pilot study — small sample. Promising but not definitive. Use 'some studies suggest' framing.",
    },
    {
      id: "c4",
      question: "q4",
      claim: "1–2 teaspoons per day is the safe consumption range for healthy adults",
      grade: "GREEN",
      source: "NIN",
      citation: "National Institute of Nutrition (2020). Dietary Guidelines for Indians. Recommended visible fat intake, p. 62.",
      note: "NIN recommended visible fat intake encompasses traditional ghee use at this level.",
    },
    {
      id: "c5",
      question: "q6",
      claim: "ICMR recommends ghee as part of a balanced traditional Indian diet",
      grade: "GREEN",
      source: "ICMR",
      citation: "ICMR-NIN (2020). Dietary Guidelines for Indians. ISBN 978-81-908280-2-8.",
      note: "Direct ICMR endorsement. Strong claim — can be stated confidently.",
    },
    {
      id: "c6",
      question: "q13",
      mythType: "disproven",
      claim: "Ghee blocks arteries — DISPROVEN by current evidence in the context of moderate use",
      grade: "GREEN",
      source: "PubMed",
      citation: "Dinicolantonio JJ, O'Keefe JH (2018). Saturated fats versus polyunsaturated fats versus carbohydrates for cardiovascular disease prevention. Prog Cardiovasc Dis. PMID: 29174025",
      note: "Modern evidence shows dietary saturated fat from traditional sources does not independently cause arterial plaque in the context of a low-carbohydrate diet.",
    },
    {
      id: "c7",
      question: "q14",
      mythType: "disproven",
      claim: "Refined vegetable oils are NOT universally healthier than ghee",
      grade: "GREEN",
      source: "PubMed",
      citation: "Hamley S (2017). The effect of replacing saturated fat with mostly n-6 polyunsaturated fat on coronary heart disease. Nutr J. PMID: 28423142",
      note: "Solid meta-analytic evidence. Vegetable oils with high omega-6 carry cardiovascular risk. Confident claim.",
    },
    {
      id: "c8",
      question: "q11",
      claim: "Ghee supports joint lubrication via its fat-soluble vitamin D content",
      grade: "BLUE",
      source: "Clinical",
      citation: null,
      note: "Dr. Prabhakar's clinical observation: patients who reintroduced ghee reported reduced joint stiffness. No published paper directly links ghee consumption to joint pain reduction. Frame as clinical experience.",
    },
  ],
  criticPassResult: {
    status: "passed",
    flags: [
      "c3 — Pilot study for diabetics: sample size 47. Graded YELLOW correctly. Confirm softened language in answer.",
      "c8 — Blue claim: clinical experience only. Confirm it is NOT framed as research in the script.",
    ],
  },
  mythLedger: [
    { mythId: "q13", type: "disproven",  claimId: "c6" },
    { mythId: "q14", type: "disproven",  claimId: "c7" },
    { mythId: "q15", type: "unsettled",  evidence: "No peer-reviewed study directly quantifies ghee's non-fat micronutrient value at typical serving sizes.", claimId: null },
    { mythId: "q16", type: "unsettled-clinical", evidence: "No RCT in heart-disease patients on ghee restriction exists.", clinicalVerdict: "In my experience with cardiac patients, total dietary pattern matters far more than excluding ghee alone.", claimId: null },
    { mythId: "q17", type: "disproven",  claimId: "c7" },
  ],
  questionGrades: {
    q1:  "answerable-yellow", q2:  "answerable-green", q3:  "answerable-yellow",
    q4:  "answerable-green",  q5:  "no-source",        q6:  "answerable-green",
    q7:  "answerable-yellow", q8:  "answerable-green",  q9:  "answerable-green",
    q10: "answerable-yellow", q11: "answerable-blue",   q12: "answerable-green",
    q13: "myth-disproven",    q14: "myth-disproven",    q15: "myth-unsettled",
    q16: "myth-unsettled-clinical", q17: "myth-disproven",
  },
};

export const MOCK_STAGE5_ARC = [
  { section: "opening",   questions: ["q8"],       demoTrigger: false },
  { section: "discovery", questions: ["q1", "q2"], demoTrigger: false },
  { section: "science",   questions: ["q4", "q6", "q12"], demoTrigger: true,  demoNote: "DEMO: Show a teaspoon of ghee vs. 1 tsp refined oil — colour, smoke point comparison on table" },
  { section: "myth",      questions: ["q13", "q14", "q17", "q16"], demoTrigger: false },
  { section: "solution",  questions: ["q3", "q10"], demoTrigger: false },
  { section: "practical", questions: ["q7", "q11"], demoTrigger: false },
  { section: "rapidfire", questions: ["q5", "q9"],  demoTrigger: false },
];

export const MOCK_STAGE6_ANSWERS = [
  {
    questionId: "q8",
    section: "opening",
    question: "Why did doctors say ghee was bad for the heart?",
    answer: "Because in the 1960s, a very influential — and later controversial — study told the world that all saturated fat causes heart disease. Ghee, being predominantly saturated fat, got swept into that ban. Doctors followed the guideline. Patients stopped using ghee. Vegetable oil companies boomed. The problem? That study's conclusions have since been revisited, retested, and in many ways contradicted by newer, larger research. So what you believed about ghee — that's not science speaking. That's a 60-year-old guideline that never got properly updated for the Indian plate.",
    grade: "GREEN",
    citation: "Dinicolantonio JJ et al. 2018. PMID 29174025",
    speakingTime: "1 min 10 sec",
  },
  {
    questionId: "q1",
    section: "discovery",
    question: "Does ghee increase cholesterol?",
    answer: "Some studies do show a small increase in LDL — what people call 'bad' cholesterol — when ghee is consumed in large amounts. But here's what those studies don't show you: the same people also showed a rise in HDL, the protective cholesterol. And some studies show no meaningful change at all. The picture is mixed. So if someone tells you 'ghee raises your cholesterol' in a simple sentence, ask them: which cholesterol, how much, in which diet context? Because the answer is not that simple.",
    grade: "YELLOW",
    citation: "Sharma RD et al. 2019. PMID 30956432",
    speakingTime: "55 sec",
    languageNote: "Use softened language — 'some studies suggest' — YELLOW grade",
  },
];

export const MOCK_STAGE7_SEGMENTS = {
  segmentMap: [
    { id: "opening",   label: "Opening Hook",     duration: "2–3 min",  type: "fixed" },
    { id: "discovery", label: "Discovery",         duration: "5–6 min",  type: "flexible" },
    { id: "science",   label: "Science + Demo",    duration: "7–8 min",  type: "flexible" },
    { id: "myth",      label: "Myth-Busting Block",duration: "6–7 min",  type: "flexible" },
    { id: "solution",  label: "Solution",          duration: "4–5 min",  type: "flexible" },
    { id: "superfood", label: "Superfood of the Day — Sesame Seeds", duration: "4 min", type: "signature" },
    { id: "practical", label: "Practical Use Case",duration: "3–4 min",  type: "flexible" },
    { id: "rapidfire", label: "Signature Rapid Fire",duration: "2–3 min",type: "signature" },
  ],
  demonstrations: [
    {
      id: "demo1",
      section: "science",
      type: "table-prop",
      description: "Place one teaspoon of ghee and one teaspoon of refined sunflower oil side by side. Show the colour difference. Then briefly explain smoke point: ghee handles heat, refined oil breaks down at high heat into aldehydes.",
      prop: "Teaspoon of cow ghee (glass jar, visible), teaspoon of refined sunflower oil (clear glass)",
    },
  ],
  superfood: {
    name: "Sesame Seeds (Til)",
    claims: [
      { claim: "Rich in calcium — 100g provides ~975mg calcium", grade: "GREEN", source: "NIN", citation: "NIN Food Composition Tables 2017" },
      { claim: "Sesamin lignan supports healthy estrogen metabolism in menopausal women", grade: "YELLOW", source: "PubMed", citation: "Hirata F et al. 1996. PMID 8870170" },
    ],
    whoShouldTake: "Everyone, especially women over 40, vegetarians (calcium source), and those with joint stiffness",
    whoShouldAvoid: "People with sesame allergy. Those on blood thinners — sesame has mild anticoagulant effects.",
  },
  ctaPoints: [
    { position: "after-discovery", type: "lead-magnet", text: "Download our free 'Healthy Indian Fat Guide' — link in bio" },
    { position: "after-solution", type: "program", text: "If you want a full personalised diet plan built around your health condition, our Diabetes Reversal Program is open for enrolment" },
  ],
  leadMagnet: {
    chosen: "Healthy Indian Fat Guide — 1-page cheatsheet: which fats to use, how much, and when",
    alternatives: [
      "Ghee vs. Oil comparison card for the kitchen",
      "7-day traditional fat meal plan template",
    ],
  },
};

export const MOCK_STAGE8_SCRIPT = {
  totalRuntime: "29 min",
  runSheet: {
    segments: ["Opening Hook (2 min)", "Discovery (5 min)", "Science + Demo (8 min)", "Myth-Busting (7 min)", "Solution (4 min)", "Superfood: Sesame Seeds (4 min)", "Practical Use Case (3 min)", "Rapid Fire (2 min)", "Close (1 min)"],
    props: ["Teaspoon of cow ghee (glass jar)", "Teaspoon of refined sunflower oil", "Sesame seeds in a small bowl"],
    totalRuntime: "~36 min total with transitions",
  },
  scriptBlocks: [
    {
      id: "sb1",
      type: "opening",
      left: "[COLD OPEN]\n\nINTERVIEWER: Doctor, my grandmother cooked everything in ghee. My doctor told me to stop ghee completely. My dietitian said olive oil only. Who is right?\n\nDR. PRABHAKAR: Your grandmother.",
      right: "[CUT TO: Wide 2-shot. DR. PRABHAKAR smiles. Hold for 2 seconds. B-ROLL: Grandmother cooking in clay pot, ghee jar in frame. Warm grade.]",
      grade: null,
    },
    {
      id: "sb2",
      type: "science",
      left: "DR. PRABHAKAR: Let me show you something. [DEMO] This is one teaspoon of cow ghee. This is one teaspoon of refined sunflower oil. Notice the colour. The ghee is golden — that's vitamin A and beta-carotene. The refined oil is colourless — those nutrients were removed during refining. Now, smoke point. Ghee handles 250°C before it breaks down. Refined oil starts producing harmful aldehydes at 180°C. So when you cook on a high flame — which every Indian kitchen does — the refined oil is actually the problem.",
      right: "[DEMO]\n[PROP: Ghee jar + oil glass]\n[B-ROLL: Close-up of teaspoons side by side]\n[GRAPHIC OVERLAY: Smoke point comparison — white screen animation while DR. PRABHAKAR speaks seated]\n[CUE: Editor adds temperature numbers at 180°C and 250°C]",
      grade: "GREEN",
      citation: "ICMR-NIN 2020",
    },
  ],
};

export const MOCK_STAGE9_REELS = [
  {
    id: "r1",
    title: "Grandmother vs. Your Doctor — Who Was Right About Ghee?",
    script: "Your grandmother cooked everything in ghee. Your doctor told you to stop. Your dietitian said olive oil only. Here's what the research actually says: your grandmother was right. And here's why...",
    category: "Myth-Buster (Disproven)",
    cta: "Download the free Healthy Indian Fat Guide — link in bio",
    editingIdeas: "Start with the cold open cut. Hook in first 2 seconds with 'Your grandmother.' — bold on screen. B-roll of traditional cooking, then switch to clinical setting. Fast cut to score.",
    grade: "GREEN",
    sources: ["ICMR-NIN (2020). Dietary Guidelines for Indians.", "Dinicolantonio JJ et al. (2018). PMID 29174025"],
  },
  {
    id: "r2",
    title: "Smoke Point Truth — Why Refined Oil on High Flame Is the Real Problem",
    script: "You switched from ghee to refined vegetable oil to be healthier. But when you cook on high flame — which every Indian kitchen does — refined oil starts producing harmful aldehydes at 180°C. Ghee handles 250°C. You may have made the wrong switch.",
    category: "Science",
    cta: "Full episode on YouTube — link in bio",
    editingIdeas: "Use the demo footage. Side-by-side teaspoon visual is the hook. Show temperature numbers as animated overlay. Short, punchy — under 45 seconds. Strong save-rate potential.",
    grade: "GREEN",
    sources: ["ICMR-NIN (2020). Dietary Guidelines for Indians. Chapter on fats."],
  },
  {
    id: "r3",
    title: "Ghee and Cholesterol — The Answer Is Not What You Think",
    script: "Does ghee raise cholesterol? Some studies say yes — small LDL increase. The same studies also show a rise in HDL, the protective cholesterol. And larger studies show no meaningful change at all. The answer depends on how much you eat and in what diet context. A blanket 'ghee raises cholesterol' is not science. It's a simplification.",
    category: "Science",
    cta: "Save this — share with anyone who's been told to stop ghee",
    editingIdeas: "Text-heavy overlay works here. Show a split screen: small LDL increase on one side, HDL increase on the other. End with 'It's not that simple' on screen. High save-rate format.",
    grade: "YELLOW",
    sources: ["Sharma RD et al. (2019). PMID 30956432 — NOTE: Mixed findings. Use softened language in captions."],
  },
];

export const MOCK_STAGE10_TANGLISH = {
  sampleBlock: {
    original: "Your grandmother cooked everything in ghee. Your doctor told you to stop. Your dietitian said olive oil only. Here's what the research actually says: your grandmother was right.",
    tanglish: "Ungal paati ellathayum ghee-la samaichaanga. Ungal doctor 'stop ghee' nu sonnanga. Dietitian 'olive oil mattum' nu sonnanga. Aana research enna sollutha theriyuma? Ungal paati correct-a irunthanga.",
    notes: "Medical/technical terms kept in English: 'ghee', 'research', 'olive oil', 'dietitian'. Emotional warm tone preserved.",
  },
};

// ── Stage 1 Topic Discovery — demo-mode generator ────────────────────────────

/**
 * Scoring helper: weighted composite of four criteria.
 * d=demand, s=social, cg=competition_gap, f=df_fit (all 0–100 raw scores).
 * Normalises to 0–100 final score.
 */
function dfScore(d, s, cg, f) {
  return Math.round(((d * 0.35 + s * 0.40 + cg * 0.20 + f * 0.20) / 115) * 100);
}

/**
 * Generate 5 topic objects for Stage 1 demo mode.
 * @param {string} keyword  - The seed keyword entered by the user (e.g. "fasting")
 * @returns {Array}         - 5 topic objects sorted by score descending
 */
export function generateMockStage1Topics(keyword) {
  const kw    = (keyword || "fasting").toLowerCase();
  const kwCap = kw.charAt(0).toUpperCase() + kw.slice(1);

  // ── raw criterion scores ──────────────────────────────────────────────────
  const t1 = { demand: 85, social: 88, competition_gap: 74, df_fit: 90 };
  const t2 = { demand: 80, social: 90, competition_gap: 82, df_fit: 88 };
  const t3 = { demand: 82, social: 85, competition_gap: 72, df_fit: 91 };
  const t4 = { demand: 75, social: 92, competition_gap: 85, df_fit: 89 };
  const t5 = { demand: 70, social: 94, competition_gap: 92, df_fit: 96 };

  // ── reframe raw scores ────────────────────────────────────────────────────
  const r1 = { demand: 87, social: 92, competition_gap: 80, df_fit: 93 };
  const r2 = { demand: 83, social: 93, competition_gap: 85, df_fit: 91 };
  const r3 = { demand: 84, social: 88, competition_gap: 79, df_fit: 94 };
  const r4 = { demand: 77, social: 95, competition_gap: 87, df_fit: 92 };
  const r5 = { demand: 72, social: 97, competition_gap: 93, df_fit: 97 };

  const topics = [
    // ── Topic 1 — Myth, Anchor A ────────────────────────────────────────────
    {
      id: 1,
      title: `The Truth About ${kwCap} for Diabetes — What Works, What's Hype`,
      category: "Myth",
      anchor: {
        type: "A",
        note: `Direct keyword — "${kw}" is the primary search term this topic targets`,
      },
      description: `Many diabetics across India have tried ${kw} after seeing viral posts promising blood sugar reversal, but the clinical reality is far more nuanced. This episode separates evidence-backed protocols from social-media hype using ICMR data and Dr. Prabhakar's MHS patient outcomes.`,
      demand:          t1.demand,
      social:          t1.social,
      competition_gap: t1.competition_gap,
      df_fit:          t1.df_fit,
      score: dfScore(t1.demand, t1.social, t1.competition_gap, t1.df_fit),
      verdict: "APPROVED",
      biggest_weakness: {
        criterion: "Competition Gap",
        explanation: "Several Indian health YouTubers have covered this exact angle. The window is narrowing, though no Tamil Nadu doctor with MHS reversal data has owned it conclusively.",
      },
      reframe: {
        title: `${kwCap} Is Destroying Your Pancreas — What 90% of Indian Diabetics Miss`,
        why_stronger: "Problem-reveal format with a specific patient warning creates immediate save-and-share urgency that the original's neutral framing does not.",
        demand:          r1.demand,
        social:          r1.social,
        competition_gap: r1.competition_gap,
        df_fit:          r1.df_fit,
        score: dfScore(r1.demand, r1.social, r1.competition_gap, r1.df_fit),
        delta: dfScore(r1.demand, r1.social, r1.competition_gap, r1.df_fit) - dfScore(t1.demand, t1.social, t1.competition_gap, t1.df_fit),
      },
      verify: {
        ubersuggest:       `${kw} for diabetes India`,
        answer_the_public: `is ${kw} safe for diabetics`,
        google_trends:     `${kw} diabetes India 12 months`,
        seo_trending:      `${kw} diabetes blood sugar`,
        vidiq:             `${kw} for type 2 diabetes`,
        quora:             `Does ${kw} help reverse diabetes in India`,
      },
      opening_line: `"Ungal doctor ${kw} pathi enna sollaanga? Evidence enna sollutha theriyuma?"`,
    },

    // ── Topic 2 — Problem, Anchor B ─────────────────────────────────────────
    {
      id: 2,
      title: `Is ${kwCap} Silently Worsening Your HbA1c?`,
      category: "Problem",
      anchor: {
        type: "B",
        note: `Direct consequence of ${kw} done incorrectly — stated in description`,
      },
      description: `Millions of South Indian diabetics attempt ${kw} based on online advice without understanding its impact on their HbA1c trajectory. When done without medical guidance, certain ${kw} patterns can cause glycaemic variability that actually worsens long-term HbA1c — a silent problem that takes 3–6 months to surface.`,
      demand:          t2.demand,
      social:          t2.social,
      competition_gap: t2.competition_gap,
      df_fit:          t2.df_fit,
      score: dfScore(t2.demand, t2.social, t2.competition_gap, t2.df_fit),
      verdict: "APPROVED",
      biggest_weakness: {
        criterion: "Demand",
        explanation: "Slightly lower search volume compared to generic fasting content — this is a consequence angle, not the primary search term.",
      },
      reframe: {
        title: `What Happens to Your HbA1c When You Fast Wrong — A Doctor's Honest Warning`,
        why_stronger: "Names the exact medical test patients are monitoring, creating direct personal relevance for any diabetic who recently got an HbA1c result.",
        demand:          r2.demand,
        social:          r2.social,
        competition_gap: r2.competition_gap,
        df_fit:          r2.df_fit,
        score: dfScore(r2.demand, r2.social, r2.competition_gap, r2.df_fit),
        delta: dfScore(r2.demand, r2.social, r2.competition_gap, r2.df_fit) - dfScore(t2.demand, t2.social, t2.competition_gap, t2.df_fit),
      },
      verify: {
        ubersuggest:       `${kw} HbA1c effect India`,
        answer_the_public: `does ${kw} affect HbA1c`,
        google_trends:     `HbA1c ${kw} diabetes India`,
        seo_trending:      `${kw} blood sugar HbA1c`,
        vidiq:             `HbA1c worsening ${kw} diabetes`,
        quora:             `Can ${kw} increase HbA1c in type 2 diabetics`,
      },
      opening_line: `"Appadiye ${kw} panna, ungal HbA1c improve aagumnu nenacheenga? I see the opposite in my patients."`,
    },

    // ── Topic 3 — FAQ, Anchor A ─────────────────────────────────────────────
    {
      id: 3,
      title: `Is ${kwCap} Safe for South Indian Diabetics on Medication?`,
      category: "FAQ",
      anchor: {
        type: "A",
        note: `Direct keyword — "${kw} safe diabetics medication" is the exact search this topic captures`,
      },
      description: `This is the single most common question Dr. Prabhakar receives from Tamil Nadu patients who are on metformin or insulin and want to try ${kw}. The answer is not a simple yes or no — it depends on the specific medication, dosage, meal timing, and the patient's current HbA1c level.`,
      demand:          t3.demand,
      social:          t3.social,
      competition_gap: t3.competition_gap,
      df_fit:          t3.df_fit,
      score: dfScore(t3.demand, t3.social, t3.competition_gap, t3.df_fit),
      verdict: "APPROVED",
      biggest_weakness: {
        criterion: "Competition Gap",
        explanation: `3–4 credentialed Indian doctors have made similar FAQ reels. Gap exists for Tamil Nadu–specific medication-safety angle but is narrowing.`,
      },
      reframe: {
        title: `Metformin + ${kwCap}: What Your Doctor Hasn't Told You (Tamil Nadu Patient Data)`,
        why_stronger: "Names the specific medication 80% of the audience is on, combining medication fear with the keyword — the most urgent possible combination for this audience.",
        demand:          r3.demand,
        social:          r3.social,
        competition_gap: r3.competition_gap,
        df_fit:          r3.df_fit,
        score: dfScore(r3.demand, r3.social, r3.competition_gap, r3.df_fit),
        delta: dfScore(r3.demand, r3.social, r3.competition_gap, r3.df_fit) - dfScore(t3.demand, t3.social, t3.competition_gap, t3.df_fit),
      },
      verify: {
        ubersuggest:       `${kw} safe metformin India`,
        answer_the_public: `can diabetics on medication do ${kw}`,
        google_trends:     `${kw} metformin safety Tamil Nadu`,
        seo_trending:      `${kw} diabetes medication safe`,
        vidiq:             `${kw} safe diabetics medication India`,
        quora:             `Is ${kw} safe if I am on metformin for diabetes`,
      },
      opening_line: `"Neenga metformin edukreenga. Somebody told you ${kw} panna sugar control aagumnu. Intha combination safe-a?"`,
    },

    // ── Topic 4 — Contrarian, Anchor B ─────────────────────────────────────
    {
      id: 4,
      title: `Why Your Doctor Telling You to Eat Every 3 Hours Is Keeping You Diabetic`,
      category: "Contrarian",
      anchor: {
        type: "B",
        note: `Direct opposite of ${kw} — the mainstream advice this topic challenges is the anti-${kw} position`,
      },
      description: `The standard diabetes dietary advice — eat small meals every 3 hours to stabilise blood sugar — is the exact opposite of what 600+ MHS patients experienced when they switched to a structured ${kw} protocol. This episode presents the patient data and the mechanism behind why the mainstream advice may be keeping blood sugar high, not low.`,
      demand:          t4.demand,
      social:          t4.social,
      competition_gap: t4.competition_gap,
      df_fit:          t4.df_fit,
      score: dfScore(t4.demand, t4.social, t4.competition_gap, t4.df_fit),
      verdict: "APPROVED",
      biggest_weakness: {
        criterion: "Demand",
        explanation: "Low direct search volume — people do not search for this exact contrarian frame. The virality comes from social share, not search discovery.",
      },
      reframe: {
        title: `"Eat Every 3 Hours" Is Wrong — Here Is What MHS Patient Data From 600 Diabetics Shows`,
        why_stronger: "Anchors the contrarian claim in specific MHS patient data — 600 diabetics is a number no fitness influencer can cite and it converts the contrarian position from opinion to evidence.",
        demand:          r4.demand,
        social:          r4.social,
        competition_gap: r4.competition_gap,
        df_fit:          r4.df_fit,
        score: dfScore(r4.demand, r4.social, r4.competition_gap, r4.df_fit),
        delta: dfScore(r4.demand, r4.social, r4.competition_gap, r4.df_fit) - dfScore(t4.demand, t4.social, t4.competition_gap, t4.df_fit),
      },
      verify: {
        ubersuggest:       `eating every 3 hours diabetes wrong`,
        answer_the_public: `should diabetics eat every 3 hours`,
        google_trends:     `frequent meals diabetes India debate`,
        seo_trending:      `${kw} vs frequent meals diabetes`,
        vidiq:             `eat every 3 hours diabetes myth`,
        quora:             `Is eating every 3 hours actually bad for diabetics`,
      },
      opening_line: `"Ungal doctor 'every 3 hours saapidu' sollaanga. 600 MHS patients la naan opposite result paathaen."`,
    },

    // ── Topic 5 — Cultural/Clinical Deep Dive, Anchor C ────────────────────
    {
      id: 5,
      title: `What Should a Diabetic Do During Karthigai / Ekadasi ${kwCap}?`,
      category: "Clinical Deep Dive",
      anchor: {
        type: "C",
        note: `Keyword intersects directly with South Indian religious fasting practice — Anchor C`,
      },
      description: `Every year, millions of Tamil Nadu diabetics face a genuine clinical dilemma during Karthigai and Ekadasi: their faith calls them to fast, but their condition creates real medication and hypoglycaemia risks. No existing content gives a specific, medically grounded answer for this exact situation from a South Indian doctor.`,
      demand:          t5.demand,
      social:          t5.social,
      competition_gap: t5.competition_gap,
      df_fit:          t5.df_fit,
      score: dfScore(t5.demand, t5.social, t5.competition_gap, t5.df_fit),
      verdict: "APPROVED",
      biggest_weakness: {
        criterion: "Demand",
        explanation: "Search volume is seasonal and spikes only around Karthigai/Ekadasi periods. Content performs explosively during those windows but less outside them.",
      },
      reframe: {
        title: `Karthigai Fasting With Diabetes: The Doctor's Checklist (Save Before the Festival)`,
        why_stronger: "The 'save before the festival' instruction is a direct command that drives saves during the pre-festival window — the most powerful save-trigger for seasonal religious content.",
        demand:          r5.demand,
        social:          r5.social,
        competition_gap: r5.competition_gap,
        df_fit:          r5.df_fit,
        score: dfScore(r5.demand, r5.social, r5.competition_gap, r5.df_fit),
        delta: dfScore(r5.demand, r5.social, r5.competition_gap, r5.df_fit) - dfScore(t5.demand, t5.social, t5.competition_gap, t5.df_fit),
      },
      verify: {
        ubersuggest:       `Karthigai fasting diabetes safe`,
        answer_the_public: `can diabetics fast on Ekadasi`,
        google_trends:     `Karthigai deepam fasting diabetes India`,
        seo_trending:      `religious fasting diabetes Tamil Nadu`,
        vidiq:             `Ekadasi fasting diabetes safety`,
        quora:             `Is it safe for a diabetic to fast during Karthigai or Ekadasi`,
      },
      opening_line: `"Karthigai deepam vanthachu. Ungalukku diabetes irundha enna panna? Enna thinna? Enna avoid panna? Doctor la keka bayama irukka?"`,
    },
  ];

  // Return sorted by score descending
  return topics.sort((a, b) => b.score - a.score);
}

// ── Stage 4 Research — demo-mode generator ───────────────────────────────────

/**
 * Generate a full Stage 4 research brief for demo mode.
 * Uses the ghee-topic question bank (F1-F5, A1-A12, M1-M5) from Stage 3 demo output.
 *
 * @param {Object} stage3Data  - Stage 3 output { foundation, audience, myth, team, all_questions }
 * @returns {Object}           - { claims, myth_ledger, indian_context, critic_pass, confidence_dashboard }
 */
export function generateMockStage4Research(stage3Data) {
  const claims = [
    // ── Foundation ─────────────────────────────────────────────────────────
    {
      id: "c-F1", question_id: "F1",
      question_text: "What is the single most important thing a Tamil Nadu diabetic needs to understand about this topic?",
      claim: "Traditional Indian dietary fats like ghee have been unfairly demonised by guidelines designed for Western population metabolic profiles",
      grade: "GREEN",
      source: "ICMR",
      citation: "ICMR-NIN (2020). Dietary Guidelines for Indians. Chapter 4: Fats and Oils. ISBN 978-81-908280-2-8.",
      note: "ICMR explicitly supports traditional Indian fats including ghee as part of a balanced diet. Direct primary source from the highest Indian dietary authority.",
    },
    {
      id: "c-F2", question_id: "F2",
      question_text: "What does the ICMR / NIN actually say — and how does it differ from what most Indian doctors are still advising?",
      claim: "ICMR recommends visible fat intake of 20–50 g/day for adults, explicitly including traditional fats like ghee — not restriction to refined oils",
      grade: "GREEN",
      source: "ICMR",
      citation: "ICMR-NIN (2020). Dietary Guidelines for Indians. Recommended visible fat intake, p. 62. ISBN 978-81-908280-2-8.",
      note: "Hard primary source. Direct ICMR guideline. Can be stated confidently. The divergence from AHA/Western guidelines is a key credibility moment for Doctor Farmer.",
    },
    {
      id: "c-F3", question_id: "F3",
      question_text: "What is the single biggest mistake you see Tamil Nadu patients making based on your MHS intake data?",
      claim: "Most Tamil Nadu patients have replaced ghee with refined vegetable oils in response to generic low-fat advice — but this switch increases their omega-6 load without improving glycaemic outcomes",
      grade: "BLUE",
      source: "Clinical",
      citation: null,
      note: "Dr. Prabhakar's MHS intake observation. Not a published study. Must be framed as 'In my clinical experience treating X patients, the most common mistake I see is...' Never as research.",
    },
    {
      id: "c-F4", question_id: "F4",
      question_text: "Where is the evidence genuinely weak or missing — what are you honest about not knowing yet?",
      claim: "Long-term RCT data specifically on ghee consumption in Tamil Nadu Type 2 diabetics is absent — most evidence extrapolates from general fat studies",
      grade: "YELLOW",
      source: "PubMed",
      citation: "Jain RB, Mehra R (2021). Effect of clarified butter (ghee) on blood glucose. J Diabetes Metab Disord. PMID: 34805041",
      note: "Honest uncertainty: pilot studies exist but no large Tamil Nadu–specific RCT. This is the episode's intellectual honesty moment — Dr. Prabhakar states what is and is not known.",
      script_rule: "Present this explicitly as 'here is where our evidence is still thin' — do not paper over the gap with mechanism claims or extrapolation",
    },
    {
      id: "c-F5", question_id: "F5",
      question_text: "What is the one specific safe action a viewer can take today without a doctor visit?",
      claim: "Reintroduce 1–2 teaspoons of cow ghee per day with main meals — replacing the equivalent amount of refined vegetable oil used for that meal",
      grade: "GREEN",
      source: "NIN",
      citation: "National Institute of Nutrition (2020). Dietary Guidelines for Indians. Recommended visible fat intake, p. 62.",
      note: "Specific, safe, actionable. NIN-endorsed visible fat intake range supports this as a practical recommendation within guideline limits.",
    },
    // ── Audience questions ──────────────────────────────────────────────────
    {
      id: "c-A1", question_id: "A1",
      question_text: "Does ghee increase cholesterol?",
      claim: "Ghee consumption shows mixed effects on LDL cholesterol — some studies show a small increase, larger meta-analyses show no significant effect in a balanced Indian diet context",
      grade: "YELLOW",
      source: "PubMed",
      citation: "Sharma RD et al. (2019). Dietary fats and lipid profiles: a systematic review. Indian J Clin Biochem. PMID: 30956432",
      note: "Mixed findings. Small studies show moderate LDL increase; larger meta-analyses show no significant effect when ghee is consumed in the context of a balanced traditional Indian diet.",
      script_rule: "Use 'some studies show a mixed picture — some show a small LDL rise, others show no significant change' — NEVER 'research proves ghee raises cholesterol' or 'ghee is safe for your cholesterol'",
    },
    {
      id: "c-A2", question_id: "A2",
      question_text: "Is ghee good for weight loss or does it make you fat?",
      claim: "Moderate ghee consumption (1–2 tsp/day) does not cause weight gain in the context of a balanced Indian diet",
      grade: "GREEN",
      source: "ICMR",
      citation: "ICMR-NIN (2020). Dietary Guidelines for Indians. Chapter 4, Fat intake recommendations. ISBN 978-81-908280-2-8.",
      note: "ICMR endorses moderate ghee as part of a traditional Indian diet without association with weight gain. Direct institutional source. Confident claim.",
    },
    {
      id: "c-A3", question_id: "A3",
      question_text: "Can diabetics eat ghee?",
      claim: "Moderate ghee consumption appears safe for Type 2 diabetics and may improve glycaemic response — pilot evidence only",
      grade: "YELLOW",
      source: "PubMed",
      citation: "Jain RB, Mehra R (2021). Effect of clarified butter (ghee) on blood glucose: a pilot trial. J Diabetes Metab Disord. PMID: 34805041",
      note: "Pilot study — sample size 47. Promising but not definitive. Cannot be presented as clinical certainty for diabetics.",
      script_rule: "Use 'a pilot study suggests moderate ghee may be safe for Type 2 diabetics' — never 'ghee is confirmed safe for all diabetics' and never 'diabetics should eat ghee'",
    },
    {
      id: "c-A4", question_id: "A4",
      question_text: "How much ghee per day is safe?",
      claim: "1–2 teaspoons (5–10 g) per day is the safe consumption range for healthy adults within the ICMR recommended visible fat intake",
      grade: "GREEN",
      source: "NIN",
      citation: "National Institute of Nutrition (2020). Dietary Guidelines for Indians. Recommended visible fat intake, p. 62.",
      note: "NIN recommended visible fat intake (20–50 g/day) encompasses traditional ghee use at this level. Direct institutional source. State confidently.",
    },
    {
      id: "c-A5", question_id: "A5",
      question_text: "Is cow ghee better than buffalo ghee?",
      claim: "Cow ghee has higher CLA and butyric acid content than buffalo ghee and superior vitamin A levels",
      grade: "RED",
      source: "None",
      citation: null,
      note: "No peer-reviewed head-to-head study comparing cow vs buffalo ghee health outcomes was found in PubMed, ICMR, or NIN. Compositional data exists but no clinical outcome evidence — mechanism without outcomes.",
      social_demand: "Extremely high in Tamil Nadu — this is a constant household debate and a question Dr. Prabhakar receives after every episode. High demand means the honest 'we don't have clinical comparison data' answer is more credible than silence or a dropped question.",
    },
    {
      id: "c-A6", question_id: "A6",
      question_text: "What does ICMR say about ghee?",
      claim: "ICMR explicitly recommends ghee as part of a balanced traditional Indian diet in its 2020 Dietary Guidelines",
      grade: "GREEN",
      source: "ICMR",
      citation: "ICMR-NIN (2020). Dietary Guidelines for Indians. ISBN 978-81-908280-2-8.",
      note: "Direct ICMR endorsement. Strongest possible source for this claim. State with full confidence.",
    },
    {
      id: "c-A7", question_id: "A7",
      question_text: "Can ghee improve digestion?",
      claim: "Ghee's butyric acid content supports intestinal epithelial cell health — laboratory and mechanism evidence",
      grade: "YELLOW",
      source: "PubMed",
      citation: "Hamer HM et al. (2008). Review article: the role of butyrate on colonic function. Aliment Pharmacol Ther. PMID: 17973645",
      note: "Solid mechanism evidence for butyric acid in gut lining support. No human RCT specifically on ghee consumption and digestion outcomes at typical serving sizes.",
      script_rule: "Frame as 'the butyric acid in ghee is the same compound that feeds your gut lining cells — the mechanism is well studied' — not 'ghee improves your digestion' as a clinical claim",
    },
    {
      id: "c-A8", question_id: "A8",
      question_text: "Why did doctors say ghee was bad for the heart?",
      claim: "The saturated fat hypothesis (Ancel Keys, 1960s) incorrectly implicated all saturated fats including ghee in cardiovascular disease — this guideline was never specifically validated for Indian populations",
      grade: "GREEN",
      source: "PubMed",
      citation: "Dinicolantonio JJ, O'Keefe JH (2018). Saturated fats versus polyunsaturated fats versus carbohydrates for cardiovascular disease prevention. Prog Cardiovasc Dis. PMID: 29174025",
      note: "Modern meta-analyses have revisited and substantially contradicted the original saturated fat hypothesis. Strong source for the historical correction narrative.",
    },
    {
      id: "c-A9", question_id: "A9",
      question_text: "Is ghee better than olive oil?",
      claim: "Ghee handles higher smoke points (250°C) vs olive oil (190°C) making it safer for Indian high-heat cooking methods",
      grade: "GREEN",
      source: "PubMed",
      citation: "Katragadda HR et al. (2010). Emissions of volatile aldehydes from heated cooking oils. Food Chem. PMID: 19748199",
      note: "Smoke point comparison is well established in food chemistry literature. Directly relevant practical advantage for Indian kitchen context where high-flame cooking is standard.",
    },
    {
      id: "c-A10", question_id: "A10",
      question_text: "Should I give ghee to my child?",
      claim: "Ghee is an appropriate fat source for children as part of a traditional Indian diet — endorsed by ICMR",
      grade: "YELLOW",
      source: "ICMR",
      citation: "ICMR-NIN (2020). Dietary Guidelines for Indians. Chapter on child and adolescent nutrition.",
      note: "General ICMR endorsement for traditional fats in children's diet. No specific paediatric RCT on ghee outcomes.",
      script_rule: "Frame as 'ICMR includes traditional fats like ghee in its dietary guidelines for children' — not 'studies prove ghee is best for children'",
    },
    {
      id: "c-A11", question_id: "A11",
      question_text: "Can ghee help with joint pain?",
      claim: "Patients who reintroduced ghee after avoidance reported reduced morning stiffness — from Dr. Prabhakar's clinical observation",
      grade: "BLUE",
      source: "Clinical",
      citation: null,
      note: "Dr. Prabhakar's clinical observation: MHS patients who reintroduced ghee after years of avoidance reported reduced joint stiffness. No RCT directly links ghee consumption to joint pain reduction. Clinical experience only.",
    },
    {
      id: "c-A12", question_id: "A12",
      question_text: "Does cooking in ghee produce harmful chemicals?",
      claim: "Ghee's high smoke point (250°C) prevents harmful aldehyde formation at Indian cooking temperatures — refined oils begin producing aldehydes at 180°C",
      grade: "GREEN",
      source: "PubMed",
      citation: "Katragadda HR et al. (2010). Emissions of volatile aldehydes from heated cooking oils. Food Chem. PMID: 19748199",
      note: "Strong experimental evidence for aldehyde production in refined oils at high heat. Ghee's thermal stability is well documented. This is the demo trigger evidence.",
    },
    // ── Myth questions ──────────────────────────────────────────────────────
    {
      id: "c-M1", question_id: "M1",
      question_text: "Ghee is pure fat and will block your arteries — MYTH?",
      claim: "Moderate dietary saturated fat from traditional sources does not independently cause arterial plaque in the context of a balanced low-processed-food diet",
      grade: "GREEN",
      source: "PubMed",
      citation: "Siri-Tarino PW et al. (2010). Meta-analysis of prospective cohort studies evaluating the association of saturated fat with cardiovascular disease. Am J Clin Nutr. PMID: 20071648",
      note: "Landmark meta-analysis of 21 cohort studies. No significant association between saturated fat and CVD. Strong source for the myth correction.",
      myth_type: "disproven",
    },
    {
      id: "c-M2", question_id: "M2",
      question_text: "Vegetable oils are always healthier than ghee — MYTH?",
      claim: "Refined vegetable oils high in omega-6 polyunsaturated fat carry cardiovascular risk when consumed in large amounts — they are not universally healthier than ghee",
      grade: "GREEN",
      source: "PubMed",
      citation: "Hamley S (2017). The effect of replacing saturated fat with mostly n-6 polyunsaturated fat on coronary heart disease. Nutr J. PMID: 28423142",
      note: "Solid meta-analytic evidence. High omega-6 refined oils carry risk in the context of a carbohydrate-heavy Indian diet. Confident myth correction.",
      myth_type: "disproven",
    },
    {
      id: "c-M3", question_id: "M3",
      question_text: "Ghee has no nutritional value beyond fat — MYTH?",
      claim: "Ghee contains fat-soluble vitamins A, D, E, K; conjugated linoleic acid (CLA); and butyric acid — nutritional content beyond simple fat",
      grade: "YELLOW",
      source: "NIN",
      citation: "NIN Food Composition Tables (2017). Ghee, cow, nutritional composition per 100g.",
      note: "Compositional data is well established. Clinical significance of micronutrient content at typical serving sizes (1–2 tsp) is less well studied — the compositional fact is solid, outcome claims would be softer.",
      myth_type: "disproven",
      script_rule: "State compositional fact confidently ('ghee contains vitamin A, D, and butyric acid') but do not overclaim clinical outcomes from those nutrients at 1–2 tsp serving",
    },
    {
      id: "c-M4", question_id: "M4",
      question_text: "People with heart disease must completely avoid ghee — MYTH?",
      claim: "Total dietary pattern matters more than any single fat in cardiac outcomes — blanket ghee avoidance in heart disease patients lacks strong RCT evidence",
      grade: "YELLOW",
      source: "PubMed",
      citation: "Mente A et al. (2017). Associations of fats and carbohydrate intake with cardiovascular disease and mortality in 18 countries (PURE). Lancet. PMID: 28864332",
      note: "No RCT specifically testing blanket ghee restriction in Indian cardiac patients exists. The PURE study suggests overall dietary pattern matters far more than single fat restriction.",
      myth_type: "unsettled-clinical",
      script_rule: "Frame as 'the evidence for blanket ghee avoidance in heart disease is not strong — your total diet pattern and carbohydrate load matters far more than ghee alone' — never 'ghee is safe for heart patients'",
    },
    {
      id: "c-M5", question_id: "M5",
      question_text: "Low-fat diet is always better than a ghee-inclusive diet — MYTH?",
      claim: "Low-fat diets are not universally superior — replacing fat with refined carbohydrates in an Indian rice-based diet may worsen glycaemic outcomes",
      grade: "GREEN",
      source: "PubMed",
      citation: "Dehghan M et al. (2017). Associations of fats and carbohydrate intake with cardiovascular disease and mortality in 18 countries. Lancet. PMID: 28864332",
      note: "Strong landmark PURE study. Higher fat intake associated with lower mortality across 18 countries including India. Directly contradicts generic low-fat advice.",
      myth_type: "disproven",
    },
  ];

  const myth_ledger = [
    {
      question_id: "M1",
      question_text: "Ghee is pure fat and will block your arteries — MYTH?",
      myth_type: "disproven",
      evidence: "Meta-analysis of 21 prospective cohort studies (Siri-Tarino et al., 2010) found no significant association between saturated fat consumption and cardiovascular disease. Modern evidence does not support the original saturated fat hypothesis for traditional dietary fats.",
      claim_id: "c-M1",
    },
    {
      question_id: "M2",
      question_text: "Vegetable oils are always healthier than ghee — MYTH?",
      myth_type: "disproven",
      evidence: "Meta-analytic evidence (Hamley 2017) shows that replacing saturated fat with high omega-6 polyunsaturated fat does not reduce coronary heart disease risk and may increase it in certain dietary contexts.",
      claim_id: "c-M2",
    },
    {
      question_id: "M3",
      question_text: "Ghee has no nutritional value beyond fat — MYTH?",
      myth_type: "disproven",
      evidence: "NIN Food Composition Tables confirm ghee contains fat-soluble vitamins A, D, E, K, CLA, and butyric acid. The compositional myth is clearly false; the clinical significance of these at typical serving sizes is a separate and nuanced question.",
      claim_id: "c-M3",
    },
    {
      question_id: "M4",
      question_text: "People with heart disease must completely avoid ghee — MYTH?",
      myth_type: "unsettled-clinical",
      evidence: "No Indian RCT specifically testing ghee restriction in cardiac patients exists. PURE study evidence suggests total diet pattern matters more than single food restriction. The blanket avoidance rule is not evidence-based but the opposite — blanket endorsement — is also not proven.",
      clinical_verdict: "In my experience treating patients with existing heart disease, those who maintained moderate ghee as part of a whole-food, low-refined-carbohydrate diet did not show worsening lipid profiles. What worsened their outcomes was the refined carbohydrate replacement — not the ghee itself.",
      claim_id: "c-M4",
    },
    {
      question_id: "M5",
      question_text: "Low-fat diet is always better than a ghee-inclusive diet — MYTH?",
      myth_type: "disproven",
      evidence: "The PURE study (18-country cohort including India) found higher fat intake was associated with lower cardiovascular mortality, and high carbohydrate intake was associated with higher mortality — directly contradicting the low-fat-is-always-better premise.",
      claim_id: "c-M5",
    },
  ];

  const indian_context = [
    {
      id: "ic1",
      angle: "ICMR vs AHA guideline divergence on saturated fat",
      significance: "ICMR explicitly endorses traditional Indian fats including ghee as part of a balanced diet. Most Indian doctors trained on Western medical literature follow American Heart Association saturated fat restrictions that ICMR does not endorse for Indian populations. This creates a specific credibility gap Doctor Farmer can fill.",
      source: "ICMR-NIN (2020). Dietary Guidelines for Indians vs AHA Dietary Guidelines 2019",
    },
    {
      id: "ic2",
      angle: "Rice-based diet and fat metabolism in Tamil Nadu",
      significance: "Tamil Nadu's rice-based dietary pattern (2 rice meals per day) means ghee's effect on glycaemic response must be considered in the context of high-carbohydrate meals. Ghee slows gastric emptying and may reduce the glycaemic spike from rice — this is the opposite outcome from a low-fat approach where rice is eaten without fat.",
      source: "ICMR-NIN 2020 + glycaemic index literature on fat-carbohydrate interactions",
    },
    {
      id: "ic3",
      angle: "Indian BMI thresholds for metabolic risk",
      significance: "South Asians develop insulin resistance and metabolic syndrome at lower BMI than Western populations — a Tamil Nadu patient at BMI 24 may already have metabolic risk that a Western BMI chart would classify as 'healthy'. This affects how fat restriction advice translates — an already-lean Tamil Nadu diabetic restricting fat and increasing carbohydrate load may be at greater risk than BMI alone suggests.",
      source: "ICMR consensus on South Asian BMI thresholds. Misra A et al. (2009). Indian guidelines for BMI. JAPI.",
    },
    {
      id: "ic4",
      angle: "Tamil Nadu high-flame cooking and smoke point",
      significance: "High-temperature cooking (tadka, tempering, high-flame frying) is standard in Tamil Nadu kitchens. Refined vegetable oils begin producing harmful aldehydes at 180°C; ghee handles 250°C safely. For the specific cooking practices of South Indian households, ghee's smoke point advantage is a daily clinical safety point — not a theoretical benefit.",
      source: "Katragadda HR et al. (2010). PMID: 19748199 + NIN Fat composition tables",
    },
    {
      id: "ic5",
      angle: "Religious fasting and ghee: Karthigai and Ekadasi context",
      significance: "During Karthigai and Ekadasi fasts, Tamil Nadu patients traditionally consume ghee-rich foods when breaking the fast. This is clinically relevant — post-fast ghee consumption may slow the glucose rebound from breaking a fast. The traditional practice has clinical logic that is now partially supportable from food science even without a specific Tamil Nadu RCT.",
      source: "ICMR-NIN 2020 + Dr. Prabhakar's MHS patient observational data from fasting protocols",
    },
  ];

  // Count grades
  const gradeCounts = { green: 0, yellow: 0, blue: 0, red: 0 };
  claims.forEach((c) => {
    gradeCounts[c.grade.toLowerCase()]++;
  });

  const critic_pass = {
    status: "passed",
    flags: [
      "c-A1 (ghee and cholesterol) — YELLOW. Confirm script uses 'some studies show a mixed picture' — not 'research proves'. Mixed literature must not be presented as consensus.",
      "c-A3 (diabetics and ghee) — YELLOW. Pilot study only, N=47. Confirm 'a pilot study suggests' framing in answer. Not population-level evidence.",
      "c-F3 and c-A11 — BLUE. Both are clinical experience claims. Confirm neither appears anywhere in the script as 'research shows' or 'studies confirm'. Must open with 'In my clinical experience...' in every instance.",
      "c-M4 (heart disease) — YELLOW/unsettled-clinical. This is an unsettled question. Confirm script does not present it as either confirmed-safe or confirmed-dangerous. Honest uncertainty frame is mandatory.",
    ],
  };

  const confidence_dashboard = {
    green:       gradeCounts.green,
    yellow:      gradeCounts.yellow,
    blue:        gradeCounts.blue,
    red:         gradeCounts.red,
    total:       claims.length,
    approvable:  gradeCounts.red <= 1,
  };

  return { claims, myth_ledger, indian_context, critic_pass, confidence_dashboard };
}

// ── Stage 5 Sequencing — demo-mode generator ─────────────────────────────────

/**
 * Generate the full Stage 5 arc document for demo mode.
 *
 * @param {Object} stage3Data  - Stage 3 output { foundation, audience, myth, team, all_questions, overlaps }
 * @param {Object} stage4Data  - Stage 4 output { claims, myth_ledger, confidence_dashboard, ... }
 * @returns {Object}           - { red_decisions, arc, overlap_resolutions, total_questions, arc_summary }
 */
export function generateMockStage5Arc(stage3Data, stage4Data) {
  const red_decisions = [
    {
      claim_id: "c-A5",
      question_id: "A5",
      question_text: "Is cow ghee better than buffalo ghee?",
      claim: "Cow ghee has higher CLA and butyric acid content than buffalo ghee — no clinical outcome evidence",
      decision: "HONEST_UNCERTAINTY",
      rationale: "No clinical outcome data comparing cow and buffalo ghee health effects exists. Social demand is extremely high in Tamil Nadu — dropping this question would frustrate the audience. The honest answer 'the difference is smaller than you think and we have no clinical outcome data to declare a winner' is more credible than silence and builds more trust than a dropped question.",
    },
  ];

  const arc = [
    {
      section: "opening",
      section_label: "Opening",
      fixed: true,
      questions: [
        {
          id: "A8",
          text: "Why did doctors say ghee was bad for the heart?",
          grade: "GREEN",
          note: "Sets up the historical narrative — hooks with the reversal story. Creates immediate recognition for any viewer who was told to stop ghee by a doctor.",
        },
        {
          id: "F1",
          text: "What is the single most important thing a Tamil Nadu diabetic needs to understand about ghee before we go any further?",
          grade: "GREEN",
          note: "Foundation framing question — sets the episode's promise. Establishes that conventional advice has a gap and Doctor Farmer is filling it.",
        },
      ],
      demo_trigger: false,
    },
    {
      section: "discovery",
      section_label: "Discovery",
      fixed: true,
      questions: [
        {
          id: "A1",
          text: "Does ghee increase cholesterol?",
          grade: "YELLOW",
          note: "Highest audience concern — opens the problem landscape. YELLOW grade means the honest 'mixed picture' answer is itself the discovery moment.",
        },
        {
          id: "A2",
          text: "Is ghee good for weight loss or does it make you fat?",
          grade: "GREEN",
          note: "Second highest audience concern — broadens the problem. Sets up why a definitive answer from a doctor is valuable.",
        },
        {
          id: "F3",
          text: "What is the single biggest mistake you see Tamil Nadu patients making based on your MHS intake data?",
          grade: "BLUE",
          note: "BLUE clinical experience — places Dr. Prabhakar's patient observation in Discovery to validate the problem with real clinical weight.",
        },
      ],
      demo_trigger: false,
    },
    {
      section: "science",
      section_label: "Science",
      fixed: false,
      questions: [
        {
          id: "F2",
          text: "What does the ICMR / NIN actually say — and how does it differ from what most Indian doctors are still advising?",
          grade: "GREEN",
          note: "Authority anchor — the ICMR vs AHA divergence is the scientific credibility core of the episode.",
        },
        {
          id: "A6",
          text: "What does ICMR say about ghee?",
          grade: "GREEN",
          note: "Audience version of F2 — consolidate into one ICMR answer block. A6 and F2 are merged: one answer covers both questions.",
        },
        {
          id: "A12",
          text: "Does cooking in ghee produce harmful chemicals?",
          grade: "GREEN",
          note: "The smoke point demo trigger — strongest visual opportunity in the episode. Ghee vs refined oil side by side.",
        },
        {
          id: "F4",
          text: "Where is the evidence genuinely weak or missing?",
          grade: "YELLOW",
          note: "Honest uncertainty — builds trust before myth-busting. Doctor Farmer names what is and is not known. This is the intellectual honesty signal that differentiates the channel.",
        },
      ],
      demo_trigger: true,
      demo_note: "DEMO (Science): Place one teaspoon of cow ghee (glass jar, visible golden colour) and one teaspoon of refined sunflower oil (clear glass) side by side on the table. Show colour difference. Discuss smoke points: ghee 250°C vs refined oil 180°C. Dr. Prabhakar can use a whiteboard to draw the temperature lines. The visual makes the abstract chemistry tangible.",
    },
    {
      section: "myth",
      section_label: "Myth-Busting",
      fixed: false,
      questions: [
        {
          id: "M1",
          text: "Ghee is pure fat and will block your arteries — MYTH?",
          grade: "GREEN",
          note: "Primary myth — most widely believed. Leads the myth-busting block with the strongest evidence (21-cohort meta-analysis).",
        },
        {
          id: "M2",
          text: "Vegetable oils are always healthier than ghee — MYTH?",
          grade: "GREEN",
          note: "Directly linked to the demo — the audience has just seen the smoke point comparison and this myth correction reinforces it.",
        },
        {
          id: "M5",
          text: "Low-fat diet is always better than a ghee-inclusive diet — MYTH?",
          grade: "GREEN",
          note: "PURE study evidence — the strongest systemic data against the low-fat myth. Reinforces the preceding myth corrections.",
        },
        {
          id: "M4",
          text: "People with heart disease must completely avoid ghee — MYTH?",
          grade: "YELLOW",
          note: "Unsettled-clinical myth — must be handled with honest uncertainty framing. Dr. Prabhakar names the clinical verdict while acknowledging the RCT gap.",
        },
      ],
      demo_trigger: false,
    },
    {
      section: "solution",
      section_label: "Solution",
      fixed: false,
      questions: [
        {
          id: "A3",
          text: "Can diabetics eat ghee?",
          grade: "YELLOW",
          note: "Most important for the target audience — the core clinical answer. Pilot evidence with appropriate softened framing.",
        },
        {
          id: "A4",
          text: "How much ghee per day is safe?",
          grade: "GREEN",
          note: "The actionable answer the whole episode builds toward — specific, NIN-backed, immediately applicable.",
        },
        {
          id: "A11",
          text: "Can ghee help with joint pain?",
          grade: "BLUE",
          note: "BLUE claim — Dr. Prabhakar's clinical observation. Must be framed as 'In my clinical experience with patients who reintroduced ghee...' — never as research evidence.",
        },
        {
          id: "F5",
          text: "What is the one specific safe action a viewer can take today without a doctor visit?",
          grade: "GREEN",
          note: "Closes the solution section with a specific, safe, actionable recommendation. The pillar Action Clear lives here.",
        },
      ],
      demo_trigger: true,
      demo_note: "DEMO (Solution): Dr. Prabhakar writes on whiteboard: '1–2 tsp ghee with main meal — replace equivalent refined oil.' Simple, specific, visual. The viewer sees exactly what to do. Can also show a practical example plate: rice + dal + 1 tsp ghee on the side.",
    },
    {
      section: "practical",
      section_label: "Practical Use Case",
      fixed: false,
      questions: [
        {
          id: "A7",
          text: "Can ghee improve digestion?",
          grade: "YELLOW",
          note: "Practical daily application — gut health angle. Butyric acid mechanism makes this a natural transition from the solution section.",
        },
        {
          id: "A10",
          text: "Should I give ghee to my child?",
          grade: "YELLOW",
          note: "Family application — reaches the forward-sharer audience segment (adult children of diabetics). ICMR-endorsed with appropriate softened framing.",
        },
        {
          id: "M3",
          text: "Ghee has no nutritional value beyond fat — MYTH?",
          grade: "YELLOW",
          note: "Nutritional education — practical knowledge to take home. Placed in Practical rather than Myth-Busting because it is more of an informational correction than a safety-critical myth.",
        },
      ],
      demo_trigger: false,
    },
    {
      section: "rapidfire",
      section_label: "Rapid Fire",
      fixed: true,
      questions: [
        {
          id: "A5",
          text: "Is cow ghee better than buffalo ghee?",
          grade: "RED",
          note: "HONEST UNCERTAINTY decision: answer as 'the difference is smaller than you think — and we do not have clinical outcome data to declare one clearly better. Both are traditional fats within ICMR guidelines.' Rapid Fire is the natural place for this honest but unsettled question.",
        },
        {
          id: "A9",
          text: "Is ghee better than olive oil?",
          grade: "GREEN",
          note: "Practical comparison — smoke point data gives a clear answer for Indian cooking context. Short, punchy, memorable close.",
        },
        {
          id: "team-1",
          text: "(Team question — to be added before filming)",
          grade: null,
          note: "Team placeholder — fill with a question from Dr. Prabhakar's production team or recent patient questions.",
        },
        {
          id: "team-2",
          text: "(Team question — to be added before filming)",
          grade: null,
          note: "Team placeholder.",
        },
      ],
      demo_trigger: false,
    },
  ];

  const overlap_resolutions = [
    {
      overlap_description: "A1 (does ghee raise cholesterol?) and M1 (ghee blocks arteries — MYTH?) both cover the same ground on ghee and cardiovascular risk",
      resolution: "Keep both in different sections with different structural roles. A1 goes in Discovery as the audience concern entry point — the question the viewer arrives with. M1 goes in Myth-Busting as the formal myth correction backed by the 21-cohort meta-analysis. A1 opens the problem; M1 closes the correction. They are structurally complementary, not redundant.",
      kept_in_arc: "A1 (Discovery), M1 (Myth-Busting)",
    },
    {
      overlap_description: "A6 (what does ICMR say about ghee?) and F2 (what does ICMR/NIN say and how does it differ?) both seek the ICMR position",
      resolution: "Merge into a single combined ICMR authority block in the Science section. One answer covers both: 'what ICMR recommends and why it differs from what most doctors still advise.' A6 is absorbed into F2's answer. Both question IDs remain in the arc to indicate both were addressed in that block.",
      kept_in_arc: "F2 (primary Science question), A6 (merged into F2 answer block)",
    },
    {
      overlap_description: "A9 (ghee vs olive oil) and M2 (vegetable oils always healthier — MYTH?) cover overlapping ground on comparative fat quality",
      resolution: "Keep both with distinct structural roles. M2 in Myth-Busting (formal evidence-based myth correction citing Hamley 2017 meta-analysis). A9 in Rapid Fire (quick practical comparison using smoke point data). Different depth, different section, different audience take-away. No redundancy in this placement.",
      kept_in_arc: "M2 (Myth-Busting), A9 (Rapid Fire)",
    },
    {
      overlap_description: "A2 (weight loss) and F5 (action step) overlap on what to do practically about ghee",
      resolution: "Keep both in separate roles. A2 opens Discovery as an audience concern that frames the problem. F5 closes Solution as the specific action step with NIN backing. The roles are different — A2 raises the concern, F5 resolves it with a specific instruction. No overlap in function.",
      kept_in_arc: "A2 (Discovery), F5 (Solution — action step close)",
    },
    {
      overlap_description: "A3 (can diabetics eat ghee?) and M4 (heart disease — must avoid ghee?) both address high-risk patient groups",
      resolution: "Keep both in separate sections — A3 in Solution (the affirmative diabetics answer with pilot evidence and appropriate hedging), M4 in Myth-Busting (the unsettled-clinical cardiac myth handled with honest uncertainty). Different patient groups, different evidence grades, different structural roles.",
      kept_in_arc: "A3 (Solution), M4 (Myth-Busting)",
    },
  ];

  const total = arc.reduce((sum, s) => sum + (s.questions?.length ?? 0), 0);

  return {
    red_decisions,
    arc,
    overlap_resolutions,
    total_questions: total,
    arc_summary: "7-section arc with " + total + " questions sequenced. 1 RED claim (A5: cow vs buffalo ghee) resolved as Honest Uncertainty — placed in Rapid Fire with 'we don't have clinical outcome comparison data' answer. 1 BLUE claim (A11: joint pain) placed in Solution section. 2 demo triggers set: Science (smoke point comparison — ghee jar vs refined oil) and Solution (ghee protocol whiteboard — 1–2 tsp with main meal). A6 merged into F2 as combined ICMR block in Science. All 5 Stage 3 overlaps resolved.",
  };
}

// ── Stage 3 Question Bank — demo-mode generator ───────────────────────────────

/**
 * Generate a structured question bank for Stage 3 (Question Curation) in demo mode.
 * Maps the 17 existing MOCK_STAGE3_QUESTIONS into a 4-category structure and adds
 * the questions needed to reach the required counts (foundation:5, audience:12, myth:5, team:3).
 *
 * @param {Object} topicData  - Locked topic object with at minimum { title, category }
 * @returns {Object}          - { foundation, audience, myth, team, overlaps }
 */
export function generateMockStage3Questions(topicData) {
  const title    = topicData?.title    ?? "Is Ghee Actually Good for You?";
  const category = topicData?.category ?? "Myth";

  // ── Foundation questions (5) ─────────────────────────────────────────────
  // Core framing questions that anchor the episode — not sourced from audience search.
  const foundation = [
    {
      id: "F1",
      text: `What is the single most important thing a Tamil Nadu diabetic needs to understand about ${title.toLowerCase().includes("ghee") ? "ghee" : "this topic"} before we go any further?`,
      section_tag: "Opening",
      type: "foundation",
    },
    {
      id: "F2",
      text: "What does the ICMR / NIN actually say — and how does it differ from what most Indian doctors are still advising their patients?",
      section_tag: "Science",
      type: "foundation",
    },
    {
      id: "F3",
      text: "What is the single biggest mistake you see Tamil Nadu patients making, based on your MHS intake data?",
      section_tag: "Discovery",
      type: "foundation",
    },
    {
      id: "F4",
      text: "Where is the evidence genuinely weak or missing — and what are you honest about not knowing yet?",
      section_tag: "Science",
      type: "foundation",
    },
    {
      id: "F5",
      text: "What is the one specific, safe action a viewer can take today — without a doctor visit — as a direct result of what they hear in this episode?",
      section_tag: "Solution",
      type: "foundation",
    },
  ];

  // ── Audience questions (12) ──────────────────────────────────────────────
  // Pull all 12 audience-type items from MOCK_STAGE3_QUESTIONS (q1–q12).
  const audience = [
    { id: "A1",  text: "Does ghee increase cholesterol?",                              section_tag: "Discovery",   source: "YouTube autocomplete", type: "audience" },
    { id: "A2",  text: "Is ghee good for weight loss or does it make you fat?",        section_tag: "Discovery",   source: "YouTube comments",     type: "audience" },
    { id: "A3",  text: "Can diabetics eat ghee?",                                      section_tag: "Solution",    source: "Google autocomplete",  type: "audience" },
    { id: "A4",  text: "How much ghee per day is safe?",                               section_tag: "Practical",   source: "Google autocomplete",  type: "audience" },
    { id: "A5",  text: "Is cow ghee better than buffalo ghee?",                        section_tag: "Rapid Fire",  source: "Quora",                type: "audience" },
    { id: "A6",  text: "What does ICMR say about ghee?",                               section_tag: "Science",     source: "Google Search",        type: "audience" },
    { id: "A7",  text: "Can ghee improve digestion?",                                  section_tag: "Practical",   source: "YouTube comments",     type: "audience" },
    { id: "A8",  text: "Why did doctors say ghee was bad for the heart?",              section_tag: "Opening",     source: "YouTube autocomplete", type: "audience" },
    { id: "A9",  text: "Is ghee better than olive oil?",                               section_tag: "Rapid Fire",  source: "Quora",                type: "audience" },
    { id: "A10", text: "Should I give ghee to my child?",                              section_tag: "Practical",   source: "Instagram DMs",        type: "audience" },
    { id: "A11", text: "Can ghee help with joint pain?",                               section_tag: "Practical",   source: "YouTube comments",     type: "audience" },
    { id: "A12", text: "Does cooking in ghee produce harmful chemicals?",              section_tag: "Science",     source: "Google Search",        type: "audience" },
  ];

  // ── Myth questions (5) ───────────────────────────────────────────────────
  // Pull the 4 myth-type items from MOCK_STAGE3_QUESTIONS (q13–q17 minus q15 not needed as q17 covers low-fat).
  // Add one more to reach 5.
  const myth = [
    { id: "M1", text: "Ghee is pure fat and will block your arteries — MYTH?",                           section_tag: "Myth-Busting", type: "myth" },
    { id: "M2", text: "Vegetable oils are always healthier than ghee — MYTH?",                           section_tag: "Myth-Busting", type: "myth" },
    { id: "M3", text: "Ghee has no nutritional value beyond fat — MYTH?",                                section_tag: "Myth-Busting", type: "myth" },
    { id: "M4", text: "People with heart disease must completely avoid ghee — MYTH?",                    section_tag: "Myth-Busting", type: "myth" },
    { id: "M5", text: `Low-fat diet is always better than a ${category === "Myth" ? "ghee-inclusive" : "traditional fat"} diet — MYTH?`, section_tag: "Myth-Busting", type: "myth" },
  ];

  // ── Team questions (3) — placeholders ───────────────────────────────────
  const team = [
    { id: "team-1", text: "", section_tag: "Rapid Fire", type: "team", placeholder: true, source: "team" },
    { id: "team-2", text: "", section_tag: "Rapid Fire", type: "team", placeholder: true, source: "team" },
    { id: "team-3", text: "", section_tag: "Opening",    type: "team", placeholder: true, source: "team" },
  ];

  // ── Overlap flags ─────────────────────────────────────────────────────────
  // Flag question pairs that cover the same ground and may need deduplication in Stage 5.
  const overlaps = [
    "A1 and M1 cover the same ground (ghee and cholesterol/arteries) — Stage 5 will decide which angle to lead with; A1 is the audience-search entry, M1 is the myth-correction frame",
    "A2 and F5 overlap on the 'what should I do about this?' practical implication — Stage 5 will merge or sequence these so the actionable answer appears once, not twice",
    "A3 and M4 cover overlapping territory for diabetic and cardiac patients — Stage 5 will decide whether to address them in the same segment or keep them separate",
    "A6 and F2 both seek the ICMR/NIN position — Stage 5 will consolidate into one definitive ICMR answer block rather than covering it in two separate questions",
    "A9 (ghee vs. olive oil) and M2 (vegetable oils vs. ghee) cover the same ground — Stage 5 will decide which to keep in the main arc and which to move to Rapid Fire",
  ];

  return { foundation, audience, myth, team, overlaps };
}

// ── Stage 6 Answer Writer — demo-mode generator ──────────────────────────────

/**
 * Generate the full Stage 6 script for demo mode.
 * Returns complete spoken dialogue for all 24 questions in the ghee episode.
 *
 * @param {Object} stage5Data  - Stage 5 output { arc, red_decisions, ... }
 * @param {Object} stage4Data  - Stage 4 output { claims, ... }
 * @param {Object} lockData    - Stage 2 lock { locked_topic, pillars, ... }
 * @param {string} styleMode   - "style_check" | "full"
 * @returns {Object}           - { sections, total_runtime_min, status, pillar_check }
 */
export function generateMockStage6Answers(stage5Data, stage4Data, lockData, styleMode = "full") {
  const sections = [
    // ── SECTION 1 — OPENING ────────────────────────────────────────────────
    {
      id: "opening", label: "Opening", target_min: 2, actual_min: 1.9, status: "on_track",
      answers: [
        {
          question_id: "A8", question_text: "Why did doctors say ghee was bad for the heart?",
          grade: "GREEN", demo_trigger: false, est_sec: 62,
          interviewer: "Doctor, I grew up watching my mother and grandmother put ghee on everything — rice, chapati, dal, everything. Then suddenly, every doctor, every nutritionist said stop ghee completely. What happened? How did something our family ate every day for generations become dangerous overnight?",
          prabhakar: "What happened is one of the most interesting stories in modern nutrition science. In the 1960s, a very influential American researcher made the case that all dietary saturated fat causes heart disease. Ghee — being mostly saturated fat — got swept into that ban. Indian doctors followed international guidelines. Patients stopped using ghee. Refined vegetable oil companies benefited enormously. But here's what's happened since then: when researchers later pooled twenty-one large prospective cohort studies — hundreds of thousands of people followed over years — they found no meaningful independent connection between dietary saturated fat and cardiovascular disease. The original hypothesis has been substantially revised. Your grandmother was following a tradition that turns out to be more aligned with current evidence than the advice that replaced it.",
          source_annotation: "🟢 Source: Siri-Tarino PW et al. (2010). Meta-analysis of 21 prospective cohort studies. Am J Clin Nutr. PMID: 20071648",
          editor_note: null,
        },
        {
          question_id: "F1", question_text: "What is the single most important thing a Tamil Nadu diabetic needs to understand about ghee?",
          grade: "GREEN", demo_trigger: false, est_sec: 52,
          interviewer: "Okay, so before we get into all the science — what is the one thing, the one message, you want every diabetic watching this to take away about ghee?",
          prabhakar: "That the advice to stop ghee was not based on Indian data. It was based on research done on Western populations eating Western diets, applied broadly to Indian kitchens without asking whether the same logic holds here. And our own national nutrition body — ICMR — does not tell you to stop ghee. ICMR recommends ghee as part of a traditional Indian diet, within sensible quantities. The problem was never ghee. The problem was that we took a guideline designed for someone eating processed meat and applied it to someone eating rice and ghee. Those are not the same person, and they are not the same diet.",
          source_annotation: "🟢 Source: ICMR-NIN (2020). Dietary Guidelines for Indians. ISBN 978-81-908280-2-8.",
          editor_note: null,
        },
      ],
    },

    // ── SECTION 2 — DISCOVERY ──────────────────────────────────────────────
    {
      id: "discovery", label: "Discovery", target_min: 4, actual_min: 3.8, status: "on_track",
      answers: [
        {
          question_id: "A1", question_text: "Does ghee increase cholesterol?",
          grade: "YELLOW", demo_trigger: false, est_sec: 65,
          interviewer: "Doctor, the first thing people ask me when I say ghee — they say 'but doesn't it increase cholesterol?' That's the first fear. What's your answer?",
          prabhakar: "The honest answer is that some studies do show a small picture — some showing a modest increase in LDL cholesterol, which people call 'bad' cholesterol, when ghee is consumed in large amounts. But the same studies also show a rise in HDL — the protective cholesterol. And some larger studies show no significant change at all. So if someone tells you 'ghee raises your cholesterol' in one flat sentence, ask them: which cholesterol? How much? In what diet context? Because when ghee is consumed as part of a traditional Indian diet — not in excess, not as a supplement on top of an already high-fat diet — the mixed picture in the research does not support a flat ban.",
          source_annotation: "🟡 Source: Sharma RD et al. (2019). Dietary fats and lipid profiles. Indian J Clin Biochem. PMID: 30956432 — NOTE: Mixed findings, use softened language",
          editor_note: null,
        },
        {
          question_id: "A2", question_text: "Is ghee good for weight loss or does it make you fat?",
          grade: "GREEN", demo_trigger: false, est_sec: 48,
          interviewer: "What about weight? A lot of people trying to lose weight cut ghee immediately. Is that the right call?",
          prabhakar: "It's not, if you're cutting it in reasonable amounts. When ICMR published its dietary guidelines for Indians, ghee was included within the recommended visible fat intake. Moderate consumption — one to two teaspoons a day — within a traditional Indian diet is not associated with weight gain in the research. What causes weight gain is excess calories from any source. If you are eating a teaspoon of ghee on your rice and a bag of biscuits every evening, the biscuits are your problem — not the ghee.",
          source_annotation: "🟢 Source: ICMR-NIN (2020). Dietary Guidelines for Indians. Chapter 4. ISBN 978-81-908280-2-8.",
          editor_note: null,
        },
        {
          question_id: "F3", question_text: "What is the single biggest mistake you see Tamil Nadu patients making based on your MHS intake data?",
          grade: "BLUE", demo_trigger: false, est_sec: 58,
          interviewer: "Doctor, from all the patients you see in your practice — people who come to you after years of managing diabetes — what's the single biggest mistake you keep seeing?",
          prabhakar: "What I see in my practice is this: patients switched from ghee to refined vegetable oil years ago because their doctor or dietitian told them to. They followed that advice faithfully. And then they ask me why their blood sugar hasn't improved, why their energy is low, why their joints ache more than before. When I look at their diet, I often find they replaced ghee with three or four teaspoons of refined sunflower or soybean oil — a much higher omega-6 load than they had before — without any of the fat-soluble vitamins that were in the ghee. They did what they were told, but the replacement was worse than what they replaced. That is the mistake I see most — not the ghee, but the thing they replaced it with.",
          source_annotation: "🔵 Clinical experience — Dr. Prabhakar's MHS patient observation. Not framed as research.",
          editor_note: null,
        },
      ],
    },

    // ── SECTION 3 — SCIENCE ────────────────────────────────────────────────
    {
      id: "science", label: "Science", target_min: 6, actual_min: 6.2, status: "on_track",
      answers: [
        {
          question_id: "F2", question_text: "What does ICMR / NIN actually say about ghee — and how does it differ from what most doctors still advise? (merged with A6)",
          grade: "GREEN", demo_trigger: false, est_sec: 72,
          interviewer: "Doctor, what does our own Indian health authority — ICMR — actually say about ghee? Because what I hear from doctors and what I read online seems very different.",
          prabhakar: "The national nutrition body here in India — ICMR — specifically recommends traditional fats including ghee as part of a balanced Indian diet. Their dietary guidelines, published in 2020, put ghee within the visible fat intake they consider appropriate for healthy adults. They are not restricting ghee. They are endorsing it within reasonable quantities. The divergence you are experiencing is because most Indian medical education draws heavily from American Heart Association guidelines — designed for American patients eating American food. When an Indian doctor trained on those guidelines tells a Tamil Nadu patient to stop ghee, that doctor is applying advice meant for someone whose biggest dietary fat problem is processed cheeseburgers, not home-cooked rice with a teaspoon of cow ghee. The guidelines were never the problem — the wrong application of them was.",
          source_annotation: "🟢 Source: ICMR-NIN (2020). Dietary Guidelines for Indians. ISBN 978-81-908280-2-8.",
          editor_note: null,
        },
        {
          question_id: "A12", question_text: "Does cooking in ghee produce harmful chemicals?",
          grade: "GREEN", demo_trigger: true, est_sec: 78,
          interviewer: "Doctor, I have read that when you heat any oil to high temperatures it produces harmful chemicals. Does that apply to ghee as well?",
          prabhakar: "[picks up the glass jar of ghee and the small glass of sunflower oil placed on the table] Look at these two. This golden one is cow ghee. This colourless one is refined sunflower oil. Let me tell you what happens when you heat them. Ghee handles 250 degrees Celsius before it starts to break down. Refined sunflower oil starts producing something called aldehydes — toxic compounds — at around 180 degrees. Now think about how Tamil Nadu kitchens cook. High flame. Tadka. Tempering spices. We are regularly cooking between 200 and 220 degrees. When you cook with refined oil at those temperatures, every day, you are creating a small amount of toxic aldehyde in every meal. With ghee, at those temperatures, you are below its breakdown point. So the question of which is safer for South Indian cooking is not even close.",
          source_annotation: "🟢 Source: Katragadda HR et al. (2010). Emissions of volatile aldehydes from heated cooking oils. Food Chem. PMID: 19748199",
          editor_note: "[DEMO ① for editor: ghee glass jar (golden, visible) + small clear glass of refined sunflower oil on table. B-roll close-up of both, showing colour contrast. Whiteboard with '250°C' and '180°C' marked as Dr. Prabhakar speaks. Film smoke point comparison from at least 3 angles. This is the key visual moment of the episode.]",
        },
        {
          question_id: "F4", question_text: "Where is the evidence genuinely weak or missing?",
          grade: "YELLOW", demo_trigger: false, est_sec: 55,
          interviewer: "Before we get to the myths — where does the evidence actually have gaps? Where is it weak or uncertain?",
          prabhakar: "I have to be honest with you about what we do not know. We do not have a large, long-term randomised controlled trial specifically on ghee consumption in Tamil Nadu Type 2 diabetics. That study does not exist. What we have are general fat studies, ICMR dietary guidelines, and pilot studies — some promising, but small. So when I say ghee is fine in moderation, I am saying it on the basis of the best available evidence, which supports that conclusion. But I am also saying that the specific Indian diabetic ghee trial has not been done. Anyone who tells you they have definitive proof that ghee is perfectly safe for your specific diabetes situation — or definitely dangerous — is overstating what the research currently shows.",
          source_annotation: "🟡 Source: Jain RB, Mehra R (2021). Ghee and blood glucose pilot trial. J Diabetes Metab Disord. PMID: 34805041 — NOTE: Pilot study only, use 'based on available evidence' framing",
          editor_note: null,
        },
      ],
    },

    // ── SECTION 4 — MYTH-BUSTING ───────────────────────────────────────────
    {
      id: "myth", label: "Myth-Busting", target_min: 5, actual_min: 5.4, status: "on_track",
      answers: [
        {
          question_id: "M1", question_text: "Ghee is pure fat and will block your arteries — MYTH?",
          grade: "GREEN", demo_trigger: false, est_sec: 72,
          interviewer: "Doctor, the WhatsApp message everyone has received at some point says — 'ghee is pure saturated fat, it will clog your arteries, don't touch it.' Is that true?",
          prabhakar: "False. And let me be specific, because this myth has scared people away from something their family has eaten safely for generations. When researchers pooled the data from twenty-one prospective cohort studies — some of the largest nutrition studies ever done, involving hundreds of thousands of people — they found no significant independent association between saturated fat consumption from dietary sources and cardiovascular disease. None. Ghee, consumed in moderation as part of a whole-food traditional diet, does not independently block arteries. What the old guidelines got wrong is treating all saturated fat as identical — animal fat in a processed food context is a very different thing from ghee in a dal and rice context. This myth needs to stop travelling on WhatsApp.",
          source_annotation: "🟢 Source: Siri-Tarino PW et al. (2010). Meta-analysis of 21 cohort studies. Am J Clin Nutr. PMID: 20071648",
          editor_note: null,
        },
        {
          question_id: "M2", question_text: "Vegetable oils are always healthier than ghee — MYTH?",
          grade: "GREEN", demo_trigger: false, est_sec: 68,
          interviewer: "You just showed us those two glasses. But the general advice is still — refined oil is heart-healthy, ghee is not. Is that true?",
          prabhakar: "False. And the evidence on this is actually quite strong. When researchers specifically studied what happened when people replaced saturated fat with the kind of polyunsaturated fat found in most refined vegetable oils — high omega-6 oils like sunflower and soybean — they found no improvement in coronary heart disease outcomes. In some analyses, outcomes were worse. The reason is that modern refined vegetable oils are very high in omega-6 fatty acids, and a diet that is heavily imbalanced toward omega-6 and low in omega-3 has its own cardiovascular risks. Ghee is not perfect for every situation. But the blanket statement that refined vegetable oils are always healthier is simply not supported by the current evidence.",
          source_annotation: "🟢 Source: Hamley S (2017). Effect of replacing saturated fat with n-6 polyunsaturated fat on coronary heart disease. Nutr J. PMID: 28423142",
          editor_note: null,
        },
        {
          question_id: "M5", question_text: "Low-fat diet is always better than a ghee-inclusive diet — MYTH?",
          grade: "GREEN", demo_trigger: false, est_sec: 65,
          interviewer: "What about the general low-fat diet principle — eating less fat, more carbohydrates — is that always better?",
          prabhakar: "False — and the evidence against this is some of the most robust we have. A major international study called the PURE study tracked the diets and health outcomes of people across eighteen countries — including India. What they found was that higher fat intake was associated with lower total mortality, and higher carbohydrate intake was associated with higher mortality. Now think about what a low-fat diet looks like in a Tamil Nadu kitchen. You remove the ghee. You increase the rice. You are replacing a stable traditional fat with more refined carbohydrate. For a diabetic whose core problem is carbohydrate metabolism, this is the wrong trade. Low-fat is a guideline that made some sense in the context it was designed for. In the context of a South Indian rice-based diet for a diabetic, it can actually make things worse.",
          source_annotation: "🟢 Source: Dehghan M et al. (2017). PURE study, 18-country cohort. Lancet. PMID: 28864332",
          editor_note: null,
        },
        {
          question_id: "M4", question_text: "People with heart disease must completely avoid ghee — MYTH?",
          grade: "YELLOW", demo_trigger: false, est_sec: 70,
          interviewer: "My uncle had a heart attack two years ago. His cardiologist told him absolutely no ghee. That's a strict rule from a heart specialist. Is he right?",
          prabhakar: "The honest answer is that the evidence for blanket ghee restriction specifically in Indian cardiac patients does not exist as a clean controlled trial. There is no randomised study that took a group of Indian heart patients, restricted ghee completely, and found improved outcomes compared to a group that continued moderate ghee. That study has not been done. What the large dietary evidence does show — from the PURE study and others — is that total dietary pattern matters far more than any single food. Now — from what I see in my practice with patients who have existing heart conditions — those who maintained moderate ghee within a whole-food, low-refined-carbohydrate diet did not show worsening lipid profiles. What worsened outcomes, when I look at it carefully, was usually the refined carbohydrate load, not the ghee. But I want to be clear: if a patient's cardiologist has made a specific clinical recommendation for them, that conversation belongs between the patient and the cardiologist — not replaced by a podcast.",
          source_annotation: "🟡 Source: Mente A et al. (2017). PURE study — dietary fat and CVD mortality. Lancet. PMID: 28864332 — NOTE: No direct RCT on ghee in Indian cardiac patients; use 'total dietary pattern' framing",
          editor_note: null,
        },
      ],
    },

    // ── SECTION 5 — SOLUTION ──────────────────────────────────────────────
    {
      id: "solution", label: "Solution", target_min: 6, actual_min: 6.5, status: "on_track",
      answers: [
        {
          question_id: "A3", question_text: "Can diabetics eat ghee?",
          grade: "YELLOW", demo_trigger: false, est_sec: 62,
          interviewer: "Doctor — the question everyone with diabetes is waiting for. Can diabetics eat ghee?",
          prabhakar: "A pilot study specifically looked at this — moderate ghee consumption in Type 2 diabetics — and the early data suggested it may be safe and could support glycaemic response. But I have to be transparent: this was a small study, around forty-seven participants, not the large definitive trial we would want. So my position is: the early evidence is encouraging, and the mechanism makes sense — ghee slows gastric emptying which can actually reduce the glycaemic spike from a rice meal. But I cannot tell you 'yes ghee is confirmed safe for all diabetics in all amounts.' What I can say is: one to two teaspoons of ghee with your main meal — replacing the equivalent refined oil you were using before, not adding on top of it — is not supported by current evidence as harmful for Type 2 diabetics without significant comorbidities.",
          source_annotation: "🟡 Source: Jain RB, Mehra R (2021). Ghee and blood glucose pilot trial. J Diabetes Metab Disord. PMID: 34805041 — NOTE: Pilot study N=47. Use 'a pilot study suggests' framing.",
          editor_note: null,
        },
        {
          question_id: "A4", question_text: "How much ghee per day is safe?",
          grade: "GREEN", demo_trigger: true, est_sec: 55,
          interviewer: "So what's the actual number? How much is okay?",
          prabhakar: "[walks to whiteboard, writes '1–2 tsp' and 'with main meal'] One to two teaspoons per day. Five to ten grams. That's the amount that sits comfortably within the visible fat intake that the National Institute of Nutrition recommends for healthy adults. Not a tablespoon. Not poured over everything. One teaspoon on your rice or one teaspoon in your cooking per meal — that is the traditional quantity our grandparents used, and it is the quantity the evidence supports as appropriate. The problem was never one teaspoon of ghee. The problem was when people interpreted 'ghee is traditional' as 'more ghee is more traditional.'",
          source_annotation: "🟢 Source: National Institute of Nutrition (2020). Dietary Guidelines for Indians. Recommended visible fat intake, p. 62.",
          editor_note: "[DEMO ② for editor: Dr. Prabhakar writes '1–2 tsp' and 'with main meal' on whiteboard in clear marker. B-roll of the whiteboard close-up. Also film a practical plate — rice + dal + 1 small tsp ghee visible on the side for visual reference. This is the key actionable takeaway visual of the episode.]",
        },
        {
          question_id: "A11", question_text: "Can ghee help with joint pain?",
          grade: "BLUE", demo_trigger: false, est_sec: 82,
          interviewer: "Doctor — a lot of older patients tell me their joints feel better after they started eating ghee again. Is there something to that?",
          prabhakar: "In my experience with my students — and I want to be very clear this is clinical observation, not a published study — I have seen something consistent enough to mention honestly. When patients who had stopped ghee for years, on doctor's advice, reintroduced moderate ghee as part of a whole-food diet change in the MHS program, a notable number of them reported reduced morning stiffness and improved joint comfort within four to six weeks. No bone markers worsened. No blood inflammatory markers I track went up. Now — I cannot tell you ghee heals joints. There is no randomised trial I can point you to that proves that. What I can tell you is that ghee contains butyric acid, which is the same compound that feeds the cells lining your gut, and fat-soluble vitamins A and D, which have roles in tissue health. Whether those mechanisms explain what my patients experience — I genuinely do not know. But I am not going to hide from you that I see it. The science on the mechanism is there. The outcome trial is not. That is the honest picture.",
          source_annotation: "🔵 Clinical experience — Dr. Prabhakar's MHS patient observation. Not research-backed. Must be framed as personal clinical experience in all downstream content.",
          editor_note: null,
        },
        {
          question_id: "F5", question_text: "What is the one specific safe action a viewer can take today without a doctor visit?",
          grade: "GREEN", demo_trigger: false, est_sec: 48,
          interviewer: "Doctor — that's the most honest answer I've heard from a doctor on this topic. Thank you. So — what is the one thing someone watching this can actually do today? Starting tonight?",
          prabhakar: "Tonight, cook your main meal with one teaspoon of cow ghee and remove the equivalent amount of refined oil you would have used. You are not adding — you are replacing. Use it on your rice. Use it in your tadka. One teaspoon. That is within every guideline. It costs you nothing to change. And you will get the fat-soluble vitamins, the butyric acid, the smoke point stability for your Indian cooking — all of it — from that single simple swap. You do not need a prescription for this. You do not need to wait for a doctor's appointment. One teaspoon of ghee, tonight.",
          source_annotation: "🟢 Source: NIN (2020). Dietary Guidelines for Indians, p. 62.",
          editor_note: null,
        },
      ],
    },

    // ── SECTION 6 — PRACTICAL USE CASE ────────────────────────────────────
    {
      id: "practical", label: "Practical Use Case", target_min: 4, actual_min: 3.5, status: "on_track",
      answers: [
        {
          question_id: "A7", question_text: "Can ghee improve digestion?",
          grade: "YELLOW", demo_trigger: false, est_sec: 55,
          interviewer: "Doctor, a lot of older Tamil Nadu patients tell me ghee settles their stomach, helps with digestion. Is there any basis for that?",
          prabhakar: "The butyric acid in ghee — which is a short-chain fatty acid — is the same compound that the cells lining your colon use as their primary fuel source. The mechanism by which butyric acid supports gut lining health is well studied in laboratory and animal research. What is less studied is the direct clinical question of whether one teaspoon of ghee per day produces a measurable improvement in human digestive symptoms. That specific human trial does not exist at scale. So what I would say is: the mechanism that supports the idea is real. The cultural observation that ghee settles the stomach is probably not pure imagination. But I cannot tell you 'studies prove ghee improves digestion' in clinical terms. The gut lining science is there. The specific symptom trial is not.",
          source_annotation: "🟡 Source: Hamer HM et al. (2008). Role of butyrate on colonic function. Aliment Pharmacol Ther. PMID: 17973645 — NOTE: Mechanism evidence only, not clinical symptom trial",
          editor_note: null,
        },
        {
          question_id: "A10", question_text: "Should I give ghee to my child?",
          grade: "YELLOW", demo_trigger: false, est_sec: 50,
          interviewer: "What about children? My sister keeps asking me whether to give ghee to her six-year-old. A lot of Tamil Nadu families feed ghee to young children traditionally. Is that okay?",
          prabhakar: "ICMR's dietary guidelines for children in India include traditional fats like ghee as appropriate sources of energy and fat-soluble vitamins during growth years. This is not a new recommendation — it reflects what Indian families have done for generations, and the nutritional rationale stands. For a child eating a traditional rice-based South Indian diet, one teaspoon of ghee a day is within those guidelines and provides vitamin A and D that growing children genuinely need. I am not prescribing amounts here — that depends on the child's weight, diet, and overall intake. But the principle that ghee is appropriate for children in reasonable quantities within a traditional diet is what ICMR says, and I agree with it.",
          source_annotation: "🟡 Source: ICMR-NIN (2020). Dietary Guidelines for Indians — Child and adolescent nutrition chapter. ISBN 978-81-908280-2-8. NOTE: General endorsement, no specific paediatric RCT on ghee",
          editor_note: null,
        },
        {
          question_id: "M3", question_text: "Ghee has no nutritional value beyond fat — MYTH?",
          grade: "YELLOW", demo_trigger: false, est_sec: 52,
          interviewer: "Last one in this section — someone told me ghee is just fat, there's nothing else in it nutritionally. Is that true?",
          prabhakar: "That is wrong. Ghee contains fat-soluble vitamins — A, D, E, and K. It contains conjugated linoleic acid, which has been studied for various metabolic effects. And it contains butyric acid. Now — the clinically meaningful levels of these nutrients at one or two teaspoons per day is a separate question, and I would not want to overclaim. You will not correct a vitamin D deficiency with ghee alone. But the claim that ghee has no nutritional value beyond fat is factually incorrect. What ghee does not contain are the anti-nutrients and trans fats that can appear in industrially refined vegetable oils. The nutritional composition of traditional cow ghee — documented in NIN food tables — is considerably more complex than 'just fat.'",
          source_annotation: "🟡 Source: NIN Food Composition Tables (2017). Ghee, cow, per 100g. NOTE: State compositional fact confidently; do not overclaim clinical outcomes from micronutrient content at 1–2 tsp serving",
          editor_note: null,
        },
      ],
    },

    // ── SECTION 7 — RAPID FIRE ─────────────────────────────────────────────
    {
      id: "rapidfire", label: "Rapid Fire", target_min: 2, actual_min: 1.8, status: "on_track",
      answers: [
        {
          question_id: "__intro", question_text: "Rapid Fire setup",
          grade: null, demo_trigger: false, est_sec: 8,
          interviewer: "Rapid fire now, Doctor — quick answers, no explanations!",
          prabhakar: "Ready.",
          source_annotation: null, editor_note: null,
        },
        {
          question_id: "A5", question_text: "Is cow ghee better than buffalo ghee?",
          grade: "RED", demo_trigger: false, est_sec: 18,
          interviewer: "Cow ghee versus buffalo ghee — which is better?",
          prabhakar: "Honest answer: we do not have clinical outcome trials comparing them. Both are traditional fats within ICMR guidelines — the difference is smaller than the debate suggests.",
          source_annotation: "🔴 No comparative clinical outcome data — Honest Uncertainty answer.",
          editor_note: null,
        },
        {
          question_id: "A9", question_text: "Is ghee better than olive oil?",
          grade: "GREEN", demo_trigger: false, est_sec: 12,
          interviewer: "Ghee versus olive oil for cooking?",
          prabhakar: "For Indian high-flame cooking — ghee wins on smoke point alone. Olive oil is excellent cold or at low heat; it is not designed for a Tamil Nadu kitchen.",
          source_annotation: "🟢 Source: Katragadda HR et al. (2010). PMID: 19748199",
          editor_note: null,
        },
        {
          question_id: "team-1", question_text: "(Team question placeholder)",
          grade: null, demo_trigger: false, est_sec: 10,
          interviewer: "[Team question — to be added before filming]",
          prabhakar: "[Answer to be written once team question is confirmed]",
          source_annotation: null, editor_note: null,
        },
        {
          question_id: "team-2", question_text: "Closing line",
          grade: null, demo_trigger: false, est_sec: 12,
          interviewer: "Last one — what would you say to someone who's been avoiding ghee for twenty years because their doctor told them to?",
          prabhakar: "I would say: your grandmother was not wrong. The advice changed. The tradition was right. One teaspoon tonight.",
          source_annotation: null, editor_note: "Standalone reel candidate — this line is the episode's shareable close.",
        },
      ],
    },
  ];

  // Filter to style check mode (one answer per section) if requested
  const outputSections = styleMode === "style_check"
    ? sections.map((s) => ({
        ...s,
        answers: s.answers.filter((a) => a.question_id !== "__intro").slice(0, 1),
        style_check: true,
      }))
    : sections;

  const total_runtime_min = parseFloat(
    outputSections.reduce((sum, s) => {
      return sum + s.answers.reduce((asum, a) => asum + (a.est_sec ?? 0) / 60, 0);
    }, 0).toFixed(1)
  );

  const status = total_runtime_min >= 29 && total_runtime_min <= 38
    ? "within_range"
    : total_runtime_min > 38
    ? "over"
    : "under";

  return {
    sections: outputSections,
    total_runtime_min,
    status,
    style_check: styleMode === "style_check",
    pillar_check: {
      "Truth First":          "Opening Q A8 — 21-study meta-analysis cited in the first answer, before any claim is made, establishing the evidence correction as the foundation of the episode",
      "Myth Named":           "Myth-Busting Q M1 — 'ghee will clog your arteries' stated verbatim as the WhatsApp message the audience has received, then demolished with the specific 21-cohort finding",
      "South Indian Anchored": "Science Q F2/A6 — ICMR vs AHA divergence named explicitly; Discovery Q F3 — Tamil Nadu patient observation on the refined-oil replacement mistake",
      "Reversal Bridge":      "Solution Q F5 — specific '1 tsp tonight, replacing refined oil' action step bridges from the myth correction to the practical lifestyle reversal",
    },
    mode: "demo",
  };
}
