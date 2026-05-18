import Lead from '../models/lead.model.js';
import { scrapeCompany } from './scrape.service.js';
import { generateInsights } from './ai.service.js';
import { generatePDF } from './pdf.service.js';
import { sendReportEmail, sendFailureEmail } from './email.service.js';
import { retry, RETRY_CONFIGS } from '../utils/retry.util.js';
import { updateLeadSheetStatus } from './googleSheets.service.js';

/**
 * Orchestrates the full lead enrichment workflow with retry logic.
 * Stateless pipeline: scrape → AI → PDF (in-memory buffer) → Email
 * 
 * This function is called AFTER the HTTP response is already sent.
 * All errors are caught and handled gracefully — never crashes the app.
 *
 * @param {string} leadId - MongoDB ObjectId of the saved lead
 * @param {number} sheetRowNumber - The row number in the Google Sheet where the lead is located
 */
export const generateLeadWorkflow = async (leadId, sheetRowNumber) => {
    let lead;

    try {
        lead = await Lead.findById(leadId);
        if (!lead) throw new Error(`Lead not found: ${leadId}`);

        // ── Step 1: Mark as processing ──────────────────────────────────────
        lead.status = 'processing';
        await lead.save();
        console.log(`[Workflow] Started → ${lead.name} @ ${lead.companyName}`);

        // ── Step 2: Scrape company website (with retry) ─────────────────────
        await updateLeadSheetStatus(sheetRowNumber, 'Scraping');
        console.log('[Workflow] Step 1/4 — Scraping company website...');
        const scrapeData = await retry(
            () => scrapeCompany(lead.companyWebsite),
            {
                ...RETRY_CONFIGS.scraping,
                operation: `Scraping ${lead.companyWebsite}`,
            }
        );
        console.log('[Scrape] ✓ Completed');

        // ── Step 3: Generate AI insights (with retry) ───────────────────────
        await updateLeadSheetStatus(sheetRowNumber, 'Generating AI insights');
        console.log('[Workflow] Step 2/4 — Generating AI insights...');

        const insights = await retry(
            () => generateInsights(lead.toObject(), scrapeData),
            {
                ...RETRY_CONFIGS.api,
                operation: `AI insights for ${lead.companyName}`,
            }
        );

        console.log('[AI] ✓ Insights generated');

        // ── Step 4: Generate PDF buffer in-memory (no retries) ──────────────
        await updateLeadSheetStatus(sheetRowNumber, 'Generating PDF');
        console.log('[Workflow] Step 3/4 — Generating PDF report...');

        const pdfBuffer = await generatePDF(lead.toObject(), insights);

        console.log(`[PDF] ✓ Generated (${pdfBuffer.length} bytes)`);
      
        // ── Step 5: Send email with PDF attachment (with retry) ────────────
        await updateLeadSheetStatus(sheetRowNumber, 'Sending email');
        console.log('[Workflow] Step 4/4 — Sending report email...');

        await retry(
            () => sendReportEmail(lead.toObject(), pdfBuffer),
            { 
                ...RETRY_CONFIGS.email,
                operation: `Email to ${lead.email}`,
            }
        );

        console.log('[Email] ✓ Sent');

        // ── Step 6: Mark as completed ───────────────────────────────────────
        await updateLeadSheetStatus(sheetRowNumber, 'Completed',);
        lead.status = 'completed';
        lead.completedAt = new Date();
        await lead.save();

        console.log(`[Workflow] ✓ Completed → ${lead.name} @ ${lead.companyName}`);

    } catch (error) {
        // ── Workflow failed after retries ───────────────────────────────────
        await updateLeadSheetStatus(sheetRowNumber, 'Failed', error.message);
        console.error(`[Workflow] ✗ Failed for leadId ${leadId}:`, error.message);

        if (!lead) {
            console.error('[Workflow] Could not load lead — unable to notify user');
            return;
        }

        try {
            // Update lead with failure status
            lead.status = 'failed';
            lead.errorMessage = error.message;
            await lead.save();
            console.log(`[Workflow] Updated lead status to "failed"`);

            // Send graceful failure email to user
            try {
                await sendFailureEmail(lead.toObject(), error.message);
            } catch (emailError) {
                console.error(
                    `[Workflow] Failed to send failure notification: ${emailError.message}`
                );
                // Don't throw — we've already logged the failure in DB
            }

        } catch (dbError) {
            console.error('[Workflow] Could not update failure status in DB:', dbError.message);
        }
    }
};
