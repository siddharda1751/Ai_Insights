import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
    {
        name:        { type: String, required: true, trim: true },
        email:       { type: String, required: true, trim: true, lowercase: true },
        companyName: { type: String, required: true, trim: true },
        companyWebsite: { type: String, required: true, trim: true },
        industry:    { type: String, required: true },
        companySize: { type: String, required: true },
        phone:       { type: String, default: null },

        // Workflow state
        status: {
            type: String,
            enum: ['processing', 'completed', 'failed'],
            default: 'processing',
        },

        // Outputs
        reportPath:   { type: String, default: null },
        errorMessage: { type: String, default: null },
        completedAt:  { type: Date,   default: null },
    },
    { timestamps: true }
);

const Lead = mongoose.model('Lead', leadSchema);
export default Lead;
