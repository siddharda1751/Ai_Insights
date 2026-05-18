/**
 * PDF TEMPLATE — Fixed-layout professional report components
 *
 * Rules enforced throughout:
 *  1. Never use absolute Y positioning unless saving/restoring the cursor.
 *  2. Always calculate content height BEFORE drawing a background rect.
 *  3. Call ensureSpace() before every card / section heading.
 *  4. Use a single contentWidth constant so text never hits the edge.
 */

// ─── Constants ────────────────────────────────────────────────────────────────
const MARGIN        = 45;          // left / right margin
const FOOTER_Y      = 780;         // absolute Y where footer begins (A4 = 841)
const SAFE_BOTTOM   = FOOTER_Y - 10; // lowest Y a section may use

const cw = (doc) => doc.page.width - MARGIN * 2;   // usable content width
const cx = MARGIN;                                   // content X origin

/**
 * How many points remain before the footer.
 */
const remaining = (doc) => SAFE_BOTTOM - doc.y;

/**
 * Add a new page and reset cursor to top content area.
 * Also re-draws the page header bar.
 */
const newPage = (doc, companyName = '') => {
    doc.addPage();
    doc.y = MARGIN;

    // Slim branded header strip
    doc.rect(0, 0, doc.page.width, 28).fill('#0F2B5B');
    doc.rect(0, 28, doc.page.width, 2).fill('#2563EB');

    doc.font('Helvetica-Bold').fontSize(7).fillColor('#FFFFFF')
       .text('AI Business Audit  ·  Confidential', cx, 10, { width: cw(doc) });

    if (companyName) {
        doc.font('Helvetica').fontSize(7).fillColor('#CBD5E1')
           .text(companyName.toUpperCase(), cx, 10, { width: cw(doc), align: 'right' });
    }

    doc.y = 28 + 2 + 18; // below header strip + padding
};

/**
 * Ensure at least `need` pts of vertical space.
 * If not, add a new page.
 */
const ensureSpace = (doc, need, companyName = '') => {
    if (remaining(doc) < need) newPage(doc, companyName);
};

// ─── Section heading ──────────────────────────────────────────────────────────

const drawSectionTitle = (doc, title) => {
    ensureSpace(doc, 40);
    const barH = 22;
    const startY = doc.y;

    doc.rect(cx, startY, 4, barH).fill('#2563EB');

    doc.font('Helvetica-Bold').fontSize(12).fillColor('#0F2B5B')
       .text(title, cx + 12, startY + 5, { width: cw(doc) - 12 });

    doc.y = startY + barH + 8;
};

// ─── Horizontal rule ──────────────────────────────────────────────────────────

const rule = (doc, { color = '#E2E8F0', thickness = 0.5 } = {}) => {
    doc.save()
       .strokeColor(color).lineWidth(thickness)
       .moveTo(cx, doc.y).lineTo(cx + cw(doc), doc.y)
       .stroke().restore();
    doc.y += 4;
};

// ─── SECTION: plain paragraph ─────────────────────────────────────────────────
export const addSection = (doc, title, content, companyName = '') => {
    const text = typeof content === 'string' ? content.trim() : String(content ?? '');
    const textH = doc.heightOfString(text, { width: cw(doc), fontSize: 10, lineGap: 3 });

    ensureSpace(doc, 40 + textH + 24, companyName);
    drawSectionTitle(doc, title);

    doc.font('Helvetica').fontSize(10).fillColor('#374151')
       .text(text, cx, doc.y, { width: cw(doc), align: 'justify', lineGap: 3 });

    doc.y += 20;
};

// ─── SECTION: callout / highlight box ─────────────────────────────────────────
export const addCalloutSection = (doc, title, content, companyName = '') => {
    const text = typeof content === 'string' ? content.trim() : String(content ?? '');

    // Measure text height inside the box (inset by 16 each side)
    const innerW  = cw(doc) - 32;
    const textH   = doc.heightOfString(text, { width: innerW, fontSize: 10, lineGap: 3 });
    const boxH    = textH + 28; // 14 padding top + bottom

    ensureSpace(doc, 40 + boxH + 24, companyName);
    drawSectionTitle(doc, title);

    const boxY = doc.y;

    // Background rect — drawn with KNOWN height before any text
    doc.roundedRect(cx, boxY, cw(doc), boxH, 4).fill('#EFF6FF');

    // Left accent stripe
    doc.rect(cx, boxY, 3, boxH).fill('#2563EB');

    // Text inside — starts at boxY + 14, NOT at doc.y after the rect
    doc.font('Helvetica').fontSize(10).fillColor('#1E40AF')
       .text(text, cx + 16, boxY + 14, { width: innerW, lineGap: 3, align: 'justify' });

    // Advance cursor past the box
    doc.y = boxY + boxH + 20;
};

