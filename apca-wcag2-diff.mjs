import { APCAcontrast, sRGBtoY } from './apca-w3/src/apca-w3.js';
import {
  normalizeHex,
  wcagContrast,
  simulateColorBlindness,
  randomColorInRange,
  getRandomHexColor as randomHexColor,
} from './lib/contrast-utils.mjs';

// Parse color to the format expected by APCA
function parseColor(hex) {
  const normalizedHex = normalizeHex(hex);

  // Convert hex to RGBA array
  const r = parseInt(normalizedHex.slice(1, 3), 16);
  const g = parseInt(normalizedHex.slice(3, 5), 16);
  const b = parseInt(normalizedHex.slice(5, 7), 16);
  const rgba = [r, g, b, 1]; // APCA expects RGBA with alpha = 1

  // Convert to luminance using sRGBtoY
  return sRGBtoY(rgba);
}

// CLI arguments
const fgArg = process.argv.find(arg => arg.startsWith('--fg='));
const bgArg = process.argv.find(arg => arg.startsWith('--bg='));
const defaultFgArg = process.argv.find(arg => arg.startsWith('--default-fg='));
const defaultBgArg = process.argv.find(arg => arg.startsWith('--default-bg='));
const apcaThresholdArg = process.argv.find(arg => arg.startsWith('--apca-threshold='));
const wcagThresholdArg = process.argv.find(arg => arg.startsWith('--wcag-threshold='));
const colorRangeArg = process.argv.find(arg => arg.startsWith('--color-range='));
const colorBlindArg = process.argv.find(arg => arg.startsWith('--color-blind='));
const randomMode = process.argv.includes('--random');
const csvOutput = process.argv.includes('--csv');
const wcagFailsOnly = process.argv.includes('--wcag-fails');
const apcaFailsOnly = process.argv.includes('--apca-fails');
const bothPassOnly = process.argv.includes('--both-pass');
const debugMode = process.argv.includes('--debug');

const foregroundOverride = fgArg ? normalizeHex(fgArg.split('=')[1]) : null;
const backgroundOverride = bgArg ? normalizeHex(bgArg.split('=')[1]) : null;
const defaultForeground = defaultFgArg ? normalizeHex(defaultFgArg.split('=')[1]) : null;
const defaultBackground = defaultBgArg ? normalizeHex(defaultBgArg.split('=')[1]) : '#000000';
const apcaThreshold = apcaThresholdArg ? parseFloat(apcaThresholdArg.split('=')[1]) : 60;
const wcagThreshold = wcagThresholdArg ? parseFloat(wcagThresholdArg.split('=')[1]) : 4.5;
const colorRange = colorRangeArg ? colorRangeArg.split('=')[1].toLowerCase() : null;
const colorBlindType = colorBlindArg ? colorBlindArg.split('=')[1].toLowerCase() : null;

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
  --wcag-threshold=NUM Set WCAG contrast threshold (default: 4.5, options: 3.0, 4.5, 7.0)
  --color-range=RANGE  Generate colors within specific range (see Color Ranges below)
  --color-blind=TYPE   Simulate color blindness (protanopia, deuteranopia, tritanopia)
  --random             Generate completely random fg/bg combinations
  --wcag-fails         Show only combinations where WCAG passes but APCA fails
  --apca-fails         Show only combinations where APCA passes but WCAG fails
  --both-pass          Show only combinations where both WCAG and APCA pass
  --csv                Output results in CSV format
  --debug              Show debug information about all tested combinations
  --help, -h           Show this help message

Color Ranges:
  red, green, blue     Primary color ranges
  orange, purple       Secondary color ranges  
  yellow, cyan         Bright color ranges
  gray                 Grayscale colors
  warm, cool           Temperature-based ranges

Color Blindness Types:
  protanopia           Red-blind (missing L-cones, ~1% of men)
  deuteranopia         Green-blind (missing M-cones, ~1% of men)  
  tritanopia           Blue-blind (missing S-cones, ~0.003% of population)

