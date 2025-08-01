import { APCAcontrast, sRGBtoY } from './apca-w3/src/apca-w3.js';

// WCAG 2.x contrast ratio function
function wcagContrast(fgHex, bgHex) {
  const luminance = (hex) => {
    // Normalize hex format first
    let normalizedHex = hex;
    if (!normalizedHex.startsWith('#')) {
      normalizedHex = '#' + normalizedHex;
    }
    if (normalizedHex.length === 4) {
      normalizedHex = '#' + normalizedHex[1] + normalizedHex[1] + normalizedHex[2] + normalizedHex[2] + normalizedHex[3] + normalizedHex[3];
    }
    
    const [r, g, b] = [1, 3, 5].map(i => parseInt(normalizedHex.slice(i, i + 2), 16) / 255);
    const toLinear = c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    const [rl, gl, bl] = [r, g, b].map(toLinear);
    return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
  };
  const L1 = luminance(fgHex);
  const L2 = luminance(bgHex);
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
}

// Parse color to the format expected by APCA
function parseColor(hex) {
  // Normalize hex format: ensure it starts with # and is 6 digits
  let normalizedHex = hex;
  
  // Add # if missing
  if (!normalizedHex.startsWith('#')) {
    normalizedHex = '#' + normalizedHex;
  }
  
  // Convert 3-digit hex to 6-digit hex (e.g., #fff -> #ffffff)
  if (normalizedHex.length === 4) {
    normalizedHex = '#' + normalizedHex[1] + normalizedHex[1] + normalizedHex[2] + normalizedHex[2] + normalizedHex[3] + normalizedHex[3];
  }
  
  // Convert hex to RGBA array
  const r = parseInt(normalizedHex.slice(1, 3), 16);
  const g = parseInt(normalizedHex.slice(3, 5), 16);
  const b = parseInt(normalizedHex.slice(5, 7), 16);
  const rgba = [r, g, b, 1]; // APCA expects RGBA with alpha = 1
  
  // Convert to luminance using sRGBtoY
  return sRGBtoY(rgba);
}

// Random hex color generator
function randomHexColor() {
  const rand = () => Math.floor(Math.random() * 256);
  return `#${[rand(), rand(), rand()].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

// Normalize hex color format
function normalizeHex(hex) {
  if (!hex) return hex;
  
  let normalized = hex;
  
  // Add # if missing
  if (!normalized.startsWith('#')) {
    normalized = '#' + normalized;
  }
  
  // Convert 3-digit hex to 6-digit hex (e.g., #fff -> #ffffff)
  if (normalized.length === 4) {
    normalized = '#' + normalized[1] + normalized[1] + normalized[2] + normalized[2] + normalized[3] + normalized[3];
  }
  
  return normalized;
}

// CLI arguments
const fgArg = process.argv.find(arg => arg.startsWith('--fg='));
const bgArg = process.argv.find(arg => arg.startsWith('--bg='));
const defaultFgArg = process.argv.find(arg => arg.startsWith('--default-fg='));
const defaultBgArg = process.argv.find(arg => arg.startsWith('--default-bg='));
const apcaThresholdArg = process.argv.find(arg => arg.startsWith('--apca-threshold='));
const randomMode = process.argv.includes('--random');
const csvOutput = process.argv.includes('--csv');
const wcagFailsOnly = process.argv.includes('--wcag-fails');
const apcaFailsOnly = process.argv.includes('--apca-fails');
const debugMode = process.argv.includes('--debug');

const foregroundOverride = fgArg ? normalizeHex(fgArg.split('=')[1]) : null;
const backgroundOverride = bgArg ? normalizeHex(bgArg.split('=')[1]) : null;
const defaultForeground = defaultFgArg ? normalizeHex(defaultFgArg.split('=')[1]) : null;
const defaultBackground = defaultBgArg ? normalizeHex(defaultBgArg.split('=')[1]) : '#000000';
const apcaThreshold = apcaThresholdArg ? parseFloat(apcaThresholdArg.split('=')[1]) : 60;

// Show usage if help is requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Usage: node apca-wcag-diff.mjs [options]

Options:
  --fg=COLOR           Force foreground color (e.g., --fg=#ff0000)
  --bg=COLOR           Force background color (e.g., --bg=#ffffff)
  --default-fg=COLOR   Set default foreground color for random combinations
  --default-bg=COLOR   Set default background color (default: #000000)
  --apca-threshold=NUM Set APCA Lc threshold (default: 60, normal text minimum)
  --random             Generate completely random fg/bg combinations
  --wcag-fails         Show only combinations where WCAG passes but APCA fails
  --apca-fails         Show only combinations where APCA passes but WCAG fails
  --csv                Output results in CSV format
  --debug              Show debug information about all tested combinations
  --help, -h           Show this help message

APCA Threshold Guidelines:
  15   - Large text (24px+ regular, 18.7px+ bold)
  30   - Medium text (18px+ regular, 14px+ bold)  
  45   - Small text (16px regular, 12px+ bold)
  60   - Normal body text (default, 14-16px regular)
  75   - Small body text (12-14px regular)
  90   - Very small text (under 12px)

Examples:
  node apca-wcag-diff.mjs                    # Random fg on black bg (all disagreements)
  node apca-wcag-diff.mjs --wcag-fails       # Show only WCAG pass + APCA fail cases
  node apca-wcag-diff.mjs --apca-fails       # Show only APCA pass + WCAG fail cases
  node apca-wcag-diff.mjs --apca-threshold=45 # Use threshold for small text
  node apca-wcag-diff.mjs --csv              # Output as CSV file
  node apca-wcag-diff.mjs --random --csv     # Random combinations as CSV
`);
  process.exit(0);
}

