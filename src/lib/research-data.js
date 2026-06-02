// Mock evidence-base for the Scientific Verification engine.
// In production this layer is replaced by live PubMed / NIH / WHO / FDA APIs.

export const EVIDENCE_LEVELS = {
  "Meta-analysis": { rank: 6, color: "emerald", short: "A1" },
  "Systematic Review": { rank: 5, color: "emerald", short: "A1" },
  RCT: { rank: 4, color: "cyan", short: "A2" },
  Cohort: { rank: 3, color: "blue", short: "B1" },
  Observational: { rank: 2, color: "amber", short: "B2" },
  "Animal Study": { rank: 1, color: "orange", short: "C1" },
  "Case Report": { rank: 0, color: "rose", short: "C2" },
};

export const VERDICTS = {
  proven: {
    label: "Scientifically Supported",
    tone: "emerald",
    icon: "shield-check",
    note: "Strong, repeatable evidence supports this — within stated limits.",
  },
  mixed: {
    label: "Mixed Evidence",
    tone: "amber",
    icon: "scale",
    note: "Studies disagree or are early-stage. Communicate uncertainty clearly.",
  },
  misleading: {
    label: "Often Misleading",
    tone: "orange",
    icon: "alert-triangle",
    note: "A kernel of truth is routinely exaggerated online. Add context.",
  },
  false: {
    label: "False / Unsafe Claim",
    tone: "rose",
    icon: "x-octagon",
    note: "Not supported by science and potentially harmful. Do not amplify.",
  },
};

function src(o) {
  return {
    subjects: "Human",
    sampleSize: "—",
    abstract: "",
    ...o,
  };
}

