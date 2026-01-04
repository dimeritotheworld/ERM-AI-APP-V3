/**
 * PDF Generation Service using Puppeteer
 * Provides server-side PDF generation with full CSS support
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Generate PDF from HTML content using Puppeteer
 * @param {Object} options - PDF generation options
 * @param {string} options.html - Complete HTML document with styles
 * @param {string} options.title - Report title for filename
 * @param {Object} options.pdfOptions - PDF configuration
 * @returns {Promise<Buffer>} PDF buffer
 */
async function generatePDF(options) {
  const { html, title = 'report', pdfOptions = {} } = options;

  let browser = null;

  try {
    console.log('[PDF Service] Launching browser...');

    // Launch headless Chrome with Windows-compatible settings
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-extensions'
      ],
      // Don't use single-process on Windows - causes Target closed errors
      dumpio: false
    });

    console.log('[PDF Service] Creating new page...');
    const page = await browser.newPage();

    // Set viewport for consistent rendering
    await page.setViewport({
      width: 794,  // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
      deviceScaleFactor: 2 // High quality
    });

    console.log('[PDF Service] Setting HTML content...');
    await page.setContent(html, {
      waitUntil: ['load', 'networkidle0'], // Wait for all resources
      timeout: 30000
    });

    // Emulate print media for proper page break handling
    console.log('[PDF Service] Emulating print media...');
    await page.emulateMediaType('print');

    // Wait for fonts to be loaded
    console.log('[PDF Service] Waiting for fonts...');
    await page.evaluateHandle('document.fonts.ready');

    // Wait for all images to load
    console.log('[PDF Service] Waiting for images...');
    await page.evaluate(async () => {
      const images = Array.from(document.images);
      await Promise.all(images.map(img =>
        img.complete ? Promise.resolve() : new Promise(resolve => {
          img.onload = img.onerror = resolve;
        })
      ));
    });

    // Small delay for layout stability
    await new Promise(resolve => setTimeout(resolve, 100));

    console.log('[PDF Service] Generating PDF...');

    // Load watermark logo as base64 for embedding in footer
    let watermarkBase64 = '';
    try {
      const watermarkPath = path.join(__dirname, '..', 'assets', 'images', 'watermark-logo.png');
      if (fs.existsSync(watermarkPath)) {
        const watermarkBuffer = fs.readFileSync(watermarkPath);
        watermarkBase64 = `data:image/png;base64,${watermarkBuffer.toString('base64')}`;
        console.log('[PDF Service] Watermark logo loaded');
      } else {
        console.log('[PDF Service] Watermark logo not found at:', watermarkPath);
      }
    } catch (err) {
      console.log('[PDF Service] Could not load watermark:', err.message);
    }

    // Footer template with watermark logo (left) and page number (right)
    const footerTemplate = `
      <div style="width: 100%; font-size: 10px; font-family: 'Inter', Arial, sans-serif; display: flex; justify-content: space-between; align-items: center; padding: 0 20mm; box-sizing: border-box;">
        <div style="display: flex; align-items: center;">
          ${watermarkBase64 ? `<img src="${watermarkBase64}" style="height: 20px; opacity: 0.7;" />` : ''}
        </div>
        <div style="color: #6b7280;">
          | Page <span class="pageNumber"></span>
        </div>
      </div>
    `;

    // Default PDF options - MUST match CSS @page rules AND editor margins exactly
    // A4: 210mm x 297mm
    // Professional margins: 25mm top/bottom, 25mm left, 20mm right
    // Usable content height: 297mm - 25mm - 25mm = 247mm
    const defaultPdfOptions = {
      format: 'A4',
      printBackground: true,           // Preserve colors and backgrounds
      preferCSSPageSize: true,         // CRITICAL: Use CSS @page rules
      scale: 1,                        // CRITICAL: No scaling - exact 1:1
      margin: {
        top: '25mm',
        right: '20mm',
        bottom: '25mm',                // Must match CSS @page margin and editor
        left: '25mm'
      },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',   // Empty header
      footerTemplate: footerTemplate
    };

    // Merge with custom options
    const finalOptions = {
      ...defaultPdfOptions,
      ...pdfOptions
    };

    // Generate PDF
    const pdf = await page.pdf(finalOptions);

    console.log('[PDF Service] PDF generated successfully');
    console.log('[PDF Service] Size:', (pdf.length / 1024).toFixed(2), 'KB');

    return pdf;

  } catch (error) {
    console.error('[PDF Service] Error:', error.message);
    throw error;
  } finally {
    if (browser) {
      console.log('[PDF Service] Closing browser...');
      await browser.close();
    }
  }
}

module.exports = { generatePDF };
