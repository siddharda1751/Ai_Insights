# AI-Powered Lead Intelligence & Automated Audit Generation

An AI-powered workflow automation system that captures inbound leads, enriches company data using web intelligence, generates personalized business audit reports, and delivers them automatically via email.

Built as an end-to-end asynchronous automation pipeline focused on operational reliability, observability, and production-style workflow orchestration.

---

# Problem Statement

Many businesses manually:

- Research inbound leads
- Analyze company websites
- Prepare audit reports
- Identify automation opportunities
- Send outreach emails

This project automates the entire workflow.

When a lead submits their company information, the system automatically:

1. Validates and stores lead information
2. Scrapes public company website intelligence
3. Generates AI-powered business insights
4. Creates a professional PDF audit report
5. Emails the report to the lead
6. Tracks workflow state live in Google Sheets

---

# Features

## Automated Lead Intake

- Public lead intake form
- Joi validation
- MongoDB persistence
- Immediate non-blocking response

## AI-Powered Company Intelligence

- Website scraping
- Metadata extraction
- Heading/content analysis
- AI-generated business insights
- Industry-aware recommendations

## Automated PDF Audit Generation

- Dynamic PDF generation
- Structured audit sections
- Executive summary
- Recommendations
- AI automation opportunities

## Email Automation

- API-based email delivery using Resend
- PDF attachments
- Failure notification emails
- Stateless in-memory attachment handling

## Workflow Orchestration

- Asynchronous background processing
- Retry logic
- Failure propagation
- Graceful error handling

## Operational Observability

- Live workflow tracking in Google Sheets
- Real-time status updates
- Failure visibility
- Timestamp tracking

---

# Tech Stack

## Frontend

- React
- Tailwind CSS

## Backend

- Node.js
- Express.js

## Database

- MongoDB Atlas

## AI

- Google Gemini API

## Integrations

- Google Sheets API
- Resend Email API

## PDF Generation

- PDFKit

## Deployment

- Render
- Vercel

---

# High-Level Workflow

```text
User submits lead form
        ↓
Lead stored in MongoDB
        ↓
Google Sheet row created
        ↓
Immediate response returned to frontend
        ↓
Async workflow starts
        ↓
Website scraping
        ↓
AI insight generation
        ↓
PDF audit generation
        ↓
Email delivery
        ↓
Workflow marked completed
