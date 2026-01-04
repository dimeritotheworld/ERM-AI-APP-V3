/**
 * Node.js Proxy Server for DeepSeek API
 * Handles CORS issues by proxying requests to the DeepSeek API
 * Also provides server-side PDF generation with Puppeteer
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { generatePDF } = require('./pdf-service');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for large HTML content
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from the parent directory
app.use(express.static(path.join(__dirname, '..')));

// DeepSeek API Proxy endpoint
app.post('/api/ai-proxy', async (req, res) => {
  try {
    const apiKey = req.headers.authorization?.replace('Bearer ', '') || req.body.api_key;

    if (!apiKey) {
      return res.status(401).json({ error: { message: 'API key is required' } });
    }

    // Remove api_key from body if present
    const requestBody = { ...req.body };
    delete requestBody.api_key;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('[Proxy Error]', error.message);
    res.status(500).json({ error: { message: 'Proxy error: ' + error.message } });
  }
});

// PDF Export endpoint - Server-side rendering with Puppeteer
app.post('/api/reports/export-pdf', async (req, res) => {
  try {
    const { html, title = 'report', options = {} } = req.body;

    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    console.log(`[PDF Export] Generating PDF for: ${title}`);
    console.log(`[PDF Export] HTML size: ${(html.length / 1024).toFixed(2)} KB`);

    // Generate PDF using Puppeteer
    const pdfBuffer = await generatePDF({
      html,
      title,
      pdfOptions: options
    });

    // Generate filename
    const filename = `${title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}.pdf`;

    // Send PDF as download - use res.end() for raw binary
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.end(Buffer.from(pdfBuffer));

    console.log(`[PDF Export] Success: ${filename} (${(pdfBuffer.length / 1024).toFixed(2)} KB)`);

  } catch (error) {
    console.error('[PDF Export] Error:', error.message);
    res.status(500).json({
      error: 'Failed to generate PDF',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve admin portal
app.get('/admin-portal', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin-portal', 'index.html'));
});

// Serve profile page
app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'profile.html'));
});

// Fallback to index.html for SPA routing (only for paths without file extensions)
app.get('*', (req, res, next) => {
  // If the request is for a file with an extension, let static middleware handle it
  if (path.extname(req.path)) {
    return next();
  }
  // Skip admin portal paths (they have their own index.html)
  if (req.path.startsWith('/admin-portal')) {
    return res.sendFile(path.join(__dirname, '..', 'admin-portal', 'index.html'));
  }
  // Otherwise, serve index.html for SPA routing
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  ERM Server running on port ${PORT}`);
  console.log(`  Open: http://localhost:${PORT}`);
  console.log(`========================================\n`);
});
