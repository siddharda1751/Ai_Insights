import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';

/**
 * COMPANY INTELLIGENCE EXTRACTION ENGINE
 * 
 * Crawls a company website and extracts rich business intelligence:
 * - company details and positioning
 * - business type and maturity signals
 * - technology stack
 * - service/product offerings
 * - AI/automation opportunities
 */

const IMPORTANT_KEYWORDS = [
    'about',
    'services',
    'solutions',
    'products',
    'features',
    'pricing',
    'case-study',
    'case-studies',
    'blog',
    'contact',
    'automation',
    'platform',
    'software',
    'industries',
    'clients',
    'customers',
    'resources',
    'why',
    'how',
    'integrations',
    'partners',
    'team',
    'careers',
];

const TECH_SIGNALS = {
    frontend: ['React', 'Vue', 'Angular', 'Next.js', 'Svelte', 'Gatsby', 'Nuxt'],
    analytics: ['Google Analytics', 'Segment', 'Mixpanel', 'Amplitude', 'Hotjar'],
    crm: ['HubSpot', 'Salesforce', 'Pipedrive', 'Zoho', 'Copper', 'Freshsales'],
    automation: ['Zapier', 'Make', 'IFTTT', 'Integromat', 'RPA', 'n8n'],
    payment: ['Stripe', 'PayPal', 'Square', 'Braintree', 'Adyen', 'Razorpay'],
    messaging: ['Intercom', 'Zendesk', 'Drift', 'Crisp', 'LiveChat', 'Tidio'],
    cms: ['WordPress', 'Contentful', 'Sanity', 'Strapi', 'Ghost'],
    ecommerce: ['Shopify', 'WooCommerce', 'BigCommerce', 'Magento'],
    communication: ['Calendly', 'Slack', 'Teams', 'Discord'],
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Fetch a URL with error handling and retry logic
 */
const fetchUrl = async (url, timeout = 10000) => {
    try {
        const { data } = await axios.get(url, {
            timeout,
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
            maxRedirects: 5,
        });
        return data;
    } catch (error) {
        console.warn(`[Fetch] Failed to fetch ${url}: ${error.message}`);
        return null;
    }
};

/**
 * Extract domain from URL
 */
const getDomain = (urlString) => {
    try {
        const parsed = new URL(urlString);
        return `${parsed.protocol}//${parsed.hostname}`;
    } catch (e) {
        return urlString;
    }
};

/**
 * Normalize URL
 */
const normalizeUrl = (url, baseUrl) => {
    try {
        return new URL(url, baseUrl).href;
    } catch (e) {
        return null;
    }
};

/**
 * Check if URL is same domain
 */
const isSameDomain = (url, baseUrl) => {
    try {
        const urlObj = new URL(url, baseUrl);
        const baseObj = new URL(baseUrl);
        return urlObj.hostname === baseObj.hostname;
    } catch (e) {
        return false;
    }
};

/**
 * Remove duplicates from array
 */
const deduplicate = (arr) => Array.from(new Set(arr.map(a => a.toLowerCase()))).filter(Boolean);

/**
 * Clean text: remove extra whitespace, trim
 */
const cleanText = (text, minLength = 0) => {
    if (!text) return '';
    const cleaned = text.replace(/\s+/g, ' ').trim();
    return cleaned.length >= minLength ? cleaned : '';
};

// ============================================================
// PAGE EXTRACTION FUNCTIONS
// ============================================================

/**
 * Extract structured data from a single page
 */
const extractPageData = (html, url) => {
    const $ = cheerio.load(html);

    // METADATA
    const title = $('title').first().text().trim() || '';
    const metaDescription =
        $('meta[name="description"]').attr('content')?.trim() ||
        $('meta[property="og:description"]').attr('content')?.trim() ||
        '';
    const ogTitle = $('meta[property="og:title"]').attr('content')?.trim() || '';

    // HEADINGS (H1-H3)
    const headings = [];
    $('h1, h2, h3').each((_, el) => {
        const text = cleanText($(el).text());
        if (text && text.length > 3) headings.push(text);
    });

    // PARAGRAPHS
    const paragraphs = [];
    $('p').each((_, el) => {
        const text = cleanText($(el).text(), 30);
        if (text) paragraphs.push(text);
    });

    // CTA BUTTONS
    const ctas = [];
    $('a[href], button').each((_, el) => {
        const text = cleanText($(el).text(), 3);
        if (text && (text.includes('Sign') || text.includes('Get') || text.includes('Try') || text.includes('Learn') || text.includes('Demo') || text.includes('Contact'))) {
            ctas.push(text);
        }
    });

    // INTERNAL LINKS
    const internalLinks = [];
    $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && href.startsWith('/')) {
            internalLinks.push(href);
        } else if (href && isSameDomain(href, url)) {
            try {
                const normalized = normalizeUrl(href, url);
                if (normalized) internalLinks.push(normalized);
            } catch (e) { }
        }
    });

    // NAVIGATION MENU
    const navItems = [];
    $('nav a, header a, .navbar a, .menu a').each((_, el) => {
        const text = cleanText($(el).text(), 2);
        if (text) navItems.push(text);
    });

    // CONTACT INFO
    const emails = [];
    const phones = [];
    const contactText = html.match(/[\w\.-]+@[\w\.-]+\.\w+/g) || [];
    contactText.forEach(email => {
        if (!email.includes('@example') && !email.includes('@localhost')) {
            emails.push(email);
        }
    });

    const phoneMatch = html.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4,9}/g) || [];
    phones.push(...phoneMatch);

    // TESTIMONIALS
    const testimonials = [];
    $('[class*="testimonial"], [class*="review"], [class*="quote"]').each((_, el) => {
        const text = cleanText($(el).text(), 20);
        if (text && text.length < 500) testimonials.push(text);
    });

    // SOCIAL LINKS
    const socialLinks = [];
    $('a[href*="facebook"], a[href*="twitter"], a[href*="linkedin"], a[href*="instagram"], a[href*="github"]').each((_, el) => {
        const href = $(el).attr('href');
        if (href) socialLinks.push(href);
    });

    // LISTS & FEATURES
    const listItems = [];
    $('ul li, ol li').each((_, el) => {
        const text = cleanText($(el).text(), 5);
        if (text && text.length < 200) listItems.push(text);
    });

    // SCRIPT TAGS (for tech detection)
    const scripts = [];
    $('script[src]').each((_, el) => {
        const src = $(el).attr('src') || '';
        scripts.push(src);
    });

    return {
        url,
        title,
        metaDescription,
        ogTitle,
        headings: deduplicate(headings).slice(0, 10),
        paragraphs: deduplicate(paragraphs).slice(0, 15),
        ctas: deduplicate(ctas),
        internalLinks: deduplicate(internalLinks),
        navItems: deduplicate(navItems),
        emails: deduplicate(emails),
        phones: deduplicate(phones),
        testimonials: deduplicate(testimonials).slice(0, 5),
        socialLinks: deduplicate(socialLinks),
        listItems: deduplicate(listItems).slice(0, 20),
        scripts,
    };
};

