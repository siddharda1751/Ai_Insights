import nodemailer from 'nodemailer';
import { buildEmailHTML, buildFailureEmailHTML } from '../utils/buildHtml.js';

// Create transporter once at module load — reused for all sends
const createTransporter = () => nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Verify connection once on startup (not on every send)
let isVerified = false;

/**
 * Initializes email transporter (call once on app startup).
 * Avoids repeated verify() calls which slow down email sends.
 */
export const initializeEmailService = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        isVerified = true;
        console.log('[Email] SMTP transporter verified and ready');
    } catch (error) {
        console.warn('[Email] SMTP transporter verification failed:', error.message);
        // Don't throw — email might work even if verification fails
    }
};

/**
 * Sends the personalized audit report PDF via email.
 * Accepts PDF as in-memory Buffer (not file path).
 * 
 * @param {object} leadData  - Lead form data (name, email, companyName)
 * @param {Buffer} pdfBuffer - PDF content as Buffer (not file path)
 * @returns {Promise<void>}
 */
export const sendReportEmail = async (leadData, pdfBuffer) => {
    
  const transporter = createTransporter();

    if (!isVerified) {
        // Attempt verification if not already done
        try {
            await transporter.verify();
            isVerified = true;
        } catch (error) {
            console.warn('[Email] SMTP verification attempt failed:', error.message);
            // Continue anyway — some deployments don't allow verify()
        }
    }

    if (!Buffer.isBuffer(pdfBuffer)) {
        throw new Error('PDF must be a Buffer, not a file path');
    }

    const mailOptions = {
        from: `"InsightAI" <${process.env.EMAIL_USER}>`,
        to: leadData.email,
        subject: `Your Personalized Business Audit — ${leadData.companyName}`,
        html: buildEmailHTML(leadData),
        attachments: [
            {
                filename: `${leadData.companyName.replace(/\s+/g, '_')}_Audit_Report.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf',
            },
        ],
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email] Report sent to ${leadData.email}`);
};

/**
 * Sends a graceful failure notification to the user.
 * Called when workflow fails after all retries.
 * 
 * @param {object} leadData - Lead form data
 * @param {string} errorMessage - Brief error message for logs (not shown to user)
 * @returns {Promise<void>}
 */
export const sendFailureEmail = async (leadData, errorMessage) => {
       
  const transporter = createTransporter(); 
    const mailOptions = {
        from: `"InsightAI" <${process.env.EMAIL_USER}>`,
        to: leadData.email,
        subject: `Unable to Generate Your Business Audit — ${leadData.companyName}`,
        html: buildFailureEmailHTML(leadData),
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[Email] Failure notification sent to ${leadData.email}`);
    } catch (error) {
        console.error(`[Email] Failed to send failure notification to ${leadData.email}:`, error.message);
        // Don't throw — we're already in a failed state
    }
};
