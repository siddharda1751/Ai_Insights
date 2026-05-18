import PDFDocument from 'pdfkit';
import {
    addSection,
    addCalloutSection,
    addListSection,
    addAutomationOpportunitiesSection,
    addDigitalPresenceSection,
    addReadinessScoreSection,
    addFooter,
} from './pdf.template.js';


// ============================================================
// HELPERS FOR VALIDATION & SANITIZATION
// ============================================================

/**
 * Generates a professional PDF report from lead + AI insight data using PDFKit.
 * Returns PDF as an in-memory Buffer (no filesystem writes).
 * Suitable for cloud/stateless deployments.
 *
 * @param {object} leadData  - Lead form data (name, email, company, size, industry, website)
 * @param {object} audit     - AI-generated audit insights (structured JSON from new audit template)
 * @returns {Promise<Buffer>} PDF content as Buffer (not file path)
 */
export const generatePDF = async (leadData, audit) => {
    return new Promise((resolve, reject) => {
        try {
            // Validate, sanitize, and enforce content limits
            const sanitizedAudit = sanitizeAudit(audit);
            const a = applyRenderLimits(sanitizedAudit);
            console.log(`[PDF] ✓ Audit data validated, sanitized, and capped`);

            const doc = new PDFDocument({ margin: 40, size: 'A4' });
            const chunks = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => {
                console.log(`[PDF] ✓ PDF generated (${chunks.length} chunks)`);
                resolve(Buffer.concat(chunks));
            });
            doc.on('error', (err) => {
                console.error(`[PDF] ✗ Stream error: ${err.message}`);
                reject(err);
            });

            const companyName = leadData.companyName || 'Company';
            const MARGIN = 45;
            const cw = doc.page.width - MARGIN * 2;
            const cn = companyName;

            // ── COVER HEADER ─────────────────────────────────────────────────────
            doc.rect(0, 0, doc.page.width, 6).fill('#2563EB');
            doc.y = 24;

            doc.font('Helvetica-Bold').fontSize(26).fillColor('#0F2B5B')
               .text('Business Audit Report', MARGIN, doc.y, { width: cw, align: 'center' });
            doc.y += 32;

            doc.font('Helvetica-Bold').fontSize(15).fillColor('#1A4080')
               .text(companyName, MARGIN, doc.y, { width: cw, align: 'center' });
            doc.y += 20;

            doc.font('Helvetica').fontSize(10).fillColor('#6B7280')
               .text('AI-Powered Business Audit  ·  Confidential', MARGIN, doc.y, { width: cw, align: 'center' });
            doc.y += 6;

            doc.font('Helvetica').fontSize(9).fillColor('#9CA3AF')
               .text(
                   `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
                   MARGIN, doc.y, { width: cw, align: 'center' }
               );
            doc.y += 18;

            doc.save().strokeColor('#2563EB').lineWidth(1.5)
               .moveTo(MARGIN, doc.y).lineTo(MARGIN + cw, doc.y).stroke().restore();
            doc.y += 14;

            // ── META TAGS ────────────────────────────────────────────────────────
            const websiteUrl = (leadData.companyWebsite || 'N/A').replace(/^https?:\/\//, '').split('/')[0];
            const tags = [
                { label: 'Industry', value: leadData.industry    || 'N/A' },
                { label: 'Size',     value: (leadData.companySize || 'N/A') + ' employees' },
                { label: 'Website',  value: websiteUrl },
            ];

            let tagCurX = MARGIN;
            const tagY  = doc.y;
            const tagH  = 20;
            const tagPad = 9;
            const tagGap = 7;

            tags.forEach(({ label, value }) => {
                const lW = doc.widthOfString(label + ': ', { font: 'Helvetica-Bold', fontSize: 8 });
                const vW = doc.widthOfString(value,        { font: 'Helvetica',      fontSize: 8 });
                const tW = lW + vW + tagPad * 2 + 4;

                // Guard: don't overflow page width
                if (tagCurX + tW > MARGIN + cw) return;

                doc.roundedRect(tagCurX, tagY, tW, tagH, 3).fill('#EFF6FF');
                doc.font('Helvetica-Bold').fontSize(8).fillColor('#1D4ED8')
                   .text(label + ': ', tagCurX + tagPad, tagY + 5, { width: lW, lineGap: 0 });
                doc.font('Helvetica').fontSize(8).fillColor('#374151')
                   .text(value, tagCurX + tagPad + lW, tagY + 5, { width: vW + 4, lineGap: 0 });

                tagCurX += tW + tagGap;
            });

            doc.y = tagY + tagH + 22;

            // ── CONTENT SECTIONS (each guarded by hasContent) ─────────────────

            if (hasStr(a.executiveSummary)) {
                console.log('[PDF] → Executive Summary');
                addCalloutSection(doc, 'Executive Summary', a.executiveSummary, cn);
            }

            if (hasStr(a.companyPositioning)) {
                console.log('[PDF] → Company Positioning');
                addSection(doc, 'Company Positioning', a.companyPositioning, cn);
            }

            if (hasDigitalPresence(a.digitalPresenceAnalysis)) {
                console.log('[PDF] → Digital Presence Analysis');
                addDigitalPresenceSection(doc, 'Digital Presence Analysis', a.digitalPresenceAnalysis, cn);
            }

            if (hasArr(a.operationalObservations)) {
                console.log('[PDF] → Operational Observations');
                addListSection(doc, 'Operational Observations', a.operationalObservations, cn);
            }

            if (hasArr(a.customerExperienceInsights)) {
                console.log('[PDF] → Customer Experience Insights');
                addListSection(doc, 'Customer Experience Insights', a.customerExperienceInsights, cn);
            }

            if (hasArr(a.aiAutomationOpportunities)) {
                console.log('[PDF] → AI Automation Opportunities');
                addAutomationOpportunitiesSection(doc, 'AI Automation Opportunities', a.aiAutomationOpportunities, cn);
            }

            if (hasArr(a.strategicRecommendations)) {
                console.log('[PDF] → Strategic Recommendations');
                addListSection(doc, 'Strategic Recommendations', a.strategicRecommendations, cn);
            }

            if (hasArr(a.industryTrends)) {
                console.log('[PDF] → Industry Trends');
                addListSection(doc, 'Industry Trends', a.industryTrends, cn);
            }

            if (hasStr(a.competitiveAnalysis)) {
                console.log('[PDF] → Competitive Analysis');
                addSection(doc, 'Competitive Analysis', a.competitiveAnalysis, cn);
            }

            if (hasScore(a.automationReadinessScore)) {
                console.log('[PDF] → Readiness Score');
                addReadinessScoreSection(doc, 'AI Readiness Score', a.automationReadinessScore, cn);
            }

            // ── ROADMAP: quick wins + long-term combined into one section label
            if (hasArr(a.quickWins)) {
                console.log('[PDF] → Quick Wins');
                addListSection(doc, 'Quick Wins  (0 – 3 Months)', a.quickWins, cn);
            }

            if (hasArr(a.longTermOpportunities)) {
                console.log('[PDF] → Long-Term Opportunities');
                addListSection(doc, 'Strategic Horizon  (6 – 12 Months)', a.longTermOpportunities, cn);
            }

            if (hasStr(a.personalizedClosingInsight)) {
                console.log('[PDF] → Closing Insight');
                addCalloutSection(doc, 'Closing Insight', a.personalizedClosingInsight, cn);
            }

            // ── FOOTER ───────────────────────────────────────────────────────────
            addFooter(doc, leadData);
            doc.end();

        } catch (error) {
            console.error(`[PDF] ✗ Error: ${error.message}`);
            console.error(error.stack);
            reject(error);
        }
    });
};

// ─── Content Guard Helpers ────────────────────────────────────────────────────

/** True only if string is non-empty after trimming */
const hasStr = (v) => typeof v === 'string' && v.trim().length > 0;

/** True only if array has at least one truthy item */
const hasArr = (v) => Array.isArray(v) && v.length > 0;

/** True if the digital presence object has at least one non-empty sub-array */
const hasDigitalPresence = (v) => {
    if (!v || typeof v !== 'object') return false;
    return (
        (Array.isArray(v.strengths)         && v.strengths.length > 0)  ||
        (Array.isArray(v.weaknesses)        && v.weaknesses.length > 0) ||
        (Array.isArray(v.brandObservations) && v.brandObservations.length > 0)
    );
};

/** True if score is a positive number or reasoning is non-empty */
const hasScore = (v) => {
    if (!v || typeof v !== 'object') return false;
    return (typeof v.score === 'number' && v.score > 0) || hasStr(v.reasoning);
};

// ─── Render Limit Enforcer ────────────────────────────────────────────────────

/**
 * Hard-cap arrays to the maximum the PDF layout can cleanly render.
 * Applied BEFORE data reaches the template — template never sees oversized arrays.
 */
const applyRenderLimits = (a) => ({
    ...a,
    operationalObservations:    (a.operationalObservations    || []).slice(0, 3),
    customerExperienceInsights: (a.customerExperienceInsights || []).slice(0, 3),
    aiAutomationOpportunities:  (a.aiAutomationOpportunities  || []).slice(0, 3),
    strategicRecommendations:   (a.strategicRecommendations   || []).slice(0, 3),  // 4 → 3
    industryTrends:             (a.industryTrends             || []).slice(0, 3),
    quickWins:                  (a.quickWins                  || []).slice(0, 2),  // 3 → 2
    longTermOpportunities:      (a.longTermOpportunities      || []).slice(0, 2),  // 3 → 2
    digitalPresenceAnalysis: {
        strengths:         ((a.digitalPresenceAnalysis?.strengths)         || []).slice(0, 2),  // 3 → 2
        weaknesses:        ((a.digitalPresenceAnalysis?.weaknesses)        || []).slice(0, 2),  // 3 → 2
        brandObservations: ((a.digitalPresenceAnalysis?.brandObservations) || []).slice(0, 2),  // 3 → 2
    },
});

/**
 * Sanitize and validate audit data structure
 * Ensures all fields exist and are in the expected format
 */
const sanitizeAudit = (audit) => {
    if (!audit || typeof audit !== 'object') {
        console.warn(`[PDF] Audit is not an object, using empty structure`);
        return getEmptyAudit();
    }

    const sanitized = {
        executiveSummary: validateString(audit.executiveSummary, 'executiveSummary'),
        companyPositioning: validateString(audit.companyPositioning, 'companyPositioning'),
        digitalPresenceAnalysis: validateDigitalPresence(audit.digitalPresenceAnalysis),
        operationalObservations: validateArray(audit.operationalObservations, 'operationalObservations'),
        customerExperienceInsights: validateArray(audit.customerExperienceInsights, 'customerExperienceInsights'),
        aiAutomationOpportunities: validateAutomationOpportunities(audit.aiAutomationOpportunities),
        strategicRecommendations: validateArray(audit.strategicRecommendations, 'strategicRecommendations'),
        industryTrends: validateArray(audit.industryTrends, 'industryTrends'),
        competitiveAnalysis: validateString(audit.competitiveAnalysis, 'competitiveAnalysis'),
        automationReadinessScore: validateReadinessScore(audit.automationReadinessScore),
        quickWins: validateArray(audit.quickWins, 'quickWins'),
        longTermOpportunities: validateArray(audit.longTermOpportunities, 'longTermOpportunities'),
        personalizedClosingInsight: validateString(audit.personalizedClosingInsight, 'personalizedClosingInsight'),
    };

    return sanitized;
};

// Returns an empty audit — all strings empty, all arrays empty.
// hasStr() / hasArr() guards in generatePDF ensure nothing renders.
const getEmptyAudit = () => ({
    executiveSummary: '',
    companyPositioning: '',
    digitalPresenceAnalysis: { strengths: [], weaknesses: [], brandObservations: [] },
    operationalObservations: [],
    customerExperienceInsights: [],
    aiAutomationOpportunities: [],
    strategicRecommendations: [],
    industryTrends: [],
    competitiveAnalysis: '',
    automationReadinessScore: { score: 0, reasoning: '' },
    quickWins: [],
    longTermOpportunities: [],
    personalizedClosingInsight: '',
});

const validateString = (value, fieldName) => {
    if (typeof value === 'string' && value.trim()) {
        return value.trim();
    }
    if (!value) {
        console.warn(`[PDF] Field "${fieldName}" is missing or empty`);
    } else {
        console.warn(`[PDF] Field "${fieldName}" is not a string: ${typeof value}`);
    }
    return '';
};

const validateArray = (value, fieldName) => {
    if (!value) {
        console.warn(`[PDF] Field "${fieldName}" is missing`);
        return [];
    }
    if (!Array.isArray(value)) {
        console.warn(`[PDF] Field "${fieldName}" is not an array: ${typeof value}`);
        if (typeof value === 'string') {
            return [value];
        }
        return [];
    }
    return value.filter((item) => {
        if (typeof item === 'string' && item.trim()) return true;
        if (typeof item === 'object') return true;
        return false;
    });
};

const validateDigitalPresence = (value) => {
    if (!value || typeof value !== 'object') {
        console.warn(`[PDF] Field "digitalPresenceAnalysis" is missing or invalid`);
        return { strengths: [], weaknesses: [], brandObservations: [] };
    }
    return {
        strengths: validateArray(value.strengths, 'digitalPresenceAnalysis.strengths'),
        weaknesses: validateArray(value.weaknesses, 'digitalPresenceAnalysis.weaknesses'),
        brandObservations: validateArray(value.brandObservations, 'digitalPresenceAnalysis.brandObservations'),
    };
};

const validateAutomationOpportunities = (value) => {
    if (!value) {
        console.warn(`[PDF] Field "aiAutomationOpportunities" is missing`);
        return [];
    }
    if (!Array.isArray(value)) {
        console.warn(`[PDF] Field "aiAutomationOpportunities" is not an array`);
        return [];
    }
    return value
        .filter((opp) => opp && typeof opp === 'object' && opp.title && typeof opp.title === 'string')
        .map((opp) => ({
            // Normalise both old and new field-name variants into canonical shape
            title:      String(opp.title    || '').trim(),
            problem:    String(opp.problem  || '').trim(),
            solution:   String(opp.solution || '').trim(),
            // New format: impact / complexity.  Old format: businessImpact / implementationComplexity.
            impact:      String(opp.impact      || opp.businessImpact            || '').trim(),
            complexity:  String(opp.complexity  || opp.implementationComplexity  || '').trim(),
        }));
};

const validateReadinessScore = (value) => {
    if (!value || typeof value !== 'object') {
        console.warn(`[PDF] Field "automationReadinessScore" is missing or invalid`);
        return { score: 0, reasoning: 'Score unavailable' };
    }
    return {
        score: typeof value.score === 'number' ? Math.min(100, Math.max(0, value.score)) : 0,
        reasoning: typeof value.reasoning === 'string' ? value.reasoning : 'Score unavailable',
    };
};