// ============================================================
// BUSINESS SIGNAL DETECTION
// ============================================================

/**
 * Detect business signals from all collected pages
 */
const detectBusinessSignals = (pages) => {
    const allText = pages.map(p => p.headings.join(' ') + ' ' + p.paragraphs.join(' ')).join(' ').toLowerCase();
    const allUrls = pages.flatMap(p => p.internalLinks || []).join(' ').toLowerCase();

    return {
        hasPricing: /pricing|price|plans|cost|payment|billing/.test(allText) || /pricing/.test(allUrls),
        hasBlog: /blog|article|news|insights|resources/.test(allUrls) || /blog/.test(allText),
        hasTestimonials: pages.some(p => p.testimonials.length > 0) || /testimonial|review|feedback|case study/.test(allText),
        hasCaseStudies: /case study|case studies|success story/.test(allText) || /case/.test(allUrls),
        hasDemoBooking: /schedule|book|demo|calendar|meeting/.test(allText) || /demo|calendar|booking/.test(allUrls),
        hasChatbot: /chat|bot|support|assistant/.test(allText),
        hasApiDocs: /api|documentation|docs|developer/.test(allText) || /api|docs/.test(allUrls),
        hasIntegrations: /integration|integrate|zapier|api|webhook/.test(allText) || /integration|partner/.test(allUrls),
        hasEnterprisePlans: /enterprise|custom|dedicated|sso|audit log/.test(allText),
        hasFreeTrial: /free trial|try free|free plan|freemium/.test(allText),
    };
};