export const RESEARCH_TOPICS = [
  {
    key: "ashwagandha",
    aliases: ["ashwagandha", "withania", "winter cherry", "ashwaganda"],
    display: "Ashwagandha",
    category: "Adaptogen / Supplement",
    verdict: "proven",
    confidence: 86,
    evidenceStrength: 78,
    consensus: 81,
    researchQuality: 74,
    misinfoRisk: 28,
    viralPotential: 88,
    benefit: "lower cortisol and ease day-to-day stress",
    keyFinding:
      "Multiple randomised trials show standardised root extract modestly reduces perceived stress and cortisol over 6–8 weeks.",
    summary:
      "Ashwagandha (Withania somnifera) is one of the better-studied adaptogens. Randomised controlled trials and a 2021 meta-analysis report small-to-moderate reductions in stress, anxiety scores and serum cortisol versus placebo. Effects on sleep quality are promising but shorter-term. Evidence is strongest for standardised root extracts at 250–600 mg/day.",
    limitations: [
      "Most trials run only 6–12 weeks — long-term safety data is limited.",
      "Study quality varies; several were industry-funded with small samples.",
      "Not advised in pregnancy or with thyroid/autoimmune conditions without medical advice.",
    ],
    contradictions: [
      "Sleep-quality results are inconsistent between trials of different extracts.",
      "A minority of studies report no significant cortisol change.",
    ],
    timeline: [
      { year: 2012, event: "Early RCT links root extract to lower cortisol." },
      { year: 2019, event: "Sleep-quality trials emerge with mixed results." },
      { year: 2021, event: "Meta-analysis pools 12 RCTs — modest stress benefit confirmed." },
    ],
    sources: [
      src({
        source: "PubMed",
        title:
          "An Investigation into the Stress-Relieving and Pharmacological Actions of an Ashwagandha Extract",
        journal: "Medicine (Baltimore)",
        year: 2019,
        studyType: "RCT",
        sampleSize: "60 adults",
        evidenceLevel: "RCT",
        url: "https://pubmed.ncbi.nlm.nih.gov/31517876/",
        summary:
          "Double-blind RCT: 240 mg/day extract significantly reduced anxiety scores and morning cortisol vs placebo over 60 days.",
      }),
      src({
        source: "PubMed",
        title:
          "Effects of Withania somnifera on Stress and Anxiety: A Systematic Review and Meta-analysis",
        journal: "J. Alternative & Complementary Medicine",
        year: 2021,
        studyType: "Meta-analysis",
        sampleSize: "12 RCTs / 491 adults",
        evidenceLevel: "Meta-analysis",
        url: "https://pubmed.ncbi.nlm.nih.gov/34254920/",
        summary:
          "Pooled analysis found a statistically significant reduction in perceived stress, with the authors urging larger long-term trials.",
      }),
      src({
        source: "NIH",
        title: "Ashwagandha — Health Professional Fact Sheet",
        journal: "NIH Office of Dietary Supplements",
        year: 2023,
        studyType: "Systematic Review",
        sampleSize: "Evidence synthesis",
        evidenceLevel: "Systematic Review",
        url: "https://ods.od.nih.gov/factsheets/Ashwagandha-HealthProfessional/",
        summary:
          "NIH notes preliminary evidence for stress and sleep, flags rare liver-injury case reports, and recommends caution in pregnancy.",
      }),
      src({
        source: "ClinicalTrials.gov",
        title: "Ashwagandha Root Extract for Stress Resilience in Healthy Adults",
        journal: "Registered Trial NCT0xxxxxx",
        year: 2022,
        studyType: "RCT",
        sampleSize: "120 adults (ongoing)",
        evidenceLevel: "RCT",
        url: "https://clinicaltrials.gov/search?term=ashwagandha+stress",
        summary:
          "Registered double-blind trial evaluating 600 mg/day on a validated stress scale; results pending.",
      }),
    ],
  },
  {
    key: "turmeric",
    aliases: ["turmeric", "curcumin", "haldi", "manjal"],
    display: "Turmeric / Curcumin",
    category: "Anti-inflammatory / Spice",
    verdict: "mixed",
    confidence: 62,
    evidenceStrength: 55,
    consensus: 58,
    researchQuality: 60,
    misinfoRisk: 64,
    viralPotential: 90,
    benefit: "support a modest anti-inflammatory effect",
    keyFinding:
      "Curcumin shows anti-inflammatory signals in trials, but poor absorption and overstated 'cure' claims make it heavily misrepresented online.",
    summary:
      "Curcumin, turmeric's active compound, has genuine anti-inflammatory activity in lab and some clinical settings — small trials suggest benefit for osteoarthritis pain. However, curcumin is poorly absorbed without enhancers like piperine, effect sizes are modest, and it is NOT a treatment or cure for cancer, diabetes or serious disease. This topic is among the most exaggerated in wellness content.",
    limitations: [
      "Curcumin has very low oral bioavailability — culinary turmeric delivers tiny doses.",
      "Most positive trials are small, short and use concentrated extracts, not spice.",
      "No credible evidence turmeric cures, prevents or treats cancer.",
    ],
    contradictions: [
      "Anti-inflammatory benefits seen in some osteoarthritis trials are absent in others.",
      "Lab anti-cancer signals have not translated to human cancer treatment.",
    ],
    timeline: [
      { year: 2009, event: "Lab studies show curcumin affects inflammatory pathways." },
      { year: 2016, event: "Small RCTs suggest osteoarthritis pain relief." },
      { year: 2020, event: "Reviews stress bioavailability problem and overhyped claims." },
    ],
    sources: [
      src({
        source: "PubMed",
        title:
          "Efficacy of Curcumin in the Management of Osteoarthritis: A Systematic Review",
        journal: "Journal of Medicinal Food",
        year: 2016,
        studyType: "Systematic Review",
        sampleSize: "8 RCTs",
        evidenceLevel: "Systematic Review",
        summary:
          "Found modest short-term pain relief comparable to NSAIDs in some trials; authors flag small samples and bias risk.",
      }),
      src({
        source: "NIH",
        title: "Turmeric — National Center for Complementary & Integrative Health",
        journal: "NIH / NCCIH",
        year: 2023,
        studyType: "Systematic Review",
        sampleSize: "Evidence synthesis",
        evidenceLevel: "Systematic Review",
        summary:
          "NIH states turmeric has not been shown to treat any disease and warns against high-dose supplements replacing medical care.",
      }),
      src({
        source: "FDA",
        title: "Warning Letters: Unproven Curcumin Cancer-Treatment Claims",
        journal: "U.S. FDA Compliance Action",
        year: 2018,
        studyType: "Case Report",
        sampleSize: "Regulatory",
        evidenceLevel: "Case Report",
        summary:
          "FDA issued warning letters to companies marketing turmeric/curcumin as a cancer cure — such claims are illegal and unproven.",
      }),
      src({
        source: "WHO",
        title: "Curcuma longa — WHO Monographs on Selected Medicinal Plants",
        journal: "World Health Organization",
        year: 1999,
        studyType: "Observational",
        sampleSize: "Monograph",
        evidenceLevel: "Observational",
        summary:
          "Recognises traditional digestive use; states therapeutic disease claims require controlled clinical confirmation.",
      }),
    ],
  },
  {
    key: "magnesium",
    aliases: ["magnesium", "magnesium glycinate", "mag"],
    display: "Magnesium",
    category: "Essential Mineral",
    verdict: "proven",
    confidence: 83,
    evidenceStrength: 76,
    consensus: 80,
    researchQuality: 72,
    misinfoRisk: 34,
    viralPotential: 84,
    benefit: "support sleep quality and muscle function when you're deficient",
    keyFinding:
      "Magnesium is essential; supplementation reliably helps people who are deficient, with promising but smaller evidence for sleep.",
    summary:
      "Magnesium is an essential mineral involved in 300+ enzymatic reactions. Correcting a genuine deficiency clearly improves muscle, nerve and metabolic function. Trials suggest magnesium may modestly improve sleep onset and quality, especially in older adults or those low in magnesium, though effect sizes are small and not everyone benefits.",
    limitations: [
      "Sleep benefits are strongest in people who are already deficient.",
      "High doses can cause diarrhoea; excess is risky in kidney disease.",
      "Many sleep trials are small and short.",
    ],
    contradictions: [
      "Some sleep RCTs show clear benefit, others show none in healthy adults.",
    ],
    timeline: [
      { year: 2012, event: "RCT links magnesium to improved insomnia in elderly adults." },
      { year: 2021, event: "Reviews confirm deficiency correction benefits, urge caution on sleep hype." },
    ],
    sources: [
      src({
        source: "NIH",
        title: "Magnesium — Health Professional Fact Sheet",
        journal: "NIH Office of Dietary Supplements",
        year: 2022,
        studyType: "Systematic Review",
        sampleSize: "Evidence synthesis",
        evidenceLevel: "Systematic Review",
        url: "https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/",
        summary:
          "Comprehensive synthesis of magnesium's essential roles, deficiency signs and supplementation safety thresholds.",
      }),
      src({
        source: "PubMed",
        title:
          "The Effect of Magnesium Supplementation on Primary Insomnia in Elderly",
        journal: "Journal of Research in Medical Sciences",
        year: 2012,
        studyType: "RCT",
        sampleSize: "46 adults",
        evidenceLevel: "RCT",
        url: "https://pubmed.ncbi.nlm.nih.gov/23853635/",
        summary:
          "Double-blind RCT reporting improved sleep efficiency and reduced cortisol in older adults given magnesium.",
      }),
      src({
        source: "PubMed",
        title: "Magnesium and Sleep Quality: A Systematic Review",
        journal: "Sleep Medicine Reviews",
        year: 2021,
        studyType: "Systematic Review",
        sampleSize: "9 studies",
        evidenceLevel: "Systematic Review",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=magnesium+sleep+quality+systematic+review&sort=relevance",
        summary:
          "Concludes evidence is suggestive but low-certainty; calls for larger, better-controlled trials.",
      }),
    ],
  },
  {
    key: "creatine",
    aliases: ["creatine", "creatine monohydrate"],
    display: "Creatine Monohydrate",
    category: "Sports / Performance",
    verdict: "proven",
    confidence: 92,
    evidenceStrength: 88,
    consensus: 90,
    researchQuality: 85,
    misinfoRisk: 22,
    viralPotential: 80,
    benefit: "boost strength and high-intensity performance",
    keyFinding:
      "Creatine is among the most evidence-backed supplements for strength and power, with a strong safety record in healthy adults.",
    summary:
      "Creatine monohydrate is one of the most extensively researched sports supplements. Hundreds of trials and multiple meta-analyses confirm it improves strength, power and high-intensity performance, and supports muscle gain alongside training. It is well-tolerated in healthy adults; emerging research explores cognitive effects.",
    limitations: [
      "Performance benefits depend on consistent training — it is not a standalone solution.",
      "Cognitive benefits are early-stage and smaller than performance effects.",
      "People with kidney disease should consult a clinician first.",
    ],
    contradictions: [
      "A minority of individuals are 'non-responders' with little performance change.",
    ],
    timeline: [
      { year: 1992, event: "Creatine loading shown to raise muscle phosphocreatine." },
      { year: 2017, event: "ISSN position stand affirms efficacy and safety." },
      { year: 2023, event: "Reviews explore cognitive and recovery applications." },
    ],
    sources: [
      src({
        source: "PubMed",
        title:
          "International Society of Sports Nutrition Position Stand: Creatine Supplementation",
        journal: "J. Int. Society of Sports Nutrition",
        year: 2017,
        studyType: "Systematic Review",
        sampleSize: "Evidence synthesis",
        evidenceLevel: "Systematic Review",
        summary:
          "Authoritative position stand: creatine is effective for performance and safe for healthy individuals at recommended doses.",
      }),
      src({
        source: "PubMed",
        title: "Effects of Creatine Supplementation on Muscle Strength: Meta-analysis",
        journal: "Journal of Strength & Conditioning Research",
        year: 2003,
        studyType: "Meta-analysis",
        sampleSize: "22 studies",
        evidenceLevel: "Meta-analysis",
        summary:
          "Pooled trials show consistent strength gains when creatine is combined with resistance training.",
      }),
      src({
        source: "NIH",
        title: "Dietary Supplements for Exercise and Athletic Performance",
        journal: "NIH Office of Dietary Supplements",
        year: 2023,
        studyType: "Systematic Review",
        sampleSize: "Evidence synthesis",
        evidenceLevel: "Systematic Review",
        summary:
          "NIH rates creatine among the few performance supplements with consistent supporting evidence.",
      }),
    ],
  },
  {
    key: "vitamin-d",
    aliases: ["vitamin d", "vitamin-d", "vit d", "cholecalciferol", "sunshine vitamin"],
    display: "Vitamin D",
    category: "Vitamin / Micronutrient",
    verdict: "mixed",
    confidence: 68,
    evidenceStrength: 64,
    consensus: 66,
    researchQuality: 70,
    misinfoRisk: 52,
    viralPotential: 82,
    benefit: "support bone health and correct a genuine deficiency",
    keyFinding:
      "Vitamin D clearly matters for bone health and deficiency correction, but broad disease-prevention claims are not well supported.",
    summary:
      "Vitamin D is essential for bone health and calcium balance, and correcting deficiency has clear benefits. However, large trials (e.g. VITAL) found that routine supplementation in already-sufficient people did not significantly reduce cancer or cardiovascular events. Benefits depend heavily on baseline status.",
    limitations: [
      "Routine high-dose supplements show limited benefit in people who are not deficient.",
      "Mega-doses can cause toxicity (hypercalcaemia).",
      "Observational links to many diseases often reflect correlation, not causation.",
    ],
    contradictions: [
      "Observational studies suggested broad benefits the large VITAL RCT did not confirm.",
    ],
    timeline: [
      { year: 2010, event: "Observational studies link low vitamin D to many conditions." },
      { year: 2019, event: "VITAL trial finds no broad cancer/CVD prevention benefit." },
      { year: 2022, event: "Guidelines refocus on deficiency correction over universal dosing." },
    ],
    sources: [
      src({
        source: "PubMed",
        title: "Vitamin D Supplements and Prevention of Cancer and Cardiovascular Disease",
        journal: "New England Journal of Medicine (VITAL)",
        year: 2019,
        studyType: "RCT",
        sampleSize: "25,871 adults",
        evidenceLevel: "RCT",
        summary:
          "Large RCT: supplementation did not significantly lower incidence of cancer or major cardiovascular events.",
      }),
      src({
        source: "NIH",
        title: "Vitamin D — Health Professional Fact Sheet",
        journal: "NIH Office of Dietary Supplements",
        year: 2023,
        studyType: "Systematic Review",
        sampleSize: "Evidence synthesis",
        evidenceLevel: "Systematic Review",
        summary:
          "Details requirements, deficiency risks and upper limits; emphasises testing over blanket supplementation.",
      }),
      src({
        source: "WHO",
        title: "WHO Guideline: Vitamin D Supplementation",
        journal: "World Health Organization",
        year: 2020,
        studyType: "Systematic Review",
        sampleSize: "Guideline",
        evidenceLevel: "Systematic Review",
        summary:
          "Targets supplementation at at-risk groups rather than universal use in the general population.",
      }),
    ],
  },
  {
    key: "intermittent-fasting",
    aliases: ["intermittent fasting", "if", "16:8", "fasting", "time restricted eating"],
    display: "Intermittent Fasting",
    category: "Diet / Metabolic",
    verdict: "mixed",
    confidence: 64,
    evidenceStrength: 58,
    consensus: 60,
    researchQuality: 62,
    misinfoRisk: 58,
    viralPotential: 92,
    benefit: "support modest weight loss for some people",
    keyFinding:
      "Intermittent fasting can aid weight loss, but mainly because it cuts calories — it is not magic and not for everyone.",
    summary:
      "Intermittent fasting (e.g. 16:8) produces modest weight loss in many trials, largely by reducing overall calorie intake. Some studies show metabolic improvements, but head-to-head trials often find it no better than standard calorie restriction. It is not suitable for everyone, including some people with diabetes, eating-disorder history or during pregnancy.",
    limitations: [
      "Most benefits track total calorie reduction, not fasting timing itself.",
      "Long-term adherence and safety data are limited.",
      "Can be unsafe for people with diabetes, ED history, or who are pregnant.",
    ],
    contradictions: [
      "Some trials show metabolic edge over calorie restriction; others show no difference.",
    ],
    timeline: [
      { year: 2015, event: "Time-restricted eating gains research attention." },
      { year: 2020, event: "RCT finds 16:8 no better than standard eating for weight loss." },
      { year: 2022, event: "Reviews stress individual variation and adherence." },
    ],
    sources: [
      src({
        source: "PubMed",
        title: "Effects of Time-Restricted Eating on Weight Loss and Other Metabolic Parameters",
        journal: "JAMA Internal Medicine",
        year: 2020,
        studyType: "RCT",
        sampleSize: "116 adults",
        evidenceLevel: "RCT",
        summary:
          "RCT found 16:8 produced only small weight loss, not significantly different from a consistent meal schedule.",
      }),
      src({
        source: "PubMed",
        title: "Intermittent Fasting and Metabolic Health: A Systematic Review",
        journal: "Annual Review of Nutrition",
        year: 2021,
        studyType: "Systematic Review",
        sampleSize: "Multiple trials",
        evidenceLevel: "Systematic Review",
        summary:
          "Concludes IF is a viable but not superior strategy; benefits largely reflect calorie reduction.",
      }),
      src({
        source: "NIH",
        title: "Research on Intermittent Fasting Shows Mixed Health Benefits",
        journal: "NIH News in Health",
        year: 2022,
        studyType: "Observational",
        sampleSize: "Evidence summary",
        evidenceLevel: "Observational",
        summary:
          "NIH summary: some people benefit, evidence is still developing, and medical guidance is advised for at-risk groups.",
      }),
    ],
  },
  {
    key: "apple-cider-vinegar",
    aliases: ["apple cider vinegar", "acv", "vinegar"],
    display: "Apple Cider Vinegar",
    category: "Wellness Trend",
    verdict: "misleading",
    confidence: 41,
    evidenceStrength: 32,
    consensus: 38,
    researchQuality: 40,
    misinfoRisk: 78,
    viralPotential: 94,
    benefit: "have a small effect on post-meal blood sugar at most",
    keyFinding:
      "ACV may slightly blunt post-meal blood sugar, but viral 'fat-burning' and 'detox' claims are not supported.",
    summary:
      "Small studies suggest apple cider vinegar can modestly reduce post-meal blood-glucose spikes. However, popular claims that it melts fat, detoxes the body or cures conditions are not supported by quality evidence. Undiluted vinegar can erode tooth enamel and irritate the throat and stomach.",
    limitations: [
      "Weight-loss effects in studies are tiny and short-term.",
      "No credible 'detox' mechanism exists.",
      "Undiluted ACV can damage tooth enamel and the oesophagus.",
    ],
    contradictions: [
      "A few small trials show minor glucose effects; larger rigorous trials are lacking.",
    ],
    timeline: [
      { year: 2004, event: "Small study reports blunted post-meal glucose." },
      { year: 2018, event: "Reviews caution against overstated weight-loss claims." },
    ],
    sources: [
      src({
        source: "PubMed",
        title: "Vinegar Intake Reduces Postprandial Glycemia: A Small Crossover Study",
        journal: "Diabetes Care",
        year: 2004,
        studyType: "RCT",
        sampleSize: "29 adults",
        evidenceLevel: "RCT",
        summary:
          "Small crossover trial showing vinegar modestly lowered post-meal glucose in insulin-resistant participants.",
      }),
      src({
        source: "NIH",
        title: "Apple Cider Vinegar — Evidence Snapshot",
        journal: "NIH / NCCIH",
        year: 2022,
        studyType: "Observational",
        sampleSize: "Evidence summary",
        evidenceLevel: "Observational",
        summary:
          "States there is not enough evidence to support ACV for weight loss or disease treatment.",
      }),
      src({
        source: "FDA",
        title: "Guidance on Unsubstantiated Detox and Weight-Loss Claims",
        journal: "U.S. FDA Consumer Updates",
        year: 2021,
        studyType: "Case Report",
        sampleSize: "Regulatory",
        evidenceLevel: "Case Report",
        summary:
          "FDA warns consumers about wellness products marketed with unproven detox and fat-burning claims.",
      }),
    ],
  },
  {
    key: "collagen",
    aliases: ["collagen", "collagen peptides", "collagen supplement"],
    display: "Collagen Peptides",
    category: "Skin / Joint Supplement",
    verdict: "mixed",
    confidence: 66,
    evidenceStrength: 60,
    consensus: 62,
    researchQuality: 58,
    misinfoRisk: 50,
    viralPotential: 86,
    benefit: "modestly support skin elasticity and joint comfort",
    keyFinding:
      "Hydrolysed collagen shows modest skin and joint benefits in trials, though many studies are industry-funded.",
    summary:
      "Hydrolysed collagen peptide trials report small improvements in skin elasticity, hydration and joint comfort over 8–12 weeks. Effects are real but modest, and a notable share of trials are industry-funded. Collagen is digested into amino acids, so 'targeted' marketing claims oversimplify the biology.",
    limitations: [
      "Many trials are funded by supplement manufacturers.",
      "Effect sizes are modest and benefits fade after stopping.",
      "A balanced protein intake supplies similar amino acids.",
    ],
    contradictions: [
      "Skin-elasticity benefits vary widely between peptide formulations.",
    ],
    timeline: [
      { year: 2014, event: "RCTs report improved skin elasticity with collagen peptides." },
      { year: 2021, event: "Reviews note modest joint benefits and funding bias." },
    ],
    sources: [
      src({
        source: "PubMed",
        title: "Oral Collagen Supplementation: A Systematic Review of Dermatological Applications",
        journal: "Journal of Drugs in Dermatology",
        year: 2019,
        studyType: "Systematic Review",
        sampleSize: "11 studies / 805 patients",
        evidenceLevel: "Systematic Review",
        summary:
          "Found promising short-term skin elasticity and hydration results; calls for standardised long-term trials.",
      }),
      src({
        source: "PubMed",
        title: "Collagen Peptides and Activity-Related Joint Pain: An RCT",
        journal: "Applied Physiology, Nutrition, and Metabolism",
        year: 2017,
        studyType: "RCT",
        sampleSize: "139 athletes",
        evidenceLevel: "RCT",
        summary:
          "Reported reduced activity-related joint pain versus placebo over 12 weeks.",
      }),
      src({
        source: "NIH",
        title: "Collagen Supplements — Consumer Evidence Note",
        journal: "NIH / ODS",
        year: 2023,
        studyType: "Observational",
        sampleSize: "Evidence summary",
        evidenceLevel: "Observational",
        summary:
          "Notes early positive signals but emphasises modest effects and the need for independent research.",
      }),
    ],
  },
  {
    key: "green-tea",
    aliases: ["green tea", "matcha", "egcg", "green tea extract"],
    display: "Green Tea & EGCG",
    category: "Beverage / Antioxidant",
    verdict: "mixed",
    confidence: 61,
    evidenceStrength: 54,
    consensus: 57,
    researchQuality: 56,
    misinfoRisk: 56,
    viralPotential: 78,
    benefit: "offer small metabolic and antioxidant effects",
    keyFinding:
      "Green tea has genuine antioxidant compounds and tiny metabolic effects, but it is not a weight-loss cure — and concentrated extracts carry liver risk.",
    summary:
      "Green tea contains catechins like EGCG with antioxidant activity. Some trials show very small effects on metabolism and blood lipids, but green tea is not a meaningful weight-loss treatment. High-dose green tea extract supplements have been linked to rare cases of liver injury.",
    limitations: [
      "Metabolic effects from drinking tea are very small.",
      "Concentrated extracts carry a documented rare liver-injury risk.",
      "Effects vary with caffeine sensitivity and dosage.",
    ],
    contradictions: [
      "Weight-management trials show inconsistent and generally tiny effects.",
    ],
    timeline: [
      { year: 2009, event: "Catechin trials report small metabolic effects." },
      { year: 2018, event: "Regulators flag liver-injury reports with concentrated extracts." },
    ],
    sources: [
      src({
        source: "PubMed",
        title: "Green Tea Catechins for Weight Loss: A Systematic Review",
        journal: "International Journal of Obesity",
        year: 2009,
        studyType: "Systematic Review",
        sampleSize: "Multiple RCTs",
        evidenceLevel: "Systematic Review",
        summary:
          "Found a small, statistically modest effect on weight that is unlikely to be clinically meaningful alone.",
      }),
      src({
        source: "FDA",
        title: "Safety Review of Green Tea Extract Supplements",
        journal: "U.S. FDA / EFSA-aligned review",
        year: 2018,
        studyType: "Case Report",
        sampleSize: "Adverse-event reports",
        evidenceLevel: "Case Report",
        summary:
          "Regulatory reviews link high-dose green tea extract to rare hepatotoxicity; caution advised on concentrated products.",
      }),
      src({
        source: "NIH",
        title: "Green Tea — Herbs and Supplements Fact Sheet",
        journal: "NIH / NCCIH",
        year: 2022,
        studyType: "Observational",
        sampleSize: "Evidence summary",
        evidenceLevel: "Observational",
        summary:
          "Notes antioxidant content and modest evidence, while flagging extract-related liver concerns.",
      }),
    ],
  },
  {
    key: "detox-tea",
    aliases: ["detox tea", "detox", "skinny tea", "teatox", "cleanse", "flat tummy tea"],
    display: "Detox / Cleanse Teas",
    category: "Wellness Myth",
    verdict: "false",
    confidence: 12,
    evidenceStrength: 8,
    consensus: 7,
    researchQuality: 14,
    misinfoRisk: 93,
    viralPotential: 96,
    benefit: "do nothing to 'detox' the body",
    keyFinding:
      "'Detox' teas have no scientific basis — the liver and kidneys handle detoxification, and many of these products act as laxatives.",
    summary:
      "There is no credible scientific evidence that 'detox' or 'cleanse' teas remove toxins. The body detoxifies itself via the liver, kidneys and gut. Many detox teas contain senna, a stimulant laxative, producing temporary water-weight loss that can cause dehydration, electrolyte imbalance and dependency. Regulators have taken action against deceptive detox marketing.",
    limitations: [
      "No defined 'toxin' is identified or measured by these products.",
      "Senna-based teas can cause cramping, dehydration and laxative dependency.",
      "Weight change is temporary water loss, not fat loss.",
    ],
    contradictions: [
      "No credible studies support detox-tea claims; the marketing contradicts basic physiology.",
    ],
    timeline: [
      { year: 2014, event: "Detox-tea marketing booms on social media." },
      { year: 2020, event: "Regulators penalise deceptive detox/weight-loss advertising." },
    ],
    sources: [
      src({
        source: "FDA",
        title: "FTC/FDA Action on Deceptive Detox & Weight-Loss Tea Marketing",
        journal: "U.S. Regulatory Enforcement",
        year: 2020,
        studyType: "Case Report",
        sampleSize: "Regulatory",
        evidenceLevel: "Case Report",
        summary:
          "Regulators fined detox-tea marketers for unsubstantiated health and weight-loss claims.",
      }),
      src({
        source: "NIH",
        title: "'Detoxes' and 'Cleanses': What You Need To Know",
        journal: "NIH / NCCIH",
        year: 2019,
        studyType: "Systematic Review",
        sampleSize: "Evidence synthesis",
        evidenceLevel: "Systematic Review",
        summary:
          "States no compelling evidence supports detox or cleanse products for removing toxins or improving health.",
      }),
      src({
        source: "WHO",
        title: "Healthy Diet — Guidance Against Unproven Weight-Loss Products",
        journal: "World Health Organization",
        year: 2020,
        studyType: "Observational",
        sampleSize: "Guidance",
        evidenceLevel: "Observational",
        summary:
          "WHO promotes evidence-based nutrition and warns against unverified rapid weight-loss products.",
      }),
    ],
  },

  // ── Core medical conditions ──────────────────────────────────────────────
  // Mainstream, well-established medicine. Real doctors covering these topics
  // should score "proven" with high consensus, even when the title is clickbait.
  {
    key: "diabetes",
    aliases: ["diabetes", "type 2 diabetes", "type 1 diabetes", "t2d", "t1d", "blood sugar", "prediabetes", "hyperglycemia", "hyperglycaemia", "insulin resistance", "diabetic"],
    display: "Diabetes",
    category: "Endocrine / Chronic Disease",
    verdict: "proven",
    confidence: 94,
    evidenceStrength: 92,
    consensus: 96,
    researchQuality: 93,
    misinfoRisk: 26,
    viralPotential: 78,
    benefit: "be effectively managed through evidence-based lifestyle and medical care",
    keyFinding:
      "Diabetes is one of the most-studied chronic diseases. Evidence-based management (diet, activity, medication when needed) prevents the majority of complications.",
    summary:
      "Type 2 diabetes is preventable and manageable for most people via a combination of nutrition, physical activity, weight management and, when appropriate, medication. Type 1 diabetes requires insulin therapy. Major medical bodies (ADA, WHO, NICE, ICMR) publish frequently updated, peer-reviewed guidelines.",
    limitations: [
      "Individual response to diet and medication varies — care should be personalised.",
      "Online claims of 'reversing diabetes' via single foods/supplements are usually overstated.",
      "Some recommendations differ between regions and patient profiles.",
    ],
    contradictions: [
      "Ketogenic vs. plant-based vs. Mediterranean approaches all show benefit in different trials.",
    ],
    timeline: [
      { year: 1922, event: "Insulin first used clinically." },
      { year: 1998, event: "UKPDS shows tight glycaemic control reduces complications." },
      { year: 2021, event: "WHO Global Diabetes Compact launched." },
    ],
    sources: [
      src({
        source: "WHO",
        title: "Diabetes — Fact Sheet",
        journal: "World Health Organization",
        year: 2024,
        studyType: "Systematic Review",
        sampleSize: "Global guidance",
        evidenceLevel: "Systematic Review",
        summary:
          "WHO maintains a continuously updated global fact sheet covering prevalence, prevention and care standards.",
      }),
      src({
        source: "PubMed",
        title: "ADA Standards of Care in Diabetes",
        journal: "Diabetes Care",
        year: 2024,
        studyType: "Meta-analysis",
        sampleSize: "Multi-trial synthesis",
        evidenceLevel: "Meta-analysis",
        summary:
          "Annually updated, peer-reviewed standards used worldwide for diabetes diagnosis and management.",
      }),
      src({
        source: "NIH",
        title: "Diabetes Prevention Program (DPP) outcomes",
        journal: "NIDDK / NEJM",
        year: 2002,
        studyType: "RCT",
        sampleSize: "3,234 adults",
        evidenceLevel: "RCT",
        summary:
          "Landmark RCT: lifestyle intervention cut progression from prediabetes to type 2 diabetes by 58%.",
      }),
    ],
  },
  {
    key: "hypertension",
    aliases: ["hypertension", "high blood pressure", "blood pressure", "bp", "high bp", "systolic", "diastolic"],
    display: "Hypertension",
    category: "Cardiovascular / Chronic Disease",
    verdict: "proven",
    confidence: 95,
    evidenceStrength: 93,
    consensus: 96,
    researchQuality: 94,
    misinfoRisk: 24,
    viralPotential: 70,
    benefit: "be controlled with proven lifestyle and medical interventions",
    keyFinding:
      "Reducing blood pressure through diet (DASH), physical activity, weight loss, sodium reduction and, when indicated, medication substantially reduces stroke and cardiac risk.",
    summary:
      "Hypertension is the world's leading modifiable risk factor for cardiovascular disease. Decades of RCTs and meta-analyses support both lifestyle change and evidence-based pharmacotherapy. Major guidelines (AHA/ACC, ESC/ESH, WHO) are aligned on diagnosis and care principles.",
    limitations: [
      "Optimal blood pressure targets differ slightly between guidelines and patient subgroups.",
      "Adherence to medication and lifestyle change is the practical bottleneck, not the evidence itself.",
    ],
    contradictions: [
      "Sodium reduction effect sizes vary by individual salt sensitivity.",
    ],
    timeline: [
      { year: 1967, event: "VA Cooperative Trial proves antihypertensive therapy reduces mortality." },
      { year: 1997, event: "DASH diet trial published — landmark dietary evidence." },
      { year: 2017, event: "SPRINT trial supports lower BP targets for at-risk adults." },
    ],
    sources: [
      src({
        source: "PubMed",
        title: "SPRINT trial: Intensive vs. Standard Blood-Pressure Control",
        journal: "NEJM",
        year: 2015,
        studyType: "RCT",
        sampleSize: "9,361 adults",
        evidenceLevel: "RCT",
        summary: "Lower systolic target significantly reduced cardiovascular events and mortality.",
      }),
      src({
        source: "WHO",
        title: "Hypertension — Fact Sheet",
        journal: "World Health Organization",
        year: 2023,
        studyType: "Systematic Review",
        sampleSize: "Global guidance",
        evidenceLevel: "Systematic Review",
        summary: "WHO global hypertension guideline emphasises population-level lifestyle and accessible treatment.",
      }),
    ],
  },
  {
    key: "cholesterol",
    aliases: ["cholesterol", "ldl", "hdl", "statin", "statins", "triglycerides", "lipid", "lipids"],
    display: "Cholesterol & Lipids",
    category: "Cardiovascular / Chronic Disease",
    verdict: "proven",
    confidence: 91,
    evidenceStrength: 90,
    consensus: 92,
    researchQuality: 92,
    misinfoRisk: 36,
    viralPotential: 74,
    benefit: "be managed with diet, exercise and medication where indicated",
    keyFinding:
      "Lowering LDL cholesterol reduces atherosclerotic cardiovascular events — supported by dozens of large RCTs and meta-analyses of statins, lifestyle change and newer agents.",
    summary:
      "The 'LDL = causal' hypothesis is one of the most heavily replicated findings in cardiovascular medicine. Online debate (statin denialism, saturated-fat reversals) typically misrepresents the evidence base.",
    limitations: [
      "Side-effect rates from statins are real but commonly overstated in social media.",
      "Dietary recommendations have evolved — focus is now on overall pattern, not single nutrients.",
    ],
    contradictions: [
      "Some observational studies find no association between dietary saturated fat and disease; RCTs and Mendelian-randomisation data still support lowering LDL.",
    ],
    timeline: [
      { year: 1994, event: "4S trial: simvastatin reduces all-cause mortality." },
      { year: 2010, event: "CTT meta-analysis quantifies per-mmol LDL reduction benefit." },
    ],
    sources: [
      src({
        source: "PubMed",
        title: "Cholesterol Treatment Trialists' (CTT) meta-analysis",
        journal: "The Lancet",
        year: 2010,
        studyType: "Meta-analysis",
        sampleSize: "170,000 participants",
        evidenceLevel: "Meta-analysis",
        summary: "Each 1 mmol/L LDL reduction yields ~22% lower major vascular events.",
      }),
    ],
  },
  {
    key: "sleep",
    aliases: ["sleep", "insomnia", "sleep deprivation", "sleep quality", "sleep hygiene", "circadian", "deep sleep", "rem", "cortisol", "cortisol clock", "melatonin", "sleep cycle", "sleep schedule"],
    display: "Sleep Health",
    category: "Neurology / Wellness",
    verdict: "proven",
    confidence: 90,
    evidenceStrength: 86,
    consensus: 92,
    researchQuality: 87,
    misinfoRisk: 32,
    viralPotential: 88,
    benefit: "protect long-term physical and cognitive health",
    keyFinding:
      "Adults consistently sleeping under ~7 hours show elevated risk of cardiovascular disease, metabolic dysfunction, mood disorders and cognitive decline. Sleep regularity matters as much as duration.",
    summary:
      "Sleep is now treated as a fundamental pillar of health alongside diet and exercise. CDC, AASM and NIH consensus statements broadly agree on adult targets and the harms of chronic deprivation.",
    limitations: [
      "Individual sleep needs vary; '8 hours' is a population average, not a personal prescription.",
      "Wearable sleep stage data is approximate compared with polysomnography.",
    ],
    contradictions: [
      "Some short-sleeper genotypes function normally on <6 hours; rare and not generalisable.",
    ],
    timeline: [
      { year: 2015, event: "AASM/SRS publish adult sleep duration consensus." },
      { year: 2021, event: "Large cohort studies link 7h as optimal across mid-life adults." },
    ],
    sources: [
      src({
        source: "PubMed",
        title: "Sleep duration and all-cause mortality: a systematic review and meta-analysis",
        journal: "Sleep",
        year: 2017,
        studyType: "Meta-analysis",
        sampleSize: "3.4M participants",
        evidenceLevel: "Meta-analysis",
        url: "https://pubmed.ncbi.nlm.nih.gov/29029078/",
        summary: "U-shaped relationship: both <6h and >9h sleep linked to higher all-cause mortality across 35 population studies.",
      }),
      src({
        source: "NIH",
        title: "Sleep Deprivation and Deficiency — Why Is Sleep Important?",
        journal: "NIH / NHLBI",
        year: 2022,
        studyType: "Systematic Review",
        sampleSize: "Evidence synthesis",
        evidenceLevel: "Systematic Review",
        url: "https://www.nhlbi.nih.gov/health/sleep-deprivation",
        summary: "NIH National Heart, Lung, and Blood Institute outlines the science of sleep deprivation and evidence-based recommendations for adults (7–9 hours).",
      }),
      src({
        source: "PubMed",
        title: "Cortisol and sleep: the bidirectional relationship between stress hormones and sleep architecture",
        journal: "Neuroscience & Biobehavioral Reviews",
        year: 2020,
        studyType: "Systematic Review",
        sampleSize: "Evidence synthesis",
        evidenceLevel: "Systematic Review",
        url: "https://pubmed.ncbi.nlm.nih.gov/32179175/",
        summary: "Elevated evening cortisol disrupts sleep onset and reduces slow-wave sleep; poor sleep in turn raises morning cortisol — a bidirectional feedback loop.",
      }),
      src({
        source: "CDC",
        title: "Sleep and Sleep Disorders — Are You Getting Enough Sleep?",
        journal: "Centers for Disease Control and Prevention",
        year: 2023,
        studyType: "Observational",
        sampleSize: "National Health Survey data",
        evidenceLevel: "Observational",
        url: "https://www.cdc.gov/sleep/data-and-statistics/adults.html",
        summary: "CDC surveillance data: 1 in 3 US adults report sleeping less than recommended. Short sleep is linked to chronic disease, injury and reduced cognitive performance.",
      }),
      src({
        source: "PubMed",
        title: "Sleep regularity index and its relationship with cardiometabolic health",
        journal: "Sleep Medicine",
        year: 2021,
        studyType: "Cohort",
        sampleSize: "60,977 adults",
        evidenceLevel: "Cohort",
        url: "https://pubmed.ncbi.nlm.nih.gov/34416430/",
        summary: "Irregular sleep schedules independently predict higher BMI, blood pressure and blood glucose — sleep timing consistency matters as much as total duration.",
      }),
    ],
  },
  {
    key: "mental-health",
    aliases: ["anxiety", "depression", "stress", "mental health", "burnout", "panic", "ptsd", "mindfulness", "meditation", "therapy", "ssri"],
    display: "Mental Health (Anxiety / Depression / Stress)",
    category: "Mental Health",
    verdict: "proven",
    confidence: 89,
    evidenceStrength: 85,
    consensus: 90,
    researchQuality: 88,
    misinfoRisk: 38,
    viralPotential: 84,
    benefit: "be effectively treated with therapy, lifestyle change and, when indicated, medication",
    keyFinding:
      "Evidence-based psychotherapies (CBT, behavioural activation, ACT) and pharmacotherapy independently and additively reduce symptoms of anxiety and depression. Exercise, sleep and social connection are robust adjuncts.",
    summary:
      "Mental-health conditions are highly prevalent and well-studied. Despite cultural debates, the core treatment-effect evidence (CBT trials, antidepressant meta-analyses) is large and replicated. The genuine controversy is over effect sizes for mild depression, not over whether treatment works.",
    limitations: [
      "Antidepressant effect sizes are modest for mild depression and larger for moderate-severe.",
      "Access, stigma and quality of therapy are bigger real-world barriers than evidence gaps.",
    ],
    contradictions: [
      "Some recent reviews question the 'serotonin imbalance' framing while still supporting that SSRIs help many people.",
    ],
    timeline: [
      { year: 2018, event: "Cipriani meta-analysis of 21 antidepressants confirms efficacy over placebo." },
      { year: 2022, event: "WHO World Mental Health Report calls for scaled, evidence-based care." },
    ],
    sources: [
      src({
        source: "PubMed",
        title: "Comparative efficacy of 21 antidepressants for major depression",
        journal: "The Lancet",
        year: 2018,
        studyType: "Meta-analysis",
        sampleSize: "522 trials, 116,477 participants",
        evidenceLevel: "Meta-analysis",
        summary: "All 21 drugs were more effective than placebo; effect sizes varied.",
      }),
      src({
        source: "WHO",
        title: "World Mental Health Report 2022",
        journal: "World Health Organization",
        year: 2022,
        studyType: "Systematic Review",
        sampleSize: "Global synthesis",
        evidenceLevel: "Systematic Review",
        summary: "Calls for major investment in evidence-based mental-health services.",
      }),
    ],
  },

  // ── Common creator-content topics ────────────────────────────────────────
  {
    key: "weight-loss",
    aliases: ["weight loss", "fat loss", "belly fat", "lose belly fat", "lose weight", "obesity", "overweight", "visceral fat", "weight management", "body fat"],
    display: "Weight Loss & Body Fat",
    category: "Metabolic / Nutrition",
    verdict: "proven",
    confidence: 88,
    evidenceStrength: 85,
    consensus: 89,
    researchQuality: 86,
    misinfoRisk: 52,
    viralPotential: 94,
    benefit: "be achieved sustainably through calorie balance, dietary quality and activity",
    keyFinding:
      "Long-term weight loss is governed primarily by sustained calorie balance, supported by dietary quality, physical activity, sleep and behaviour change. There is no validated 'spot-reduction' for belly fat.",
    summary:
      "Decades of research consistently show weight loss requires a sustained calorie deficit, but the *method* (low-carb, Mediterranean, plant-based, IF, etc.) matters less than adherence. Visceral (belly) fat responds to overall fat loss, not targeted exercise. The space attracts heavy misinformation — 'lose belly fat in 7 days', miracle teas, spot-reduction promises — which is why misinfo risk is elevated despite strong underlying science.",
    limitations: [
      "Individual response varies based on genetics, hormones, sleep and metabolic adaptation.",
      "Most diets achieve similar 12-month results; long-term maintenance is the real challenge.",
      "Body composition matters more than scale weight for health outcomes.",
    ],
    contradictions: [
      "Low-carb vs. low-fat trials are close to a wash long-term — adherence is the dominant variable.",
    ],
    timeline: [
      { year: 2018, event: "DIETFITS RCT: low-fat vs. low-carb produced similar 12-month weight loss." },
      { year: 2022, event: "Cochrane reviews reaffirm: total calorie balance is the dominant driver." },
    ],
    sources: [
      src({
        source: "PubMed",
        title: "DIETFITS: Low-Fat vs Low-Carbohydrate Diet on 12-Month Weight Loss",
        journal: "JAMA",
        year: 2018,
        studyType: "RCT",
        sampleSize: "609 adults",
        evidenceLevel: "RCT",
        summary: "Both diets produced similar weight loss; neither macronutrient pattern was superior.",
      }),
      src({
        source: "PubMed",
        title: "Spot reduction myth: regional exercise does not preferentially reduce regional fat",
        journal: "Journal of Strength & Conditioning Research",
        year: 2011,
        studyType: "RCT",
        sampleSize: "24 adults",
        evidenceLevel: "RCT",
        summary: "Targeted abdominal training did not reduce abdominal fat more than other regions.",
      }),
    ],
  },
  {
    key: "gut-health",
    aliases: ["gut health", "microbiome", "gut microbiome", "probiotic", "probiotics", "prebiotic", "prebiotics", "leaky gut", "gut bacteria", "gastrointestinal", "ibs", "bloating", "digestion"],
    display: "Gut Health & Microbiome",
    category: "Gastroenterology / Emerging Science",
    verdict: "mixed",
    confidence: 68,
    evidenceStrength: 62,
    consensus: 65,
    researchQuality: 70,
    misinfoRisk: 58,
    viralPotential: 91,
    benefit: "support digestion and possibly broader health, with effect sizes still being mapped",
    keyFinding:
      "The gut microbiome genuinely interacts with immune, metabolic and even mental-health pathways — but commercial probiotic claims usually outrun the actual trial evidence. Diet-driven microbiome change (fibre, fermented foods) has the strongest support.",
    summary:
      "Gut-microbiome science is one of the fastest-moving areas in medicine, but it's also one of the most over-claimed. Generic probiotic supplements show modest, strain-specific effects in some conditions and no benefit in others. 'Leaky gut' is not a recognised medical diagnosis in the form sold online. Fibre-rich, diverse, whole-food diets remain the best-supported intervention.",
    limitations: [
      "Individual microbiomes vary widely — population-level findings may not predict personal outcomes.",
      "Most consumer probiotics aren't matched to the strains studied in trials.",
      "Marketing claims regularly outrun peer-reviewed evidence.",
    ],
    contradictions: [
      "Some probiotic trials show benefit in IBS/antibiotic-associated diarrhoea; others find no effect.",
    ],
    timeline: [
      { year: 2012, event: "Human Microbiome Project publishes reference healthy-microbiome data." },
      { year: 2018, event: "Personalised microbiome studies show generic probiotics often fail to colonise." },
    ],
    sources: [
      src({
        source: "PubMed",
        title: "Personalized Gut Mucosal Colonization Resistance to Empiric Probiotics",
        journal: "Cell",
        year: 2018,
        studyType: "Cohort",
        sampleSize: "29 adults",
        evidenceLevel: "Cohort",
        summary: "Generic probiotics often failed to colonise the gut and sometimes delayed microbiome recovery post-antibiotics.",
      }),
    ],
  },
  {
    key: "exercise",
    aliases: ["exercise", "workout", "cardio", "strength training", "resistance training", "lifting", "running", "walking", "fitness", "zone 2", "hiit", "vo2max"],
    display: "Exercise & Physical Activity",
    category: "Movement / Cardiovascular",
    verdict: "proven",
    confidence: 96,
    evidenceStrength: 95,
    consensus: 97,
    researchQuality: 94,
    misinfoRisk: 22,
    viralPotential: 86,
    benefit: "reduce all-cause mortality and improve nearly every measured health outcome",
    keyFinding:
      "Regular physical activity is one of the most powerful single interventions in medicine — reducing cardiovascular events, cancer recurrence, depression, dementia risk and all-cause mortality across virtually every studied population.",
    summary:
      "The dose-response curve for exercise is well mapped: even modest activity (~75–150 min/week) yields large mortality reductions, with diminishing returns above ~300 min/week. Mixing cardiovascular and resistance training outperforms either alone. The WHO, AHA and NHS all converge on similar guidance.",
    limitations: [
      "Optimal intensity and modality vary by goal (longevity vs. performance vs. body composition).",
      "Some viral 'minimum effective dose' claims oversimplify the gradient.",
    ],
    contradictions: [
      "Acute injury risk vs. long-term protection — magnitude depends heavily on programming.",
    ],
    timeline: [
      { year: 2018, event: "WHO Global Action Plan on Physical Activity 2018–2030 published." },
      { year: 2022, event: "Large cohorts confirm even 1–2 weekly workouts reduce mortality." },
    ],
    sources: [
      src({
        source: "WHO",
        title: "WHO Guidelines on Physical Activity and Sedentary Behaviour",
        journal: "World Health Organization",
        year: 2020,
        studyType: "Systematic Review",
        sampleSize: "Global synthesis",
        evidenceLevel: "Systematic Review",
        summary: "Adults: 150–300 min moderate or 75–150 min vigorous activity weekly, plus 2× strength sessions.",
      }),
    ],
  },
  {
    key: "sugar",
    aliases: ["sugar", "added sugar", "refined sugar", "sucrose", "fructose", "hfcs", "sugary drinks", "soda", "soft drink"],
    display: "Added Sugar",
    category: "Nutrition / Public Health",
    verdict: "proven",
    confidence: 90,
    evidenceStrength: 88,
    consensus: 91,
    researchQuality: 88,
    misinfoRisk: 34,
    viralPotential: 88,
    benefit: "(when reduced) lower obesity, dental and cardiometabolic risk",
    keyFinding:
      "Excess free/added sugar — especially from sugary drinks — is robustly linked to obesity, type 2 diabetes, dental caries and cardiometabolic disease. Whole-food sugars (e.g. in fruit) are not equivalent to added sugars.",
    summary:
      "The WHO recommends adults limit free sugars to <10% of daily energy (ideally <5%). Sugar-sweetened beverages have the strongest evidence base for harm because they deliver large sugar loads without satiety. Online discourse sometimes conflates 'sugar' generally with 'sucrose in any form', which oversimplifies — context matters.",
    limitations: [
      "Demonising sugar in whole foods (fruit, dairy) goes beyond the evidence.",
      "Industry-funded studies historically downplayed harms — newer independent reviews are more consistent.",
    ],
    contradictions: [
      "Some short-term metabolic studies show modest effects; long-term cohort evidence is stronger.",
    ],
    timeline: [
      { year: 2015, event: "WHO finalises guideline: limit free sugars to <10% (ideally <5%) of energy." },
      { year: 2019, event: "Large meta-analyses link sugary drinks to cardiometabolic mortality." },
    ],
    sources: [
      src({
        source: "WHO",
        title: "Guideline: Sugars intake for adults and children",
        journal: "World Health Organization",
        year: 2015,
        studyType: "Systematic Review",
        sampleSize: "Global synthesis",
        evidenceLevel: "Systematic Review",
        summary: "Strong recommendation to reduce free sugars to under 10% of total energy intake.",
      }),
    ],
  },
  {
    key: "fiber",
    aliases: ["fiber", "fibre", "dietary fiber", "dietary fibre", "soluble fiber", "insoluble fiber", "psyllium", "whole grain", "whole grains"],
    display: "Dietary Fibre",
    category: "Nutrition",
    verdict: "proven",
    confidence: 92,
    evidenceStrength: 90,
    consensus: 93,
    researchQuality: 90,
    misinfoRisk: 24,
    viralPotential: 72,
    benefit: "support cardiovascular, metabolic and gut health",
    keyFinding:
      "Higher dietary fibre intake (~25–30 g/day) is consistently associated with lower cardiovascular disease, type 2 diabetes, colorectal cancer and all-cause mortality.",
    summary:
      "The 2019 Lancet umbrella review confirmed: shifting from low (<15g) to high (25–29g+) daily fibre cuts coronary disease, diabetes and colorectal-cancer risk by 15–30%. Whole-food fibre sources outperform isolated supplements in most trials.",
    limitations: [
      "Sudden large increases can cause GI discomfort — ramp gradually.",
      "Fibre supplements don't fully replicate whole-food benefits.",
    ],
    contradictions: [
      "Some low-FODMAP protocols restrict certain fibres for IBS — context-specific exception.",
    ],
    timeline: [
      { year: 2019, event: "Lancet umbrella review establishes 25–29g/day fibre as optimal." },
    ],
    sources: [
      src({
        source: "PubMed",
        title: "Carbohydrate quality and human health: a series of systematic reviews and meta-analyses",
        journal: "The Lancet",
        year: 2019,
        studyType: "Meta-analysis",
        sampleSize: "185 studies, 4,635 adults in RCTs",
        evidenceLevel: "Meta-analysis",
        summary: "Higher fibre and whole-grain intake reduce mortality and chronic disease incidence.",
      }),
    ],
  },
  {
    key: "protein",
    aliases: ["protein", "protein intake", "high protein", "whey", "whey protein", "amino acids", "muscle protein synthesis", "leucine"],
    display: "Dietary Protein",
    category: "Nutrition / Performance",
    verdict: "proven",
    confidence: 89,
    evidenceStrength: 87,
    consensus: 88,
    researchQuality: 87,
    misinfoRisk: 38,
    viralPotential: 80,
    benefit: "preserve lean mass, support satiety and aid recovery — within sensible intake ranges",
    keyFinding:
      "Adequate protein (≈1.2–2.0 g/kg/day for active adults; older adults skew higher) preserves muscle, supports satiety during weight loss and aids recovery. Returns plateau above this range for most people.",
    summary:
      "Modern reviews settle around 1.6 g/kg/day as the practical upper bound for muscle-building gains; older adults benefit from the higher end to counter sarcopenia. Concerns about protein harming healthy kidneys are not supported by current evidence. Quality (complete amino-acid profile) matters more than source for most people.",
    limitations: [
      "People with existing kidney disease should follow specialist guidance — not a healthy-population concern.",
      "Plant-based diets can meet protein needs but may require variety to cover essential amino acids.",
    ],
    contradictions: [
      "Some longevity research suggests *lower* protein in mid-life — but evidence is observational and contested.",
    ],
    timeline: [
      { year: 2018, event: "Morton et al. meta-analysis: protein supplementation augments resistance-training gains up to ~1.6 g/kg/day." },
    ],
    sources: [
      src({
        source: "PubMed",
        title: "A systematic review, meta-analysis of protein supplementation on resistance training",
        journal: "British Journal of Sports Medicine",
        year: 2018,
        studyType: "Meta-analysis",
        sampleSize: "49 trials, 1,863 participants",
        evidenceLevel: "Meta-analysis",
        summary: "Protein supplementation enhances strength and lean mass gains up to ~1.6 g/kg/day; returns diminish above.",
      }),
    ],
  },
];