WCAG Threshold Options:
  3.0   - AA Large text minimum (18pt+ regular, 14pt+ bold)
  4.5   - AA Normal text minimum (default)
  7.0   - AAA contrast standard

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
  node apca-wcag-diff.mjs --both-pass        # Show only combinations where both pass
  node apca-wcag-diff.mjs --color-range=green # Focus on green color combinations
  node apca-wcag-diff.mjs --wcag-threshold=3.0 # Use AA Large text threshold
  node apca-wcag-diff.mjs --apca-threshold=45 # Use threshold for small text
  node apca-wcag-diff.mjs --color-blind=protanopia # Test for red-blind users
  node apca-wcag-diff.mjs --color-range=warm --both-pass # Warm colors that pass both
  node apca-wcag-diff.mjs --csv              # Output as CSV file
`);
  process.exit(0);
}

const NUM_PAIRS = 1000;
// THRESHOLD_WCAG and THRESHOLD_APCA are now configurable via CLI args

// Store results for CSV output
const results = [];
let totalTested = 0;
let wcagPassApcaFail = 0;
let apcaPassWcagFail = 0;
let bothPass = 0;
let bothFail = 0;

// Output CSV header if needed
if (csvOutput) {
  if (colorBlindType) {
    console.log('Foreground,Background,WCAG_Score,WCAG_Pass,APCA_Score,APCA_Pass,ColorBlind_Fg,ColorBlind_Bg,ColorBlind_WCAG,ColorBlind_APCA,APCA_Link,Coolors_Link');
  } else {
    console.log('Foreground,Background,WCAG_Score,WCAG_Pass,APCA_Score,APCA_Pass,APCA_Link,Coolors_Link');
  }
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

  const wcagPass = wcag >= wcagThreshold;
  const apcaPass = Math.abs(apca) >= apcaThreshold;

  // Color blindness simulation if requested
  let cbFg, cbBg, cbWcag, cbApca, cbWcagPass, cbApcaPass;
  if (colorBlindType) {
    cbFg = simulateColorBlindness(fg, colorBlindType);
    cbBg = simulateColorBlindness(bg, colorBlindType);
    cbWcag = wcagContrast(cbFg, cbBg);
    
    try {
      const cbFgParsed = parseColor(cbFg);
      const cbBgParsed = parseColor(cbBg);
      cbApca = APCAcontrast(cbFgParsed, cbBgParsed);
    } catch (err) {
      cbApca = 0;
    }
    
    cbWcagPass = cbWcag >= wcagThreshold;
    cbApcaPass = Math.abs(cbApca) >= apcaThreshold;
  }

  // Count statistics
  totalTested++;
  if (wcagPass && !apcaPass) wcagPassApcaFail++;
  else if (!wcagPass && apcaPass) apcaPassWcagFail++;
  else if (wcagPass && apcaPass) bothPass++;
  else bothFail++;

  // Debug output
  if (debugMode && totalTested <= 10) {
    if (colorBlindType) {
      console.error(`DEBUG: ${fg} on ${bg} → WCAG: ${wcag.toFixed(2)} (${wcagPass ? 'PASS' : 'FAIL'}), APCA: ${apca.toFixed(1)} (${apcaPass ? 'PASS' : 'FAIL'})`);
      console.error(`  ${colorBlindType}: ${cbFg} on ${cbBg} → WCAG: ${cbWcag.toFixed(2)} (${cbWcagPass ? 'PASS' : 'FAIL'}), APCA: ${cbApca.toFixed(1)} (${cbApcaPass ? 'PASS' : 'FAIL'})`);
    } else {
      console.error(`DEBUG: ${fg} on ${bg} → WCAG: ${wcag.toFixed(2)} (${wcagPass ? 'PASS' : 'FAIL'}), APCA: ${apca.toFixed(1)} (${apcaPass ? 'PASS' : 'FAIL'})`);
    }
  }

  // Check if this combination matches our filter criteria
  const isDisagreement = wcagPass !== apcaPass;
  const isWcagFailsCase = wcagPass && !apcaPass; // WCAG passes, APCA fails
  const isApcaFailsCase = !wcagPass && apcaPass; // APCA passes, WCAG fails
  const isBothPassCase = wcagPass && apcaPass; // Both pass
  
  let shouldShow = false;
  if (wcagFailsOnly && isWcagFailsCase) shouldShow = true;
  else if (apcaFailsOnly && isApcaFailsCase) shouldShow = true;
  else if (bothPassOnly && isBothPassCase) shouldShow = true;
  else if (!wcagFailsOnly && !apcaFailsOnly && !bothPassOnly && isDisagreement) shouldShow = true;

  if (shouldShow) {
    // Remove # from hex codes for URLs
    const fgHex = fg.slice(1);
    const bgHex = bg.slice(1);
    
    if (csvOutput) {
      // CSV format
      if (colorBlindType) {
        console.log(`${fg},${bg},${wcag.toFixed(2)},${wcagPass},${apca.toFixed(1)},${apcaPass},${cbFg},${cbBg},${cbWcag.toFixed(2)},${cbApca.toFixed(1)},https://apcacontrast.com/?BG=${bgHex}&TXT=${fgHex},https://coolors.co/contrast-checker/${bgHex}-${fgHex}`);
      } else {
        console.log(`${fg},${bg},${wcag.toFixed(2)},${wcagPass},${apca.toFixed(1)},${apcaPass},https://apcacontrast.com/?BG=${bgHex}&TXT=${fgHex},https://coolors.co/contrast-checker/${bgHex}-${fgHex}`);
      }
    } else {
      // Terminal format with colors
      const fgColor = `\x1b[38;2;${parseInt(fg.slice(1,3), 16)};${parseInt(fg.slice(3,5), 16)};${parseInt(fg.slice(5,7), 16)}m`;
      const bgColor = `\x1b[48;2;${parseInt(bg.slice(1,3), 16)};${parseInt(bg.slice(3,5), 16)};${parseInt(bg.slice(5,7), 16)}m`;
      const reset = '\x1b[0m';
      
      console.log(`${fgColor}${bgColor}  ${fg} on ${bg}  ${reset} → WCAG: ${wcag.toFixed(2)} (${wcagPass ? 'PASS' : 'FAIL'}), APCA Lc: ${apca.toFixed(1)} (${apcaPass ? 'PASS' : 'FAIL'})`);
      
      if (colorBlindType) {
        const cbFgColor = `\x1b[38;2;${parseInt(cbFg.slice(1,3), 16)};${parseInt(cbFg.slice(3,5), 16)};${parseInt(cbFg.slice(5,7), 16)}m`;
        const cbBgColor = `\x1b[48;2;${parseInt(cbBg.slice(1,3), 16)};${parseInt(cbBg.slice(3,5), 16)};${parseInt(cbBg.slice(5,7), 16)}m`;
        console.log(`  ${colorBlindType}: ${cbFgColor}${cbBgColor}  ${cbFg} on ${cbBg}  ${reset} → WCAG: ${cbWcag.toFixed(2)} (${cbWcagPass ? 'PASS' : 'FAIL'}), APCA Lc: ${cbApca.toFixed(1)} (${cbApcaPass ? 'PASS' : 'FAIL'})`);
      }
      
      console.log(`  Test links:`);
      console.log(`    https://coolors.co/contrast-checker/${bgHex}-${fgHex}`);
      console.log(`    https://apcacontrast.com/?BG=${bgHex}&TXT=${fgHex}`);
      console.log('');
    }
  }
}