// ============================================================
// TECHNOLOGY DETECTION
// ============================================================

/**
 * Detect technologies used by the company
 */
const detectTechStack = (pages) => {
    const allScripts = pages.flatMap(p => p.scripts || []).join(' ').toLowerCase();
    const allText = pages.map(p => p.paragraphs.join(' ')).join(' ').toLowerCase();

    const result = {
        frontend: [],
        analytics: [],
        crm: [],
        automation: [],
        payment: [],
        messaging: [],
        cms: [],
        ecommerce: [],
        communication: [],
    };

    for (const [category, tools] of Object.entries(TECH_SIGNALS)) {
        for (const tool of tools) {
            const lowerTool = tool.toLowerCase();
            if (allScripts.includes(lowerTool) || allText.includes(lowerTool)) {
                result[category].push(tool);
            }
        }
    }

    // Remove duplicates
    for (const key in result) {
        result[key] = [...new Set(result[key])];
    }

    return result;
};

// ============================================================
// BUSINESS TYPE & INDUSTRY DETECTION
// ============================================================

/**
 * Infer business type and target audience
 */
const inferBusinessContext = (pages) => {
    const allText = pages.map(p => p.headings.join(' ') + ' ' + p.paragraphs.join(' ')).join(' ').toLowerCase();

    const businessTypes = [
        { type: 'SaaS', keywords: ['software as a service', 'saas', 'cloud-based', 'subscription', 'pay per month'] },
        { type: 'Agency', keywords: ['agency', 'creative', 'design studio', 'marketing agency', 'digital agency'] },
        { type: 'Consulting', keywords: ['consulting', 'consultancy', 'strategic advisory', 'management consultant'] },
        { type: 'Marketplace', keywords: ['marketplace', 'platform', 'connect', 'buyers and sellers'] },
        { type: 'E-commerce', keywords: ['shop', 'store', 'sell products', 'ecommerce', 'online store'] },
        { type: 'AI Company', keywords: ['artificial intelligence', 'ai', 'machine learning', 'neural networks'] },
        { type: 'Enterprise Software', keywords: ['enterprise', 'erp', 'crm', 'compliance', 'security'] },
        { type: 'Healthcare', keywords: ['healthcare', 'telemedicine', 'medical', 'patient', 'clinic'] },
        { type: 'EdTech', keywords: ['education', 'learning', 'online courses', 'students', 'training'] },
        { type: 'FinTech', keywords: ['fintech', 'banking', 'payment', 'financial', 'investment'] },
    ];

    let detectedBusinessType = 'B2B Service';
    for (const { type, keywords } of businessTypes) {
        if (keywords.some(kw => allText.includes(kw))) {
            detectedBusinessType = type;
            break;
        }
    }

    const targetAudience = [];
    if (allText.includes('startup')) targetAudience.push('startups');
    if (allText.includes('enterprise')) targetAudience.push('enterprises');
    if (allText.includes('sme') || allText.includes('small business') || allText.includes('mid-market')) targetAudience.push('SMBs');
    if (allText.includes('agency') || allText.includes('freelancer')) targetAudience.push('agencies');
    if (allText.includes('developer') || allText.includes('engineer')) targetAudience.push('developers');
    if (allText.includes('healthcare') || allText.includes('hospital')) targetAudience.push('healthcare');

    return { businessType: detectedBusinessType, targetAudience };
};

// ============================================================
// AUTOMATION OPPORTUNITY DETECTION
// ============================================================

/**
 * Identify AI/automation opportunities based on business context
 */