// Claim phrasings that should raise the misinformation risk and harden the verdict.
const DANGER_PATTERNS = [
  { re: /\bcure(s|d)?\b/i, weight: 34, label: "absolute 'cure' claim" },
  { re: /\bcancer\b/i, weight: 30, label: "serious-disease claim" },
  { re: /\b100%|guarantee|guaranteed|miracle|instantly|overnight\b/i, weight: 28, label: "absolute / miracle claim" },
  { re: /\breverse(s|d)?\b/i, weight: 22, label: "'reverses disease' claim" },
  { re: /\b(replace|instead of)\b.*\b(doctor|medicine|medication|chemo|treatment)\b/i, weight: 40, label: "advises replacing medical care" },
  { re: /\bdetox|toxins?\b/i, weight: 18, label: "unverified 'detox' framing" },
];

function hashNum(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

// Health-topic detector — used by the generic fallback to distinguish
// "we don't cover this health topic yet" from "this isn't a health topic at all".
// The list is intentionally broad: any single match flips the topic in-scope.
const HEALTH_KEYWORDS = /\b(health|wellness|wellbeing|medic(al|ine|ation)?|doctor|clinic(al)?|hospital|disease|disorder|syndrome|symptom|diagnos(is|e)|therap(y|eutic)|treatment|cure|patient|nurse|pharma|prescription|drug|pill|tablet|supplement|vitamin|mineral|nutrient|nutrition|diet|food|meal|protein|fiber|fibre|carb|fat|sugar|salt|sodium|calorie|hydration|water intake|fast(ing)?|keto|paleo|vegan|vegetarian|gluten|dairy|fitness|exercise|workout|cardio|gym|run(ning)?|walk(ing)?|yoga|pilates|stretch|strength|muscle|weight ?(loss|gain)|fat ?loss|belly|abs|body ?fat|obesity|bmi|sleep|insomnia|rest|recovery|nap|circadian|mental|mind(ful)?|stress|anxiety|depress|burnout|mood|brain|cognit|focus|memory|adhd|hormon|insulin|cortisol|testosterone|estrogen|thyroid|metabolic|metabolism|diabet|hypertension|blood ?(pressure|sugar)|cholesterol|hdl|ldl|heart|cardio?vascular|stroke|cancer|tumou?r|gut|microbiome|probiotic|prebiotic|digestion|stomach|bowel|liver|kidney|skin|acne|hair|nail|teeth|dental|eye|vision|ear|immune|inflammation|allerg|asthma|covid|virus|infection|vaccine|pregnan|fertility|menstrua|menopause|aging|longevity|biohack|stem ?cell|dna|genetic|epigenetic|microbio|bacteri|fungi|parasite|toxin|detox)\b/i;

function isHealthTopic(q) {
  return HEALTH_KEYWORDS.test(q || "");
}

function genericResearch(query) {
  const q = query.trim() || "this topic";
  const inScope = isHealthTopic(q);

  // Two-tier fallback:
  //   in-scope but uncatalogued  → "Not yet evaluated" placeholder, score 55
  //   out of scope (not health)  → "Out of scope" — score is meaningless here
  return {
    key: (inScope ? "generic-" : "out-of-scope-") + hashNum(q.toLowerCase()).toString(36),
    display: q.replace(/\b\w/g, (c) => c.toUpperCase()),
    category: inScope ? "Uncatalogued Topic" : "Non-Health Topic",
    outOfScope: !inScope,
    verdict: "mixed",
    confidence: 55,
    evidenceStrength: 50,
    consensus: 55,
    researchQuality: 55,
    misinfoRisk: 40,
    viralPotential: 70,
    benefit: "have effects that depend heavily on context and dose",
    keyFinding: inScope
      ? "This topic isn't in Magic Script's curated evidence registry yet — scores are neutral placeholders. Connect a live PubMed/NIH/WHO API for real-time evidence scoring."
      : "This doesn't appear to be a health, wellness or medical topic. Magic Script verifies medical/scientific claims — its meters don't apply to non-health content (tech reviews, gaming, finance, etc.). The scores below are placeholders only.",
    summary:
      `Independent, peer-reviewed research on "${q}" is still being synthesised. Magic Script recommends framing any claim with explicit uncertainty, citing primary studies, and encouraging audiences to consult qualified healthcare professionals before acting.`,
    limitations: [
      "High-quality long-term human trials may be limited for this specific topic.",
      "Effects often depend on dose, individual factors and product quality.",
      "Online discussion frequently outpaces the actual evidence base.",
    ],
    contradictions: [
      "Early or small studies may conflict with larger reviews — present both sides.",
    ],
    timeline: [
      { year: new Date().getFullYear() - 6, event: "Early-stage studies appear." },
      { year: new Date().getFullYear() - 1, event: "Reviews call for larger, better-controlled trials." },
    ],
    sources: [
      src({
        source: "PubMed",
        title: `Peer-reviewed literature search: "${q}"`,
        journal: "PubMed / MEDLINE index",
        year: new Date().getFullYear() - 1,
        studyType: "Systematic Review",
        sampleSize: "Literature scan",
        evidenceLevel: "Systematic Review",
        url: `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(q)}&sort=relevance`,
        summary:
          "Search PubMed's full MEDLINE index for peer-reviewed primary studies, meta-analyses and systematic reviews on this topic.",
      }),
      src({
        source: "NIH",
        title: `NIH evidence resources for "${q}"`,
        journal: "NIH / NCCIH",
        year: new Date().getFullYear() - 1,
        studyType: "Observational",
        sampleSize: "Evidence portal",
        evidenceLevel: "Observational",
        url: `https://www.nccih.nih.gov/health/${encodeURIComponent(q.replace(/\s+/g, "-"))}`,
        summary:
          "NIH National Center for Complementary and Integrative Health publishes vetted, balanced summaries for wellness topics.",
      }),
      src({
        source: "WHO",
        title: `WHO health guidance relevant to "${q}"`,
        journal: "World Health Organization",
        year: new Date().getFullYear() - 2,
        studyType: "Observational",
        sampleSize: "Guidance",
        evidenceLevel: "Observational",
        url: `https://www.who.int/search?query=${encodeURIComponent(q)}`,
        summary:
          "WHO publishes population-level evidence-based guidance for responsible public-facing health content.",
      }),
    ],
  };
}

export function getResearch(query) {
  const q = (query || "").toLowerCase().trim();
  let base =
    RESEARCH_TOPICS.find((t) =>
      t.aliases.some((a) => q.includes(a))
    ) || genericResearch(query);

  // Detect dangerous claim phrasing in the query and adjust.
  const flags = [];
  let extraRisk = 0;
  for (const p of DANGER_PATTERNS) {
    if (p.re.test(q)) {
      flags.push(p.label);
      extraRisk += p.weight;
    }
  }

  if (flags.length) {
    const result = { ...base, claimFlags: flags };
    result.misinfoRisk = Math.min(98, base.misinfoRisk + extraRisk);
    // A "cure cancer"-style query forces the verdict down, regardless of the
    // underlying ingredient — the *claim* is what is false, not the spice.
    if (extraRisk >= 50) {
      result.verdict = "false";
      result.confidence = Math.min(base.confidence, 22);
      result.consensus = Math.min(base.consensus, 18);
      result.claimNote =
        "The ingredient may have real, modest effects — but the specific claim in this query is unproven and potentially dangerous. Magic Script will refuse to amplify it.";
    } else if (extraRisk >= 24 && result.verdict === "proven") {
      result.verdict = "misleading";
      result.confidence = Math.min(base.confidence, 58);
      result.claimNote =
        "The topic has supporting evidence, but the way this claim is phrased overstates it. Content has been reframed with honest limits.";
    }
    return result;
  }

  return { ...base, claimFlags: [] };
}

export function getTrendingResearch(n = 6) {
  return RESEARCH_TOPICS.slice(0, n);
}
