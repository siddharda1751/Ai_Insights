/**
 * AUDIT PROMPT TEMPLATE
 *
 * Builds the AI prompt that produces the structured JSON audit object.
 *
 * Design principles:
 *  - Quality over quantity: fewer, sharper insights beat long essays.
 *  - Every section has a hard word/item limit baked into the prompt.
 *  - Empty sections are preferred over fabricated filler.
 *  - Output must be valid JSON — no markdown, no prose.
 */

// ─── Main Prompt Builder ──────────────────────────────────────────────────────

export const buildAuditPrompt = (leadData, scrapeData) => {
    // Compact company intelligence — only include fields that exist
    const companyBlock = buildCompanyBlock(leadData, scrapeData);

    return `You are a senior AI automation consultant generating content for a PROFESSIONAL EXECUTIVE PDF REPORT.

The report will be rendered inside a fixed PDF template with strict layout zones.
Your role is NOT to write essays. Your role is to produce concise, curated, executive-grade insights.

══════════════════════════════════════════════════════
COMPANY INTELLIGENCE
══════════════════════════════════════════════════════

${companyBlock}

══════════════════════════════════════════════════════
ANALYSIS OBJECTIVES
══════════════════════════════════════════════════════

Analyze this company across these dimensions:
- Digital presence and brand maturity
- Operational signals and workflow patterns
- AI/automation opportunities specific to their domain
- Strategic priorities given their size and industry
- Customer experience improvement potential

CRITICAL RULES:
1. Every insight MUST connect directly to THIS company's data.
2. Never use generic AI advice or buzzword fluff.
3. If meaningful insight is unavailable for a section — return [] or "".
4. Never mention "limited data", "scraping", or "unavailability".
5. Sound like a premium consulting firm. Be specific and confident.
6. SHORTER IS BETTER. This report is a visual dashboard, not an essay.
7. Every sentence must be independently scannable — no build-up, no preamble.

══════════════════════════════════════════════════════
SPECIFICITY ENFORCEMENT
══════════════════════════════════════════════════════

Every observation, weakness, strength, and recommendation MUST:
- Connect directly to the company's website signals, content, or technology stack
- Reflect their specific business model, industry context, and observed digital maturity
- Reference something concrete from the scraped data (headings, services, tech stack, business signals)

DO NOT include any insight that could apply to almost any company in any industry.

If you cannot produce a company-specific insight for a section, return [] or "" for that section.

EXAMPLES OF WHAT TO AVOID:
✗ "Lack of automation may slow growth."
✗ "AI could improve customer communication."
✗ "Manual processes create operational inefficiency."
✗ "Better CRM integration would help the sales team."

EXAMPLES OF WHAT TO WRITE:
✓ "Their services page lists 8 distinct offerings with no live chat — suggesting manual inbound qualification."
✓ "Absence of a client portal or login area on a B2B platform of this scale points to relationship-heavy ops."
✓ "API documentation presence signals technical readiness for workflow automation integrations."

══════════════════════════════════════════════════════
CAUTIOUS EXECUTIVE PHRASING
══════════════════════════════════════════════════════

You are analyzing a company from public web signals only.
You do NOT have access to internal operations, sales data, or staff structure.

Therefore you MUST use cautious, evidence-based phrasing when making observations:

PREFER:
- "No publicly visible..."
- "Limited observable evidence of..."
- "No clear indication of... on the public site"
- "The website does not surface..."
- "Based on visible signals..."
- "The public digital presence suggests..."

AVOID:
- Definitive operational conclusions ("They lack X")
- Assumptions about internal processes not visible on the website
- Speculative weaknesses inferred solely from missing public content
- Any phrasing that implies insider knowledge of the business

DO NOT infer operational dysfunction from the absence of website features alone.
A company may have mature internal systems not visible on their public site.

══════════════════════════════════════════════════════
AUTOMATION READINESS SCORE — CALIBRATION RULES
══════════════════════════════════════════════════════

The automationReadinessScore.score must realistically reflect the company's:
- Scale and organisational maturity (size, industry position)
- Observed technical infrastructure (tech stack signals, API presence, integrations)
- Digital sophistication (site quality, content depth, visible tooling)
- Business model complexity (B2B vs B2C, multi-product vs single-service)

USE THIS RUBRIC:
  0–30  = Low maturity: minimal digital infrastructure, no visible tech signals, simple static presence
 31–60  = Moderate maturity: some digital tooling, standard CMS/CRM signals, limited integration evidence
 61–80  = Strong maturity: clear technology stack, API/integration signals, multi-channel digital presence
 81–100 = Highly advanced: enterprise-grade infrastructure, observable automation/API ecosystem, platform-level scale

CALIBRATION GUIDELINES:
- Enterprise technology companies with clear tech stack signals should score 61–80 minimum
- Large B2B SaaS or platform companies should score 70+ unless strong contrary evidence exists
- Do NOT assign scores below 40 to companies with a professional multi-page website and clear service offerings
- Score must be JUSTIFIED by specific observable signals in the reasoning field
- Reasoning must cite at least one specific observed signal (tech stack, site structure, content depth)

══════════════════════════════════════════════════════
TEXT DENSITY RULES  (this is a visual dashboard, not an essay)
══════════════════════════════════════════════════════

1. Prefer SHORT single-sentence insights.
2. Avoid multi-clause explanations — one idea per bullet.
3. Avoid setup phrases: "It is worth noting that...", "This suggests that..."
4. Write conclusions directly: "No public chatbot visible — likely manual lead intake."
5. Opportunity cards must fit on a small PDF card — write for skimmability, not depth.
6. If an insight requires more than one sentence to be meaningful, omit it.

══════════════════════════════════════════════════════
STRICT CONTENT LENGTH RULES  (enforced by the PDF layout)
══════════════════════════════════════════════════════

executiveSummary        → max 55 words · 1 paragraph
companyPositioning      → max 45 words
strengths               → max 2 items · each item max 12 words
weaknesses              → max 2 items · each item max 12 words
brandObservations       → max 2 items · each item max 12 words
operationalObservations → max 3 items · each item max 14 words
customerExperienceInsights → max 3 items · each item max 14 words
aiAutomationOpportunities → max 3 opportunities
  · title               → max 6 words
  · problem             → max 12 words
  · solution            → max 14 words
  · impact              → max 10 words
  · complexity          → must be exactly: "Low" | "Medium" | "High"
strategicRecommendations → max 3 items · each item max 14 words
industryTrends          → max 3 items · each item max 14 words
competitiveAnalysis     → max 40 words
automationReadinessScore.reasoning → max 25 words · must cite a specific observable signal
quickWins               → max 2 items · each item max 12 words
longTermOpportunities   → max 2 items · each item max 14 words
personalizedClosingInsight → max 35 words

══════════════════════════════════════════════════════
OPPORTUNITY CARD FORMAT  (strict — these render inside small PDF cards)
══════════════════════════════════════════════════════

Each opportunity uses these exact field names:
{
  "title": "",       ← max 6 words, action-oriented
  "problem": "",     ← max 12 words, one-line observable pain point
  "solution": "",    ← max 14 words, one-line AI/automation fix
  "impact": "",      ← max 10 words, one-line business outcome
  "complexity": ""   ← exactly "Low", "Medium", or "High"
}

DO NOT use: "businessImpact", "implementationComplexity" — use "impact" and "complexity" only.

══════════════════════════════════════════════════════
QUALITY STANDARD
══════════════════════════════════════════════════════

GOOD: "Their contact-form-only lead capture misses chat-based qualification, delaying B2B sales cycles."
BAD:  "AI could help improve customer communication."

GOOD: "Automate inbound lead qualification using an AI chatbot trained on their visible service catalogue."
BAD:  "Implement AI automation for better efficiency."

GOOD score reasoning: "Multi-page B2B site with visible CRM signals and API documentation suggests strong integration readiness."
BAD score reasoning:  "They have some technology in place."

The prospect must feel: "They genuinely understand our business."

══════════════════════════════════════════════════════
OUTPUT FORMAT — RETURN ONLY THIS JSON OBJECT
══════════════════════════════════════════════════════

No markdown. No code fences. No explanation. Pure JSON only.

{
  "executiveSummary": "",

  "companyPositioning": "",

  "digitalPresenceAnalysis": {
    "strengths": [],
    "weaknesses": [],
    "brandObservations": []
  },

  "operationalObservations": [],

  "customerExperienceInsights": [],

  "aiAutomationOpportunities": [
    {
      "title": "",
      "problem": "",
      "solution": "",
      "impact": "",
      "complexity": ""
    }
  ],

  "strategicRecommendations": [],

  "industryTrends": [],

  "competitiveAnalysis": "",

  "automationReadinessScore": {
    "score": 0,
    "reasoning": ""
  },

  "quickWins": [],

  "longTermOpportunities": [],

  "personalizedClosingInsight": ""
}`;
};

