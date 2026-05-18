import Joi from 'joi';
import Lead from '../models/lead.model.js';
import { generateLeadWorkflow } from '../services/workflow.service.js';
import { appendLeadRow } from '../services/googleSheets.service.js';
import { formatLeadSheetInfo } from '../utils/formatLeadSheetInfo.js';

const leadSchema = Joi.object({
    name:           Joi.string().required(),
    email:          Joi.string().email().required(),
    companyName:    Joi.string().required(),
    companyWebsite: Joi.string().uri().required(),
    industry:       Joi.string().required(),
    companySize:    Joi.string().required(),
    phone:          Joi.string().allow('', null).optional(),
});

export const createLead = async (req, res) => {
    try {
        // ── 1. Validate request body ─────────────────────────────────────────
        const { error, value } = leadSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.details.map((e) => e.message),
            });
        }

        // ── 2. Persist lead with initial status ──────────────────────────────
        const lead = await Lead.create({ ...value, status: 'processing' });
        const leadSheenInfo = formatLeadSheetInfo(lead);
        const sheetRowNumber = await appendLeadRow(leadSheenInfo);


        // ── 3. Respond immediately — do NOT await workflow ───────────────────
        res.status(200).json({
            success: true,
            message: 'Submission received. Report is being generated.',
            leadId: lead._id
        });

        // ── 4. Fire-and-forget workflow (runs after response is sent) ────────
        generateLeadWorkflow(lead._id, sheetRowNumber).catch((err) =>
            console.error('[Controller] Unhandled workflow error:', err.message)
        );

    } catch (error) {
        console.error('[createLead] Error:', error.message);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
};
