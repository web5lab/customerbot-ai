import path from 'path';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Manually define __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const screenshotDir = path.join(__dirname, '../screenshots');

// Ensure the directory exists
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

export const procesPdf = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No PDF file uploaded' });
        }

        if (req.file.mimetype !== 'application/pdf') {
            return res.status(400).json({ error: 'File must be a PDF' });
        }

        const dataBuffer = req.file.buffer;
        let pages = [];

        const pdfData = await pdf(dataBuffer, {
            max: 0,
            pagerender: async function (pageData) {
                const textContent = await pageData.getTextContent();
                const pageContent = {
                    pageNumber: pageData.pageNumber,
                    text: textContent.items
                        .map(item => item.str)
                        .join(' ')
                        .replace(/\s+/g, ' ')
                        .trim(),
                    dimensions: {
                        width: pageData.view[2],
                        height: pageData.view[3]
                    }
                };
                pages.push(pageContent);
                return pageContent;
            }
        });

        // Sort pages by page number to ensure correct order
        pages.sort((a, b) => a.pageNumber - b.pageNumber);

        // Enhanced metadata extraction
        const cleanMetadata = {
            title: pdfData.info?.Title || '',
            author: pdfData.info?.Author || '',
            subject: pdfData.info?.Subject || '',
            keywords: pdfData.info?.Keywords || '',
            creator: pdfData.info?.Creator || '',
            producer: pdfData.info?.Producer || '',
            version: pdfData.info?.PDFFormatVersion || ''
        };

        // Combine all pages text for full document text
        const fullText = pages
            .map(page => page.text)
            .join('\n\n')
            .replace(/\s+/g, ' ')
            .trim();

        res.json({
            text: fullText,
            pages: pages,
            metadata: cleanMetadata,
            pageCount: pdfData.numpages,
            textLength: fullText.length,
            hasText: fullText.length > 0,
            stats: {
                averageWordsPerPage: Math.round(fullText.split(/\s+/).length / pdfData.numpages),
                totalPages: pdfData.numpages
            }
        });

    } catch (error) {
        console.error('PDF processing error:', error);
        res.status(500).json({
            error: 'Error processing PDF',
            details: error.message
        });
    }
}

// Auto-scroll for infinite scroll pages
const autoScroll = async (page) => {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
};

// Scrape a single page: text + screenshot + links
const scrapePage = async (page, url, depth, maxDepth) => {
    console.log(`Scraping: ${url} | Depth: ${depth}`);

    try {
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 90000, // Increased timeout to 90 seconds
        });
    } catch (error) {
        console.error(`Failed to load ${url}: ${error.message}`);
        return {
            url,
            textContent: 'Failed to load page due to timeout or navigation error.',
            screenshotPath: null,
            linkedPages: [],
        };
    }

    await autoScroll(page);

    // Take Screenshot
    const timestamp = Date.now();
    const screenshotName = `screenshot-${timestamp}.png`;
    const screenshotPath = path.join(screenshotDir, screenshotName);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Extract all visible text
    const pageText = await page.evaluate(() => document.body.innerText.trim().replace(/\s+/g, ' '));

    // Extract internal links
    const links = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a[href]'));
        return anchors
            .map((a) => a.href)
            .filter((href) => href.startsWith(window.location.origin)); // Only internal links
    });

    const uniqueLinks = [...new Set(links)].slice(0, 5); // Limit to first 5 links to avoid overload

    // Recursive scraping for linked pages if depth allows
    let linkedPages = [];
    if (depth < maxDepth) {
        for (const link of uniqueLinks) {
            const linkedData = await scrapePage(page, link, depth + 1, maxDepth);
            linkedPages.push(linkedData);
        }
    }

    return {
        url,
        textContent: pageText,
        screenshotPath: `/screenshots/${screenshotName}`,
        linkedPages,
    };
};

export const processUrl = async (req, res) => {
    const { url, maxDepth = 0 } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'], // Optimized for server environments
        });
        const page = await browser.newPage();
        // Block unnecessary resources (images, fonts, stylesheets) for faster scraping
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const blockedResources = [];
            if (blockedResources.includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        // Start scraping from the main page
        const result = await scrapePage(page, url, 0, parseInt(maxDepth));

        await browser.close();

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error during deep scraping' });
    }
}