// Run comparisons
for (let i = 0; i < NUM_PAIRS; i++) {
  let fg, bg;
  
  if (randomMode) {
    // Completely random foreground and background
    fg = foregroundOverride || (colorRange ? randomColorInRange(colorRange) : randomHexColor());
    bg = backgroundOverride || (colorRange ? randomColorInRange(colorRange) : randomHexColor());
  } else {
    // Use default behavior: random fg with default/specified bg, or vice versa
    fg = foregroundOverride || defaultForeground || (colorRange ? randomColorInRange(colorRange) : randomHexColor());
    bg = backgroundOverride || (defaultForeground ? (colorRange ? randomColorInRange(colorRange) : randomHexColor()) : defaultBackground);
  }
  
  if (fg.toLowerCase() === bg.toLowerCase()) continue;
  testPair(fg, bg);
}

// Show statistics if debug mode
if (debugMode) {
  console.error(`\nDEBUG STATISTICS (${totalTested} combinations tested):`);
  console.error(`- WCAG threshold: ${wcagThreshold}`);
  console.error(`- APCA threshold: ${apcaThreshold}`);
  console.error(`- Color range: ${colorRange || 'all'}`);
  console.error(`- Color blindness: ${colorBlindType || 'none'}`);
  console.error(`- WCAG pass + APCA fail: ${wcagPassApcaFail}`);
  console.error(`- APCA pass + WCAG fail: ${apcaPassWcagFail}`);
  console.error(`- Both pass: ${bothPass}`);
  console.error(`- Both fail: ${bothFail}`);
}
