export const buildEmailHTML = (lead) => `
<!DOCTYPE html>
<html>
<body style="font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; max-width: 600px; margin: auto; padding: 30px;">
  <div style="border-bottom: 3px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px;">
    <h2 style="color: #1e3a5f; font-size: 22px; margin: 0;">Your Business Audit is Ready</h2>
  </div>
  <p style="font-size: 15px; line-height: 1.7;">Hi <strong>${lead.name}</strong>,</p>
  <p style="font-size: 15px; line-height: 1.7;">
    Thank you for your interest. We've completed a personalized analysis of <strong>${lead.companyName}</strong> 
    and the full report is attached to this email as a PDF.
  </p>
  <p style="font-size: 15px; line-height: 1.7;">
    Inside you'll find:
  </p>
  <ul style="font-size: 14px; line-height: 2; color: #374151; padding-left: 20px;">
    <li>Company Overview &amp; Context</li>
    <li>Identified Industry Trends</li>
    <li>Potential Pain Points</li>
    <li>AI Automation Opportunities</li>
    <li>Strategic Recommendations</li>
    <li>Competitive Landscape Snapshot</li>
  </ul>
  <p style="font-size: 14px; color: #6b7280; margin-top: 24px; line-height: 1.6;">
    This report was generated automatically using AI enrichment based on publicly available information.
    It is intended as a tailored starting point for your business conversations.
  </p>
  <p style="font-size: 15px; margin-top: 20px;">Best regards,<br/>
    <strong>InsightAI Team</strong>
  </p>
</body>
</html>
`;

export const buildFailureEmailHTML = (lead) => `
<!DOCTYPE html>
<html>
<body style="font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; max-width: 600px; margin: auto; padding: 30px;">
  <div style="border-bottom: 3px solid #f59e0b; padding-bottom: 16px; margin-bottom: 24px;">
    <h2 style="color: #d97706; font-size: 22px; margin: 0;">We Encountered an Issue</h2>
  </div>
  <p style="font-size: 15px; line-height: 1.7;">Hi <strong>${lead.name}</strong>,</p>
  <p style="font-size: 15px; line-height: 1.7;">
    We were unable to complete your personalized business audit for <strong>${lead.companyName}</strong> at this time.
    This may be due to temporary service issues or difficulty accessing company information.
  </p>
  <p style="font-size: 15px; line-height: 1.7;">
    <strong>What we tried:</strong>
  </p>
  <ul style="font-size: 14px; line-height: 2; color: #374151; padding-left: 20px;">
    <li>Accessed and analyzed your company website</li>
    <li>Generated personalized business insights using AI</li>
    <li>Created a professional audit report</li>
  </ul>
  <p style="font-size: 14px; color: #6b7280; margin-top: 24px; line-height: 1.6;">
    We've logged this error and our team is investigating. Please try submitting your request again in a few moments.
    If the problem persists, feel free to reach out to us.
  </p>
  <p style="font-size: 15px; margin-top: 20px;">Thank you for your patience,<br/>
    <strong>InsightAI Team</strong>
  </p>
</body>
</html>
`;
