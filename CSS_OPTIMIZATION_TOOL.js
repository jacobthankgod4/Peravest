#!/usr/bin/env node

/**
 * PHASE 19: CSS OPTIMIZATION & MINIFICATION TOOL
 * 
 * Optimizes and minifies CSS for production deployment
 * - Minifies CSS (removes unnecessary whitespace, comments)
 * - Analyzes file sizes and compression
 * - Identifies optimization opportunities
 * - Generates performance metrics
 */

const fs = require('fs');
const path = require('path');

// ANSI Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Performance metrics tracking
const metrics = {
  totalFiles: 0,
  totalLineBefore: 0,
  totalLineSizeAfter: 0,
  compression: {
    files: [],
  },
};

/**
 * Minify CSS content
 */
function minifyCSS(content) {
  return content
    // Remove comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove excess whitespace
    .replace(/\s+/g, ' ')
    // Remove spaces around special characters
    .replace(/\s*([{};:,>+~])\s*/g, '$1')
    // Remove trailing semicolons before closing brace
    .replace(/;}/g, '}')
    // Trim leading/trailing whitespace
    .trim();
}

/**
 * Calculate gzip compression ratio
 */
function getCompressionRatio(original, minified) {
  // Rough estimation: gzip typically achieves 60-75% compression on text
  const gzipRatio = 0.70;
  const gzippedSize = Math.ceil(minified.length * gzipRatio);
  return {
    original: original.length,
    minified: minified.length,
    gzipped: gzippedSize,
    reduction: ((1 - minified.length / original.length) * 100).toFixed(2),
  };
}

/**
 * Format bytes for display
 */
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Analyze CSS for optimization opportunities
 */