// ─── Company Intelligence Block Builder ───────────────────────────────────────

/**
 * Assembles only the non-empty scraped fields into a clean context block.
 * Avoids bloating the prompt with empty arrays and null values.
 */
const buildCompanyBlock = (leadData, scrapeData) => {
    const lines = [];

    // Lead form data
    lines.push(`Company:    ${leadData.companyName  || 'N/A'}`);
    lines.push(`Industry:   ${leadData.industry     || 'N/A'}`);
    lines.push(`Size:       ${leadData.companySize  || 'N/A'} employees`);
    lines.push(`Website:    ${leadData.companyWebsite || 'N/A'}`);
    lines.push('');

    // Scraped data — only include populated fields
    const sd = scrapeData || {};

    const title = sd.company?.title || sd.title;
    if (title) lines.push(`Site Title: ${title}`);

    const desc = sd.company?.description || sd.metaDescription;
    if (desc) lines.push(`Meta Desc:  ${truncate(desc, 200)}`);

    const bizType = sd.company?.businessType;
    if (bizType) lines.push(`Biz Type:   ${bizType}`);

    const heroTexts = sd.branding?.heroText;
    if (Array.isArray(heroTexts) && heroTexts.length) {
        lines.push(`Hero Text:  ${heroTexts.slice(0, 3).join(' | ')}`);
    }

    const headings = sd.contentInsights?.headings || sd.headings;
    if (Array.isArray(headings) && headings.length) {
        lines.push(`Headings:   ${headings.slice(0, 8).join(' | ')}`);
    }

    const services = sd.offerings?.services;
    if (Array.isArray(services) && services.length) {
        lines.push(`Services:   ${services.slice(0, 6).join(' | ')}`);
    }

    const products = sd.offerings?.products;
    if (Array.isArray(products) && products.length) {
        lines.push(`Products:   ${products.slice(0, 4).join(' | ')}`);
    }

    const features = sd.offerings?.features;
    if (Array.isArray(features) && features.length) {
        lines.push(`Features:   ${features.slice(0, 6).join(' | ')}`);
    }

    const industries = sd.offerings?.industriesServed;
    if (Array.isArray(industries) && industries.length) {
        lines.push(`Serves:     ${industries.join(' | ')}`);
    }

    const paras = sd.contentInsights?.keyParagraphs || sd.paragraphs;
    if (Array.isArray(paras) && paras.length) {
        lines.push(`Key Content: ${paras.slice(0, 4).map((p) => truncate(p, 120)).join(' ... ')}`);
    }

    const techStack = sd.techStackSignals;
    if (techStack && Object.keys(techStack).length) {
        lines.push(`Tech Stack: ${JSON.stringify(techStack)}`);
    }

    const bizSignals = sd.businessSignals;
    if (bizSignals && Object.keys(bizSignals).length) {
        lines.push(`Biz Signals: ${JSON.stringify(bizSignals)}`);
    }

    const autoOpps = sd.automationOpportunities;
    if (Array.isArray(autoOpps) && autoOpps.length) {
        lines.push(`Pre-identified Automation Signals: ${autoOpps.slice(0, 6).join(' | ')}`);
    }

    const pages = sd.pagesVisited;
    if (Array.isArray(pages) && pages.length) {
        lines.push(`Pages Analyzed: ${pages.slice(0, 6).join(', ')}`);
    }

    return lines.join('\n');
};