// ─── SECTION: bulleted list ───────────────────────────────────────────────────
export const addListSection = (doc, title, items = [], companyName = '') => {
    if (!Array.isArray(items)) items = items ? [String(items)] : [];
    items = items.filter(Boolean);

    ensureSpace(doc, 50, companyName);
    drawSectionTitle(doc, title);

    if (items.length === 0) {
        doc.font('Helvetica-Oblique').fontSize(9).fillColor('#9CA3AF')
           .text('No items available.', cx, doc.y, { width: cw(doc) });
        doc.y += 16;
        return;
    }

    items.forEach((item) => {
        const text   = typeof item === 'string' ? item.trim() : String(item ?? '');
        if (!text) return;

        const lineH  = doc.heightOfString(text, { width: cw(doc) - 18, fontSize: 10, lineGap: 3 });
        ensureSpace(doc, lineH + 10, companyName);

        const rowY = doc.y;

        // Bullet dot
        doc.circle(cx + 4, rowY + 5, 3).fill('#2563EB');

        // Item text
        doc.font('Helvetica').fontSize(10).fillColor('#374151')
           .text(text, cx + 14, rowY, { width: cw(doc) - 14, lineGap: 3 });

        doc.y += 8;
    });

    doc.y += 12;
};

// ─── SECTION: digital presence (strengths / weaknesses / brand) ───────────────
export const addDigitalPresenceSection = (doc, title, analysis = {}, companyName = '') => {
    const strengths    = Array.isArray(analysis.strengths)         ? analysis.strengths         : [];
    const weaknesses   = Array.isArray(analysis.weaknesses)        ? analysis.weaknesses        : [];
    const observations = Array.isArray(analysis.brandObservations) ? analysis.brandObservations : [];

    ensureSpace(doc, 60, companyName);
    drawSectionTitle(doc, title);

    // Only render sub-lists that have actual content — skip entirely if empty
    const renderSubList = (label, labelColor, bulletColor, items) => {
        if (!items || items.length === 0) return; // ← silent skip, no placeholder

        ensureSpace(doc, 30, companyName);

        doc.font('Helvetica-Bold').fontSize(10).fillColor(labelColor)
           .text(label, cx, doc.y, { width: cw(doc) });
        doc.y += 4;

        items.forEach((item) => {
            const text  = typeof item === 'string' ? item.trim() : String(item ?? '');
            if (!text) return;
            const lineH = doc.heightOfString(text, { width: cw(doc) - 20, fontSize: 10, lineGap: 2 });

            ensureSpace(doc, lineH + 8, companyName);
            const rowY = doc.y;

            doc.font('Helvetica-Bold').fontSize(9).fillColor(bulletColor)
               .text('▸', cx + 6, rowY, { width: 10, lineGap: 0 });

            doc.font('Helvetica').fontSize(10).fillColor('#374151')
               .text(text, cx + 18, rowY, { width: cw(doc) - 18, lineGap: 2 });

            doc.y += 6;
        });

        doc.y += 10;
    };

    renderSubList('Strengths',          '#059669', '#059669', strengths);
    renderSubList('Weaknesses',         '#DC2626', '#DC2626', weaknesses);
    renderSubList('Brand Observations', '#2563EB', '#2563EB', observations);

    doc.y += 8;
};

