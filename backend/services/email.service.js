import nodemailer from 'nodemailer';
import { buildEmailHTML, buildFailureEmailHTML } from '../utils/buildHtml.js';

/**
 * EMAIL SERVICE — Nodemailer with Gmail OAuth2
 * 
 * ✅ Why Gmail OAuth2 over Resend/SMTP on Render free tier:
 * - OAuth2 is more secure than storing app passwords
 * - Gmail API doesn't require traditional SMTP port 587
 * - Works reliably on Render's free tier with port restrictions
 * - Avoids domain verification issues with third-party email services
 * - No persistent SMTP connections — API-based approach
 * 
 * ✅ Architecture:
 * - Single transporter instance (created once on app startup)
 * - In-memory PDF buffers (no file I/O)
 * - OAuth2 refresh tokens automatically refresh access tokens
 * - Error handling: throw upward for workflow retry logic
 */

let transporter;

/**
 * Creates and verifies Gmail OAuth2 transporter on app startup.
 * Called once in app.js to ensure email is ready before accepting requests.
 * 
 * ✅ OAuth2 Setup Guide:
 * 1. Go to: https://console.developers.google.com/
 * 2. Create OAuth2 credentials (Desktop app / Other)
 * 3. Use Google OAuth2 Playground to get refresh token:
 *    https://developers.google.com/oauthplayground
 *    - Scope: https://www.googleapis.com/auth/gmail.send
 *    - Get authorization code → Exchange for refresh token
 * 4. Store refresh token securely in .env
 */
export const initializeEmailService = async () => {
    try {
        const emailUser = process.env.EMAIL_USER;
        const clientId = process.env.OAUTH_CLIENT_ID;
        const clientSecret = process.env.OAUTH_CLIENT_SECRET;
        const refreshToken = process.env.OAUTH_REFRESH_TOKEN;

        // Validate all required OAuth2 credentials
        if (!emailUser || !clientId || !clientSecret || !refreshToken) {
            throw new Error(
                'Missing Gmail OAuth2 credentials. Required env vars: ' +
                'EMAIL_USER, OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, OAUTH_REFRESH_TOKEN'
            );
        }

        // Create transporter with OAuth2
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: emailUser,
                clientId,
                clientSecret,
                refreshToken,
                accessType: 'offline',
            },
        });

        // Verify connection once on startup
        await transporter.verify();
        console.log('[Email] Gmail OAuth2 transporter verified and ready');
    } catch (error) {
        console.error('[Email] Failed to initialize Gmail OAuth2 transporter:', error.message);
        throw error; // Don't continue if email setup fails
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