// ─── Truncate helper ──────────────────────────────────────────────────────────

const truncate = (str, n) => {
    if (!str || typeof str !== 'string') return '';
    str = str.trim();
    return str.length > n ? str.slice(0, n - 1) + '…' : str;
};

// ─── Fallback Audit (used when AI call fails) ─────────────────────────────────

/**
 * Returns a minimal but structurally valid audit object.
 * The PDF system will render whatever is populated and skip empty sections.
 */
export const buildFallbackAudit = (leadData, scrapeData) => {
    const name = leadData?.companyName || 'your company';
    const industry = leadData?.industry || 'your industry';

    return {
        executiveSummary: `${name} presents an opportunity to leverage AI automation for operational efficiency and competitive differentiation within the ${industry} sector. A full analysis will follow upon data enrichment.`,
        companyPositioning: '',
        digitalPresenceAnalysis: { strengths: [], weaknesses: [], brandObservations: [] },
        operationalObservations: [],
        customerExperienceInsights: [],
        aiAutomationOpportunities: [],
        strategicRecommendations: [],
        industryTrends: [],
        competitiveAnalysis: '',
        automationReadinessScore: {
            score: 0,
            reasoning: 'Assessment requires additional company data.',
        },
        quickWins: [],
        longTermOpportunities: [],
        personalizedClosingInsight: `We look forward to exploring how AI automation can accelerate ${name}'s growth. Let's connect to discuss the opportunities identified above.`,
    };
};