const NUM_PAIRS = 1000;
const THRESHOLD_WCAG = 4.5;
// THRESHOLD_APCA is now configurable via --apca-threshold, defaults to 60

// Store results for CSV output
const results = [];
let totalTested = 0;
let wcagPassApcaFail = 0;
let apcaPassWcagFail = 0;
let bothPass = 0;
let bothFail = 0;

// Output CSV header if needed
if (csvOutput) {
  console.log('Foreground,Background,WCAG_Score,WCAG_Pass,APCA_Score,APCA_Pass,APCA_Link,Coolors_Link');
}

function testPair(fg, bg) {
  const wcag = wcagContrast(fg, bg);
  let apca;

  try {
    const fgParsed = parseColor(fg);
    const bgParsed = parseColor(bg);
    apca = APCAcontrast(fgParsed, bgParsed);
  } catch (err) {
    console.error(`Error parsing colors: ${fg} on ${bg} — ${err.message}`);
    return;
  }

  const wcagPass = wcag >= THRESHOLD_WCAG;
  const apcaPass = Math.abs(apca) >= apcaThreshold;

  // Count statistics
  totalTested++;
  if (wcagPass && !apcaPass) wcagPassApcaFail++;
  else if (!wcagPass && apcaPass) apcaPassWcagFail++;
  else if (wcagPass && apcaPass) bothPass++;
  else bothFail++;

  // Debug output
  if (debugMode && totalTested <= 10) {
    console.error(`DEBUG: ${fg} on ${bg} → WCAG: ${wcag.toFixed(2)} (${wcagPass ? 'PASS' : 'FAIL'}), APCA: ${apca.toFixed(1)} (${apcaPass ? 'PASS' : 'FAIL'})`);
  }

  // Check if this combination matches our filter criteria
  const isDisagreement = wcagPass !== apcaPass;
  const isWcagFailsCase = wcagPass && !apcaPass; // WCAG passes, APCA fails
  const isApcaFailsCase = !wcagPass && apcaPass; // APCA passes, WCAG fails
  
  let shouldShow = false;
  if (wcagFailsOnly && isWcagFailsCase) shouldShow = true;
  else if (apcaFailsOnly && isApcaFailsCase) shouldShow = true;
  else if (!wcagFailsOnly && !apcaFailsOnly && isDisagreement) shouldShow = true;

  if (shouldShow) {
    // Remove # from hex codes for URLs
    const fgHex = fg.slice(1);
    const bgHex = bg.slice(1);
    
    if (csvOutput) {
      // CSV format
      console.log(`${fg},${bg},${wcag.toFixed(2)},${wcagPass},${apca.toFixed(1)},${apcaPass},https://apcacontrast.com/?BG=${bgHex}&TXT=${fgHex},https://coolors.co/contrast-checker/${bgHex}-${fgHex}`);
    } else {
      // Terminal format with colors
      const fgColor = `\x1b[38;2;${parseInt(fg.slice(1,3), 16)};${parseInt(fg.slice(3,5), 16)};${parseInt(fg.slice(5,7), 16)}m`;
      const bgColor = `\x1b[48;2;${parseInt(bg.slice(1,3), 16)};${parseInt(bg.slice(3,5), 16)};${parseInt(bg.slice(5,7), 16)}m`;
      const reset = '\x1b[0m';
      
      console.log(`${fgColor}${bgColor}  ${fg} on ${bg}  ${reset} → WCAG: ${wcag.toFixed(2)} (${wcagPass ? 'PASS' : 'FAIL'}), APCA Lc: ${apca.toFixed(1)} (${apcaPass ? 'PASS' : 'FAIL'})`);
      console.log(`  Test links:`);
      console.log(`    https://apcacontrast.com/?BG=${bgHex}&TXT=${fgHex}`);
      console.log(`    https://coolors.co/contrast-checker/${bgHex}-${fgHex}`);
      console.log('');
    }
  }
}

// Run comparisons
for (let i = 0; i < NUM_PAIRS; i++) {
  let fg, bg;
  
  if (randomMode) {
    // Completely random foreground and background
    fg = foregroundOverride || randomHexColor();
    bg = backgroundOverride || randomHexColor();
  } else {
    // Use default behavior: random fg with default/specified bg, or vice versa
    fg = foregroundOverride || defaultForeground || randomHexColor();
    bg = backgroundOverride || (defaultForeground ? randomHexColor() : defaultBackground);
  }
  
  if (fg.toLowerCase() === bg.toLowerCase()) continue;
  testPair(fg, bg);
}

// Show statistics if debug mode
if (debugMode) {
  console.error(`\nDEBUG STATISTICS (${totalTested} combinations tested):`);
  console.error(`- WCAG threshold: ${THRESHOLD_WCAG}`);
  console.error(`- APCA threshold: ${apcaThreshold}`);
  console.error(`- WCAG pass + APCA fail: ${wcagPassApcaFail}`);
  console.error(`- APCA pass + WCAG fail: ${apcaPassWcagFail}`);
  console.error(`- Both pass: ${bothPass}`);
  console.error(`- Both fail: ${bothFail}`);
}