const identifyAutomationOpportunities = (allData) => {
    const opportunities = [];
    const text = allData.allText.toLowerCase();
    const businessType = allData.businessType;

    const checks = [
        {
            title: 'Lead Qualification & Scoring',
            keywords: ['lead', 'sales', 'pipeline', 'prospect', 'qualification'],
            reason: 'Company accepts leads but could automate qualification scoring',
            potentialImpact: '40-60% faster lead processing',
        },
        {
            title: 'AI Chatbot for Support',
            keywords: ['support', 'help', 'faq', 'customer service', 'contact us'],
            reason: 'High volume of support inquiries could be auto-triaged',
            potentialImpact: '70% reduction in support response time',
        },
        {
            title: 'Email Automation & Personalization',
            keywords: ['email', 'newsletter', 'notification', 'outreach', 'campaign'],
            reason: 'Could leverage AI for personalized email sequences',
            potentialImpact: '3-5x improvement in email engagement',
        },
        {
            title: 'Content Generation & Blogging',
            keywords: ['blog', 'content', 'article', 'publication', 'resource'],
            reason: 'Could use AI to generate SEO-optimized content at scale',
            potentialImpact: '10x faster content creation',
        },
        {
            title: 'CRM Workflow Automation',
            keywords: ['crm', 'salesforce', 'hubspot', 'sales', 'customer'],
            reason: 'Manual CRM data entry and workflow management',
            potentialImpact: '30-50% time savings for sales team',
        },
        {
            title: 'Onboarding Process Automation',
            keywords: ['onboard', 'setup', 'integration', 'getting started', 'welcome'],
            reason: 'Repetitive onboarding steps could be automated',
            potentialImpact: '50% faster customer onboarding',
        },
        {
            title: 'Document & Report Generation',
            keywords: ['document', 'report', 'pdf', 'export', 'generate'],
            reason: 'Manual document generation could be automated',
            potentialImpact: '80% reduction in document generation time',
        },
        {
            title: 'Analytics & Insights Automation',
            keywords: ['analytics', 'report', 'dashboard', 'metric', 'insight', 'performance'],
            reason: 'Manual analytics compilation could be automated with AI insights',
            potentialImpact: 'Real-time AI-powered insights',
        },
        {
            title: 'Workflow Orchestration',
            keywords: ['workflow', 'integration', 'api', 'automation', 'process'],
            reason: 'Complex workflows across multiple tools could be unified',
            potentialImpact: '60% reduction in manual process steps',
        },
        {
            title: 'Data Quality & Enrichment',
            keywords: ['data', 'database', 'customer data', 'sync', 'integration'],
            reason: 'Could use AI to automatically enrich and validate data',
            potentialImpact: 'Cleaner, more complete customer data',
        },
    ];

    for (const check of checks) {
        if (check.keywords.some(kw => text.includes(kw))) {
            opportunities.push({
                title: check.title,
                reason: check.reason,
                potentialImpact: check.potentialImpact,
            });
        }
    }

    // Deduplicate by title
    const seen = new Set();
    return opportunities.filter(opp => {
        if (seen.has(opp.title)) return false;
        seen.add(opp.title);
        return true;
    });
};

// ============================================================
// DISCOVERY STRATEGY
// ============================================================

/**
 * Discover important internal pages to crawl
 */
const discoverImportantPages = (homepage, baseUrl) => {
    const { internalLinks } = homepage;
    const important = new Set();

    for (const link of internalLinks) {
        const normalizedLink = normalizeUrl(link, baseUrl) || link;
        const lowerLink = normalizedLink.toLowerCase();

        // Filter out assets, files, auth pages
        if (/\.(css|js|png|jpg|gif|pdf|zip)$/i.test(lowerLink)) continue;
        if (/login|signup|auth|dashboard|profile|settings/.test(lowerLink)) continue;

        // Check for important keywords
        for (const keyword of IMPORTANT_KEYWORDS) {
            if (lowerLink.includes(keyword)) {
                important.add(normalizedLink);
                break;
            }
        }
    }

    return Array.from(important).slice(0, 7); // Max 7 additional pages
};

// ============================================================
// MAIN EXPORT FUNCTION
// ============================================================

/**
 * Comprehensive company intelligence extraction
 */
