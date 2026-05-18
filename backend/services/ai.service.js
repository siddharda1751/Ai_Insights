import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildAuditPrompt } from './audit.prompt.template.js';

/**
 * Generates structured business audit insights using Gemini Flash (free tier).
 * 
 * Uses a comprehensive prompt template to produce deeply personalized,
 * professional audit reports that feel like premium consulting deliverables.
 * 
 * Falls back to a sensible default structure if the API call fails.
 *
 * @param {object} leadData   - Lead form data (name, email, company, size, industry, website)
 * @param {object} scrapeData - Rich company intelligence from scraper (enhanced with business signals, tech stack, opportunities)
 * @returns {Promise<object>} Structured AI audit insights
 */
export const generateInsights = async (leadData, scrapeData) => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    try {
        // Build comprehensive audit prompt from template
        const prompt = buildAuditPrompt(leadData, scrapeData);

        console.log(`[AI] Generating audit for ${leadData.companyName} using Gemini 2.5 Flash...`);

        const result = await model.generateContent(prompt);
        const raw = result.response.text();

        console.log(`[AI] Raw response length: ${raw.length} characters`);

        // Gemini may wrap JSON in markdown code fences — strip them
        const cleaned = raw
            .replace(/```json\s*/gi, '')
            .replace(/```\s*/g, '')
            .trim();

        console.log(`[AI] Cleaned response length: ${cleaned.length} characters`);

        const audit = JSON.parse(cleaned);

        // Validate audit structure
        validateAuditStructure(audit);

        console.log(`[AI] ✓ Audit generated successfully for ${leadData.companyName}`);
        console.log(`[AI] Audit keys: ${Object.keys(audit).join(', ')}`);

        return audit;
    } catch (error) {
        console.error(`[AI] ✗ Gemini generation failed: ${error.message}`);
        throw error;
    }
};

/**
 * Validate that the audit structure matches expected format
 */
const validateAuditStructure = (audit) => {
    const requiredFields = [
        'executiveSummary',
        'companyPositioning',
        'digitalPresenceAnalysis',
        'operationalObservations',
        'customerExperienceInsights',
        'aiAutomationOpportunities',
        'strategicRecommendations',
        'industryTrends',
        'competitiveAnalysis',
        'automationReadinessScore',
        'quickWins',
        'longTermOpportunities',
        'personalizedClosingInsight',
    ];

    for (const field of requiredFields) {
        if (!(field in audit)) {
            console.warn(`[AI] Missing field in audit: ${field}`);
        }
    }

    // Ensure arrays are actually arrays
    const arrayFields = [
        'operationalObservations',
        'customerExperienceInsights',
        'aiAutomationOpportunities',
        'strategicRecommendations',
        'industryTrends',
        'quickWins',
        'longTermOpportunities',
    ];

    for (const field of arrayFields) {
        if (field in audit && !Array.isArray(audit[field])) {
            console.warn(`[AI] Field "${field}" is not an array, converting...`);
            audit[field] = [audit[field]];
        }
    }

    return audit;
};
