import nodemailer from 'nodemailer';
import { buildEmailHTML, buildFailureEmailHTML } from '../utils/buildHtml.js';

/**
 * EMAIL SERVICE — Nodemailer with Gmail SMTP
 * 
 * ✅ Simple & Reliable:
 * - Uses Gmail SMTP with app password or account password
 * - No OAuth2 complexity — just username and password
 * - Works reliably on Render and other cloud platforms
 * - Single transporter instance (created once on app startup)
 * - In-memory PDF buffers (no file I/O)
 * 
 * ✅ Setup:
 * - EMAIL_USER: your Gmail address (e.g., user@gmail.com)
 * - EMAIL_PASS: Gmail app password (16 chars) or account password
 *   (If 2FA enabled, MUST use app password, not account password)
 */

let transporter;

/**
 * Creates and verifies Gmail SMTP transporter on app startup.
 * Non-blocking: if initialization fails, app continues running.
 */
export const initializeEmailService = async () => {
    try {
        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;

        // Validate credentials
        if (!emailUser || !emailPass) {
            console.warn('[Email] Missing EMAIL_USER or EMAIL_PASS — email delivery will fail');
            return;
        }

        // Create transporter with Gmail SMTP
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailUser,
                pass: emailPass,
            },
        });

        // Verify connection once on startup
        await transporter.verify();
        console.log('[Email] SMTP transporter verified and ready');
    } catch (error) {
        console.warn('[Email] SMTP initialization failed:', error.message);
        console.warn('[Email] Email service will be unavailable — app will continue running');
        // Don't throw — let app continue even if email fails
        transporter = null;
    }
};

/**
 * Sends the personalized audit report PDF via Gmail.
 * Accepts PDF as in-memory Buffer (not file path).
 * 
 * @param {object} leadData  - Lead form data (name, email, companyName)
 * @param {Buffer} pdfBuffer - PDF content as Buffer (not file path)
 * @returns {Promise<void>}
 * @throws {Error} If email sending fails (caught by workflow for retry)
 */
export const sendReportEmail = async (leadData, pdfBuffer) => {
    if (!Buffer.isBuffer(pdfBuffer)) {
        throw new Error('PDF must be a Buffer, not a file path');
    }

    if (!transporter) {
        throw new Error('Email service not initialized. Call initializeEmailService() on app startup.');
    }

    const fileName = `${leadData.companyName.replace(/\s+/g, '_')}_Audit_Report.pdf`;

    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: leadData.email,
            subject: `Your Personalized Business Audit — ${leadData.companyName}`,
            html: buildEmailHTML(leadData),
            attachments: [
                {
                    filename: fileName,
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                },
            ],
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email] Report sent to ${leadData.email} (Message ID: ${info.messageId})`);
        return info;
    } catch (error) {
        console.error(`[Email] Failed to send report to ${leadData.email}:`, error.message);
        throw error; // Throw upward for workflow retry logic
    }
};

/**
 * Sends a graceful failure notification to the user via Gmail.
 * Called when workflow fails after all retries.
 * 
 * @param {object} leadData - Lead form data
 * @param {string} errorMessage - Brief error message for logs (not shown to user)
 * @returns {Promise<void>}
 */
export const sendFailureEmail = async (leadData, errorMessage) => {
    if (!transporter) {
        console.error('[Email] Email service not initialized — cannot send failure notification');
        return;
    }

    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: leadData.email,
            subject: `Unable to Generate Your Business Audit — ${leadData.companyName}`,
            html: buildFailureEmailHTML(leadData),
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email] Failure notification sent to ${leadData.email} (Message ID: ${info.messageId})`);
        return info;
    } catch (error) {
        console.error(`[Email] Failed to send failure notification to ${leadData.email}:`, error.message);
        // Don't throw — we're already in a failed state, just log it
    }
};