// ─── SECTION: AI automation opportunity cards ─────────────────────────────────
export const addAutomationOpportunitiesSection = (doc, title, opportunities = [], companyName = '') => {
    if (!Array.isArray(opportunities)) opportunities = [];
    opportunities = opportunities.slice(0, 3); // hard cap at 3

    ensureSpace(doc, 60, companyName);
    drawSectionTitle(doc, title);

    if (opportunities.length === 0) {
        doc.font('Helvetica-Oblique').fontSize(9).fillColor('#9CA3AF')
           .text('No opportunities identified.', cx, doc.y, { width: cw(doc) });
        doc.y += 16;
        return;
    }

    const labelW   = 72;   // width reserved for "Problem:" label column
    const innerW   = cw(doc) - DS_CARD_INSET * 2;
    const fieldW   = innerW - labelW - 6;
    const pad      = 14;   // inner top/bottom card padding

    opportunities.forEach((opp, i) => {
        if (!opp || typeof opp !== 'object') return;

        const oppTitle  = truncate(String(opp.title                                          || `Opportunity ${i + 1}`), 80);
        const problem   = truncate(String(opp.problem                                         || 'N/A'), 120);
        const solution  = truncate(String(opp.solution                                        || 'N/A'), 130);
        const impact    = truncate(String(opp.impact          || opp.businessImpact            || 'N/A'), 100);
        const complexity= String(  opp.complexity             || opp.implementationComplexity  || 'N/A');

        // ── Measure each field precisely ──────────────────────────────────────
        const titleH    = doc.heightOfString(oppTitle,  { font: 'Helvetica-Bold', fontSize: 11, width: innerW });
        const problemH  = doc.heightOfString(problem,   { fontSize: 9,  width: fieldW, lineGap: 2 });
        const solutionH = doc.heightOfString(solution,  { fontSize: 9,  width: fieldW, lineGap: 2 });
        const impactH   = doc.heightOfString(impact,    { fontSize: 9,  width: fieldW, lineGap: 2 });
        const labelLineH = 12; // height of a single "Problem:" label
        const badgeH    = 14;
        const rowGap    = 8;

        const cardH = pad
            + titleH + rowGap
            + Math.max(labelLineH, problemH)  + rowGap
            + Math.max(labelLineH, solutionH) + rowGap
            + Math.max(labelLineH, impactH)   + rowGap
            + badgeH
            + pad;

        ensureSpace(doc, cardH + 12, companyName);

        const cardY  = doc.y;
        const cardX  = cx;
        const cardW  = cw(doc);

        // Card shadow effect (slightly offset darker rect)
        doc.roundedRect(cardX + 2, cardY + 2, cardW, cardH, 5).fill('#E2E8F0');

        // Card background
        doc.roundedRect(cardX, cardY, cardW, cardH, 5).fill('#F8FAFF');

        // Left accent bar
        doc.rect(cardX, cardY, 4, cardH).fill('#2563EB');

        // Index pill (top-right)
        const pillText = `0${i + 1}`;
        const pillX    = cardX + cardW - 30;
        const pillY    = cardY + 10;
        doc.roundedRect(pillX, pillY, 22, 15, 3).fill('#2563EB');
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF')
           .text(pillText, pillX, pillY + 3, { width: 22, align: 'center', lineGap: 0 });

        // Cursor inside the card
        let curY = cardY + pad;
        const textX = cardX + DS_CARD_INSET;

        // Title
        doc.font('Helvetica-Bold').fontSize(11).fillColor('#0F2B5B')
           .text(oppTitle, textX, curY, { width: innerW - 28, lineGap: 2 });
        curY += titleH + rowGap;

        // Helper to draw a label+value row
        const row = (label, value, height) => {
            doc.font('Helvetica-Bold').fontSize(8).fillColor('#6B7280')
               .text(label, textX, curY, { width: labelW, lineGap: 0 });
            doc.font('Helvetica').fontSize(9).fillColor('#374151')
               .text(value, textX + labelW + 6, curY, { width: fieldW, lineGap: 2 });
            curY += height + rowGap;
        };

        row('Problem:',  problem,  Math.max(labelLineH, problemH));
        row('Solution:', solution, Math.max(labelLineH, solutionH));
        row('Impact:',   impact,   Math.max(labelLineH, impactH));

        // Complexity badge — reads from normalised field name guaranteed by sanitizer
        const cxBadge = textX + labelW + 6;
        drawComplexityBadge(doc, complexity, cxBadge, curY);

        // Advance cursor past card
        doc.y = cardY + cardH + 14;
    });

    doc.y += 6;
};

