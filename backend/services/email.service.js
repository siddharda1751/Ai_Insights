import { Resend } from 'resend';
import { buildEmailHTML, buildFailureEmailHTML } from '../utils/buildHtml.js';

/**
 * EMAIL SERVICE — Resend API Integration
 * 
 * ✅ Why Resend over SMTP on Render/Cloud Deployments:
 * - No persistent socket connections (reliable on ephemeral instances)
 * - No SMTP verification delays on startup
 * - API-based, not bound to email provider (Gmail) account credentials
 * - Built for serverless/containerized environments
 * - Better rate limiting and delivery tracking
 * - No port blocking issues (SMTP often blocked on shared infrastructure)
 * 
 * ✅ Architecture:
 * - Stateless: single API client per request (no persistent transporter)
 * - In-memory PDF buffers (no file I/O overhead)
 * - Simple error handling (throw upward for retry logic)
 */

// Lazy initialization — create client only when needed
const getResendClient = () => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new Error(
            'RESEND_API_KEY environment variable is not set. ' +
            'Set it in your .env file: RESEND_API_KEY=re_your_key_here'
        );
    }
    return new Resend(apiKey);
};

/**
 * NO-OP initialization function — Resend doesn't require SMTP verification.
 * Kept for backwards compatibility with app.js.
 */
export const initializeEmailService = async () => {
    if (!process.env.RESEND_API_KEY) {
        console.warn('[Email] RESEND_API_KEY not set — email delivery will fail');
        return;
    }
    console.log('[Email] Resend API initialized and ready');
};

/**
 * Sends the personalized audit report PDF via email using Resend API.
 * Accepts PDF as in-memory Buffer (not file path).
 * 
 * ✅ Benefits over SMTP:
 * - Instant delivery without SMTP handshake
 * - In-memory attachment (no temporary files)
 * - Automatic retry logic at API level
 * - No transporter state management
 * 
 * @param {object} leadData  - Lead form data (name, email, companyName)
 * @param {Buffer} pdfBuffer - PDF content as Buffer (not file path)
 * @returns {Promise<void>}
 * @throws {Error} If email sending fails (caught by workflow for retry)
 */

const FROM_MAIL = process.env.FROM_MAIL;
export const sendReportEmail = async (leadData, pdfBuffer) => {
    if (!Buffer.isBuffer(pdfBuffer)) {
        throw new Error('PDF must be a Buffer, not a file path');
    }

    const resend = getResendClient();
    const pdfBase64 = pdfBuffer.toString('base64');
    const fileName = `${leadData.companyName.replace(/\s+/g, '_')}_Audit_Report.pdf`;

    try {
        const result = await resend.emails.send({
            from: FROM_MAIL || 'onboarding@resend.dev', // Use Resend testing domain
            to: leadData.email,
            subject: `Your Personalized Business Audit — ${leadData.companyName}`,
            html: buildEmailHTML(leadData),
            attachments: [
                {
                    filename: fileName,
                    content: pdfBase64,
                    contentType: 'application/pdf',
                },
            ],
        });

        if (result.error) {
            throw new Error(`Resend API error: ${result.error.message}`);
        }

        console.log(`[Email] Report sent to ${leadData.email} (ID: ${result.data.id})`);
        return result;
    } catch (error) {
        console.error(`[Email] Failed to send report to ${leadData.email}:`, error.message);
        throw error; // Throw upward for workflow retry logic
    }
};

/**
 * Sends a graceful failure notification to the user via Resend API.
 * Called when workflow fails after all retries.
 * 
 * @param {object} leadData - Lead form data
 * @param {string} errorMessage - Brief error message for logs (not shown to user)
 * @returns {Promise<void>}
 */
export const sendFailureEmail = async (leadData, errorMessage) => {
    const resend = getResendClient();
    
    try {
        const result = await resend.emails.send({
            from: FROM_MAIL || 'onboarding@resend.dev', // Use Resend testing domain
            to: leadData.email,
            subject: `Unable to Generate Your Business Audit — ${leadData.companyName}`,
            html: buildFailureEmailHTML(leadData),
        });

        if (result.error) {
            throw new Error(`Resend API error: ${result.error.message}`);
        }

        console.log(`[Email] Failure notification sent to ${leadData.email} (ID: ${result.data.id})`);
        return result;
    } catch (error) {
        console.error(`[Email] Failed to send failure notification to ${leadData.email}:`, error.message);
        // Don't throw — we're already in a failed state, just log it
    }
};