export const scrapeCompany = async (websiteUrl) => {
    const startTime = new Date();
    const baseUrl = getDomain(websiteUrl);
    const pagesVisited = [];
    const allPageData = [];

    try {
        console.log(`[Intelligence] Starting extraction for ${websiteUrl}`);

        // STEP 1: Scrape homepage
        let html = await fetchUrl(websiteUrl);
        if (!html) {
            throw new Error(`Could not fetch homepage: ${websiteUrl}`);
        }

        const homepageData = extractPageData(html, websiteUrl);
        pagesVisited.push(websiteUrl);
        allPageData.push(homepageData);
        console.log(`[Intelligence] Scraped homepage`);

        // STEP 2: Discover important internal pages
        const importantPages = discoverImportantPages(homepageData, baseUrl);
        console.log(`[Intelligence] Discovered ${importantPages.length} important pages`);

        // STEP 3: Crawl important pages
        for (const pageUrl of importantPages) {
            if (pagesVisited.length >= 8) break; // Max 8 pages total

            html = await fetchUrl(pageUrl);
            if (!html) {
                console.warn(`[Intelligence] Failed to fetch ${pageUrl}, skipping`);
                continue;
            }

            const pageData = extractPageData(html, pageUrl);
            pagesVisited.push(pageUrl);
            allPageData.push(pageData);
            console.log(`[Intelligence] Scraped ${pageUrl}`);
        }

        // STEP 4-6: Analyze and detect signals
        const businessSignals = detectBusinessSignals(allPageData);
        const techStack = detectTechStack(allPageData);
        const { businessType, targetAudience } = inferBusinessContext(allPageData);

        // Collect all text for final analysis
        const allText = allPageData.map(p => p.headings.join(' ') + ' ' + p.paragraphs.join(' ')).join(' ');

        // Extract unique company details
        const companyName = homepageData.title.split('|')[0].split('-')[0].trim() || 'Unknown';
        const description = homepageData.metaDescription || '';

        // Detect industry
        const industry = businessType;

        // Combine all emails/phones
        const allEmails = [...new Set(allPageData.flatMap(p => p.emails))];
        const allPhones = [...new Set(allPageData.flatMap(p => p.phones))];
        const allAddresses = [];
        const allSocial = [...new Set(allPageData.flatMap(p => p.socialLinks))];

        // Collect services/products from headings
        const allHeadings = [...new Set(allPageData.flatMap(p => p.headings))];
        const services = allHeadings.filter(h => h.length < 100 && h.length > 5).slice(0, 10);

        // Identify automation opportunities
        const automationOpportunities = identifyAutomationOpportunities({
            allText,
            businessType,
            businessSignals,
        });

        // STEP 7: Structure final output
        const result = {
            company: {
                name: companyName,
                website: baseUrl,
                title: homepageData.title,
                description,
                industry,
                businessType,
                targetAudience,
            },

            branding: {
                heroText: homepageData.headings.slice(0, 3),
                taglines: homepageData.paragraphs.slice(0, 2),
                ctas: homepageData.ctas,
            },

            offerings: {
                services: services,
                products: services.slice(0, 5),
                features: homepageData.listItems.slice(0, 10),
                industriesServed: targetAudience,
            },

            businessSignals,

            techStackSignals: techStack,

            contentInsights: {
                headings: allHeadings.slice(0, 20),
                keyParagraphs: [...new Set(allPageData.flatMap(p => p.paragraphs))].slice(0, 15),
                testimonials: [...new Set(allPageData.flatMap(p => p.testimonials))],
                faq: [],
                blogTopics: [],
            },

            contact: {
                emails: allEmails,
                phones: allPhones,
                addresses: allAddresses,
                socialLinks: allSocial,
            },

            automationOpportunities,

            pagesVisited,
            scrapedAt: new Date().toISOString(),
            executionTimeMs: new Date() - startTime,
        };

        console.log(`[Intelligence] Completed extraction in ${result.executionTimeMs}ms`);
        return result;
    } catch (error) {
        console.error(`[Intelligence] Fatal error: ${error.message}`);
        return {
            company: {
                name: 'N/A',
                website: baseUrl,
                title: 'N/A',
                description: 'N/A',
                industry: 'N/A',
                businessType: 'N/A',
                targetAudience: [],
            },
            branding: {
                heroText: [],
                taglines: [],
                ctas: [],
            },
            offerings: {
                services: [],
                products: [],
                features: [],
                industriesServed: [],
            },
            businessSignals: {},
            techStackSignals: {},
            contentInsights: {
                headings: [],
                keyParagraphs: [],
                testimonials: [],
                faq: [],
                blogTopics: [],
            },
            contact: {
                emails: [],
                phones: [],
                addresses: [],
                socialLinks: [],
            },
            automationOpportunities: [],
            pagesVisited,
            scrapedAt: new Date().toISOString(),
            error: error.message,
        };
    }
};