// ─── SECTION: readiness score ──────────────────────────────────────────────────
export const addReadinessScoreSection = (doc, title, scoreData = {}, companyName = '') => {
    const score     = typeof scoreData.score === 'number' ? Math.min(100, Math.max(0, scoreData.score)) : 0;
    const reasoning = typeof scoreData.reasoning === 'string' ? scoreData.reasoning.trim() : 'No reasoning provided.';
    const reasonH   = doc.heightOfString(reasoning, { width: cw(doc) - 130, fontSize: 10, lineGap: 3 });

    ensureSpace(doc, 40 + 70 + reasonH + 24, companyName);
    drawSectionTitle(doc, title);

    const blockY  = doc.y;

    // ── Score box (left) ──────────────────────────────────────────────────────
    const boxW = 110;
    const boxH = 64;
    doc.roundedRect(cx, blockY, boxW, boxH, 6).fill('#EFF6FF');

    // Score color
    let scoreColor = '#DC2626';
    if (score >= 70) scoreColor = '#059669';
    else if (score >= 50) scoreColor = '#D97706';

    // Score number — centered in box
    const numStr = String(score);
    doc.font('Helvetica-Bold').fontSize(34).fillColor(scoreColor)
       .text(numStr, cx, blockY + 8, { width: boxW, align: 'center', lineGap: 0 });

    doc.font('Helvetica').fontSize(8).fillColor('#6B7280')
       .text('/ 100 · AI Readiness', cx, blockY + 46, { width: boxW, align: 'center', lineGap: 0 });

    // Progress bar below score box
    const barY = blockY + boxH + 6;
    const barW = cw(doc);
    const barH = 8;
    doc.roundedRect(cx, barY, barW, barH, 4).fill('#E2E8F0');
    doc.roundedRect(cx, barY, Math.round(barW * score / 100), barH, 4).fill(scoreColor);

    // ── Reasoning (right of score box) ───────────────────────────────────────
    const reasonX = cx + boxW + 16;
    const reasonW = cw(doc) - boxW - 16;

    doc.font('Helvetica-Bold').fontSize(9).fillColor('#374151')
       .text('Why this score:', reasonX, blockY + 4, { width: reasonW, lineGap: 0 });

    doc.font('Helvetica').fontSize(10).fillColor('#374151')
       .text(reasoning, reasonX, blockY + 17, { width: reasonW, lineGap: 3 });

    // Advance cursor below the bar
    doc.y = barY + barH + 20;
};

// ─── FOOTER ───────────────────────────────────────────────────────────────────
export const addFooter = (doc, leadData) => {
    // Pin to absolute footer position — safe because this is always last
    const y = FOOTER_Y;

    doc.save()
       .strokeColor('#E2E8F0').lineWidth(0.5)
       .moveTo(cx, y).lineTo(cx + cw(doc), y)
       .stroke().restore();

    doc.font('Helvetica').fontSize(8).fillColor('#9CA3AF')
       .text(
           'This report was AI-generated from publicly available data. Treat as a strategic starting point, not a final audit.',
           cx, y + 8, { width: cw(doc), align: 'center', lineGap: 2 }
       );

    doc.font('Helvetica').fontSize(8).fillColor('#9CA3AF')
       .text(
           `${leadData.email || ''}   ·   Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}   ·   Confidential`,
           cx, y + 20, { width: cw(doc), align: 'center', lineGap: 0 }
       );
};

// ─── Private helpers ──────────────────────────────────────────────────────────

/** Card inset — distance from card edge to text */
const DS_CARD_INSET = 16;

/** Hard-truncate a string to N characters */
const truncate = (str, n) => {
    if (!str) return '';
    str = str.trim();
    return str.length > n ? str.slice(0, n - 1) + '…' : str;
};

/** Draw a complexity badge pill */
const drawComplexityBadge = (doc, complexity, x, y) => {
    const c = (complexity || '').toLowerCase();
    let bg, fg, label;

    if (c === 'low')    { bg = '#D1FAE5'; fg = '#065F46'; label = '◆  Low Complexity'; }
    else if (c === 'medium') { bg = '#FEF3C7'; fg = '#92400E'; label = '◆  Medium Complexity'; }
    else if (c === 'high')   { bg = '#FEE2E2'; fg = '#991B1B'; label = '◆  High Complexity'; }
    else                { bg = '#F3F4F6'; fg = '#374151'; label = `◆  ${complexity}`; }

    const textW  = doc.widthOfString(label, { font: 'Helvetica-Bold', fontSize: 8 });
    const pillW  = textW + 16;
    const pillH  = 16;

    doc.roundedRect(x, y, pillW, pillH, 3).fill(bg);
    doc.font('Helvetica-Bold').fontSize(8).fillColor(fg)
       .text(label, x + 8, y + 3, { width: textW, lineGap: 0 });
};