function analyzeCSSOptimizations(content) {
  const opportunities = {
    duplicateSelectors: 0,
    vendorPrefixes: 0,
    unusedProperties: 0,
    fragmentedMedia: 0,
  };

  // Count duplicate selectors (simplified check)
  const selectorMatches = content.match(/[.#][\w-]+\s*{/g) || [];
  const selectorSet = new Set(selectorMatches);
  opportunities.duplicateSelectors = selectorMatches.length - selectorSet.size;

  // Count vendor prefixes
  opportunities.vendorPrefixes = (content.match(/-webkit-|-moz-|-ms-|-o-/g) || []).length;

  // Count media queries
  opportunities.fragmentedMedia = (content.match(/@media/g) || []).length;

  return opportunities;
}

/**
 * Main optimization function
 */
function optimizeCSS() {
  console.log(`\n${colors.cyan}${colors.bright}╔════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}║ PHASE 19: CSS OPTIMIZATION & MINIFICATION             ║${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}║ Production Build Preparation                          ║${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}╚════════════════════════════════════════════════════════╝${colors.reset}\n`);

  const stylesDir = './src/styles';

  // Check if styles directory exists
  if (!fs.existsSync(stylesDir)) {
    console.log(`${colors.red}✗ Error: ${stylesDir} directory not found${colors.reset}`);
    process.exit(1);
  }

  // Get all CSS files
  const cssFiles = fs.readdirSync(stylesDir).filter((file) => file.endsWith('.css'));

  if (cssFiles.length === 0) {
    console.log(`${colors.red}✗ No CSS files found in ${stylesDir}${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.cyan}STEP 1: CSS Minification${colors.reset}`);
  console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}\n`);

  let totalOriginalSize = 0;
  let totalMinifiedSize = 0;
  let totalGzippedSize = 0;

  cssFiles.forEach((file) => {
    const filePath = path.join(stylesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const minified = minifyCSS(content);
    const compression = getCompressionRatio(content, minified);

    totalOriginalSize += compression.original;
    totalMinifiedSize += compression.minified;
    totalGzippedSize += compression.gzipped;

    const reductionPercent = parseFloat(compression.reduction);
    const reductionColor = reductionPercent > 30 ? colors.green : reductionPercent > 15 ? colors.yellow : colors.dim;

    console.log(`${colors.green}✓${colors.reset} ${file}`);
    console.log(`  ${colors.dim}Original:${colors.reset} ${formatBytes(compression.original)}`);
    console.log(`  ${colors.dim}Minified:${colors.reset} ${formatBytes(compression.minified)}`);
    console.log(`  ${colors.dim}Gzipped:${colors.reset}  ${formatBytes(compression.gzipped)}`);
    console.log(`  ${reductionColor}Reduction: ${compression.reduction}%${colors.reset}\n`);

    // Store minified content
    metrics.compression.files.push({
      filename: file,
      original: compression.original,
      minified: compression.minified,
      gzipped: compression.gzipped,
      reduction: parseFloat(compression.reduction),
    });

    // Write minified file
    const minFilePath = path.join(stylesDir, file.replace('.css', '.min.css'));
    fs.writeFileSync(minFilePath, minified);
  });

  console.log(`${colors.cyan}STEP 2: CSS Analysis${colors.reset}`);
  console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}\n`);

  // Analyze each file
  let totalOpportunities = 0;
  cssFiles.forEach((file) => {
    const filePath = path.join(stylesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const opps = analyzeCSSOptimizations(content);

    const totalOpps = Object.values(opps).reduce((a, b) => a + b, 0);
    if (totalOpps > 0) {
      console.log(`${colors.yellow}⚠ ${file}${colors.reset}`);
      if (opps.duplicateSelectors > 0)
        console.log(`  ${colors.dim}Duplicate selectors: ${opps.duplicateSelectors}${colors.reset}`);
      if (opps.vendorPrefixes > 0) console.log(`  ${colors.dim}Vendor prefixes: ${opps.vendorPrefixes}${colors.reset}`);
      if (opps.fragmentedMedia > 0) console.log(`  ${colors.dim}Media queries: ${opps.fragmentedMedia}${colors.reset}`);
      console.log('');
      totalOpportunities += totalOpps;
    }
  });

  if (totalOpportunities === 0) {
    console.log(`${colors.green}✓ No optimization opportunities detected${colors.reset}\n`);
  }

  console.log(`${colors.cyan}STEP 3: Performance Metrics${colors.reset}`);
  console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}\n`);

  const totalReduction = ((1 - totalMinifiedSize / totalOriginalSize) * 100).toFixed(2);
  const gzipReduction = ((1 - totalGzippedSize / totalOriginalSize) * 100).toFixed(2);

  console.log(`${colors.bright}Development Build:${colors.reset}`);
  console.log(`  Total Size: ${formatBytes(totalOriginalSize)}`);
  console.log(`  Files: ${cssFiles.length}\n`);

  console.log(`${colors.bright}Production Build (Minified):${colors.reset}`);
  console.log(`  Total Size: ${formatBytes(totalMinifiedSize)}`);
  console.log(`  ${colors.green}Reduction: ${totalReduction}% smaller${colors.reset}\n`);

  console.log(`${colors.bright}Production Build (Gzipped):${colors.reset}`);
  console.log(`  Total Size: ${formatBytes(totalGzippedSize)}`);
  console.log(`  ${colors.green}Reduction: ${gzipReduction}% smaller${colors.reset}\n`);

  console.log(`${colors.cyan}STEP 4: Optimization Summary${colors.reset}`);
  console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}\n`);

  const optimizationScore = (totalReduction > 40 ? 'Excellent' : totalReduction > 30 ? 'Good' : 'Fair');
  const scoreColor = totalReduction > 40 ? colors.green : totalReduction > 30 ? colors.yellow : colors.yellow;

  console.log(`${scoreColor}Optimization Score: ${optimizationScore}${colors.reset}`);
  console.log(`${colors.dim}Based on ${totalReduction}% minification reduction${colors.reset}\n`);

  // Create optimization report
  const report = {
    timestamp: new Date().toISOString(),
    totalFiles: cssFiles.length,
    metrics: {
      original: totalOriginalSize,
      minified: totalMinifiedSize,
      gzipped: totalGzippedSize,
      reductionPercent: parseFloat(totalReduction),
      gzipReductionPercent: parseFloat(gzipReduction),
    },
    fileBreakdown: metrics.compression.files,
    recommendations: [
      'All minified files created in .min.css format',
      'Consider using minified files in production builds',
      'Enable gzip compression on web server (Apache/Nginx)',
      'Use CDN for static CSS asset delivery',
      `Estimated bandwidth savings: ${(totalGzippedSize / (1024)).toFixed(1)} KB per page load`,
    ],
  };

  // Save report
  fs.writeFileSync('PHASE_19_OPTIMIZATION_REPORT.json', JSON.stringify(report, null, 2));

  console.log(`${colors.green}✓ Minified files created:${colors.reset}`);
  cssFiles.forEach((file) => {
    console.log(`  ${colors.dim}${file.replace('.css', '.min.css')}${colors.reset}`);
  });
  console.log('');

  console.log(`${colors.cyan}RECOMMENDATIONS:${colors.reset}`);
  console.log(`  1. Update React build config to use minified CSS`);
  console.log(`  2. Enable gzip/brotli compression on server`);
  console.log(`  3. Configure CDN caching headers`);
  console.log(`  4. Measure Core Web Vitals after deployment`);
  console.log(`  5. Monitor CSS performance in production\n`);

  console.log(`${colors.green}════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}✓ PHASE 19: CSS OPTIMIZATION COMPLETE${colors.reset}`);
  console.log(`${colors.green}════════════════════════════════════════════════════════${colors.reset}\n`);

  console.log(`${colors.dim}Report saved to: PHASE_19_OPTIMIZATION_REPORT.json${colors.reset}\n`);
}

// Run optimization
optimizeCSS();
