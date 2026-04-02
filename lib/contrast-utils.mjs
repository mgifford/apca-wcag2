/**
 * contrast-utils.mjs
 *
 * Pure calculation utilities shared between the browser UI (script.js)
 * and the CLI tool (apca-wcag2-diff.mjs).
 *
 * All functions are pure (no DOM, no side-effects) and are exported
 * so they can be unit-tested independently.
 */

// ---------------------------------------------------------------------------
// APCA constants (APCA-W3 0.0.98G-4g)
// ---------------------------------------------------------------------------
const sRGBtrc   = 2.4;
const Rco       = 0.2126;
const Gco       = 0.7152;
const Bco       = 0.0722;
const blkThrs   = 0.022;
const blkClmp   = 1.414;
const scaleBoW  = 1.1;
const scaleWoB  = 1.1;
const sCAL      = 0.027;
const normBGExp = 0.56;
const normTXTExp = 0.57;
const revBGExp  = 0.62;
const revTXTExp = 0.65;

// ---------------------------------------------------------------------------
// Hex / color parsing
// ---------------------------------------------------------------------------

/**
 * Normalize a hex color string to 7-character #rrggbb form.
 * Handles missing '#', 3-digit shorthand, and is case-insensitive.
 * Returns the original value unchanged if it is falsy.
 *
 * @param {string} hex
 * @returns {string}
 */
export function normalizeHex(hex) {
    if (!hex) return hex;

    let normalized = hex.trim();

    if (!normalized.startsWith('#')) {
        normalized = '#' + normalized;
    }

    // 3-digit → 6-digit  (#abc → #aabbcc)
    if (normalized.length === 4) {
        normalized =
            '#' +
            normalized[1] + normalized[1] +
            normalized[2] + normalized[2] +
            normalized[3] + normalized[3];
    }

    return normalized;
}

/**
 * Convert a 6-digit hex color to an RGB object.
 * Accepts both 3-digit and 6-digit hex strings with or without '#'.
 * Returns {r:0, g:0, b:0} for invalid input.
 *
 * @param {string} hex
 * @returns {{r: number, g: number, b: number}}
 */
export function hexToRgb(hex) {
    const h = normalizeHex(hex);
    if (!h || !/^#[A-Fa-f0-9]{6}$/.test(h)) {
        return { r: 0, g: 0, b: 0 };
    }
    const c = parseInt(h.slice(1), 16);
    return { r: (c >> 16) & 255, g: (c >> 8) & 255, b: c & 255 };
}

// ---------------------------------------------------------------------------
// WCAG 2.x luminance and contrast
// ---------------------------------------------------------------------------

/**
 * Convert a single 0–255 channel value to linear light (WCAG 2.x formula).
 *
 * @param {number} C  Integer channel value 0–255
 * @returns {number}
 */
export function sRGBtoLinWCAG(C) {
    const c = C / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Calculate WCAG 2.x relative luminance for an RGB triple.
 *
 * @param {number} r  0–255
 * @param {number} g  0–255
 * @param {number} b  0–255
 * @returns {number}  Luminance in [0, 1]
 */
export function getLuminanceWCAG(r, g, b) {
    return (
        0.2126 * sRGBtoLinWCAG(r) +
        0.7152 * sRGBtoLinWCAG(g) +
        0.0722 * sRGBtoLinWCAG(b)
    );
}

/**
 * WCAG 2.x contrast ratio between two pre-computed luminance values.
 * The caller is responsible for passing them in the correct order or
 * ensuring the result is ≥ 1.
 *
 * Uses Math.floor to 2 decimal places to match standard tools (e.g. WebAIM).
 *
 * @param {number} L1  Higher luminance
 * @param {number} L2  Lower luminance
 * @returns {number}
 */
export function getWCAG2Contrast(L1, L2) {
    const ratio = (L1 + 0.05) / (L2 + 0.05);
    return Math.floor(ratio * 100) / 100;
}

/**
 * Compute WCAG 2.x contrast ratio between two hex colors.
 * Does NOT apply floor rounding (matches exact ratio).
 *
 * @param {string} fgHex
 * @param {string} bgHex
 * @returns {number}
 */
export function wcagContrast(fgHex, bgHex) {
    const fg = hexToRgb(fgHex);
    const bg = hexToRgb(bgHex);
    const L1 = getLuminanceWCAG(fg.r, fg.g, fg.b);
    const L2 = getLuminanceWCAG(bg.r, bg.g, bg.b);
    return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
}

// ---------------------------------------------------------------------------
// APCA contrast
// ---------------------------------------------------------------------------

/**
 * Convert an 0–255 RGB triple to APCA Y (linearized, with soft-clamp).
 *
 * @param {number} r  0–255
 * @param {number} g  0–255
 * @param {number} b  0–255
 * @returns {number}
 */
export function sRGBtoY(r, g, b) {
    const R = Math.pow(r / 255, sRGBtrc);
    const G = Math.pow(g / 255, sRGBtrc);
    const B = Math.pow(b / 255, sRGBtrc);
    let Ys = Rco * R + Gco * G + Bco * B;
    if (Ys < blkThrs) Ys = Ys + Math.pow(blkThrs - Ys, blkClmp);
    return Ys;
}

/**
 * Calculate APCA Lc contrast between a text (Yt) and background (Yb) color.
 *
 * @param {number} Yt  Text APCA Y
 * @param {number} Yb  Background APCA Y
 * @returns {number}   Signed Lc value (positive = light bg, negative = dark bg)
 */
export function getAPCAContrast(Yt, Yb) {
    if (Yb >= Yt) {
        const S = (Math.pow(Yb, normBGExp) - Math.pow(Yt, normTXTExp)) * scaleBoW;
        if (S < 0.1) return 0;
        return Math.round(S * 100 - sCAL);
    } else {
        const S = (Math.pow(Yb, revBGExp) - Math.pow(Yt, revTXTExp)) * scaleWoB;
        if (S > -0.1) return 0;
        return Math.round(S * 100 + sCAL);
    }
}

// ---------------------------------------------------------------------------
// Color range classification
// ---------------------------------------------------------------------------

/**
 * Classify a hex color into a named perceptual range.
 *
 * @param {string} hex
 * @returns {'red'|'orange'|'yellow'|'green'|'cyan'|'blue'|'purple'|'gray'|'any'}
 */
export function getColorRange(hex) {
    const { r, g, b } = hexToRgb(hex);
    const max  = Math.max(r, g, b);
    const min  = Math.min(r, g, b);
    const diff = max - min;

    if (diff < 30) return 'gray';

    if (max === r && max > g && max > b)
        return (g > b && g > r * 0.5) ? 'orange' : 'red';
    if (max === g && max > r && max > b)
        return (r > b) ? 'yellow' : 'green';
    if (max === b && max > r && max > g)
        return (r > g) ? 'purple' : 'blue';

    // Fallbacks
    if (r > 200 && g > 200) return 'yellow';
    if (g > 200 && b > 200) return 'cyan';
    return 'any';
}

// ---------------------------------------------------------------------------
// Combined result calculation
// ---------------------------------------------------------------------------

/**
 * Calculate both WCAG 2.x and APCA results for a foreground/background pair
 * against given thresholds, and classify the disagreement type.
 *
 * @param {string} fgHex
 * @param {string} bgHex
 * @param {number|string} wcagThresh  e.g. 4.5
 * @param {number|string} apcaThresh  e.g. 60
 * @returns {{
 *   fgHex: string, bgHex: string,
 *   wcagRatio: string, wcagPass: boolean,
 *   apcaScore: string, apcaPass: boolean,
 *   disagreementType: 'both_pass'|'both_fail'|'wcag_pass_apca_fail'|'apca_pass_wcag_fail',
 *   fgRange: string
 * }}
 */
export function calculateResult(fgHex, bgHex, wcagThresh, apcaThresh) {
    const fgRgb = hexToRgb(fgHex);
    const bgRgb = hexToRgb(bgHex);

    const Ltext_wcag = getLuminanceWCAG(fgRgb.r, fgRgb.g, fgRgb.b);
    const Lbg_wcag   = getLuminanceWCAG(bgRgb.r, bgRgb.g, bgRgb.b);
    const wcagRatio  = getWCAG2Contrast(
        Math.max(Ltext_wcag, Lbg_wcag),
        Math.min(Ltext_wcag, Lbg_wcag)
    );
    const wcagPass = wcagRatio >= parseFloat(wcagThresh);

    const Ltext_apca = sRGBtoY(fgRgb.r, fgRgb.g, fgRgb.b);
    const Lbg_apca   = sRGBtoY(bgRgb.r, bgRgb.g, bgRgb.b);
    const apcaScore  = Math.abs(getAPCAContrast(Ltext_apca, Lbg_apca));
    const apcaPass   = apcaScore >= parseFloat(apcaThresh);

    let disagreementType = 'both_fail';
    if (wcagPass && apcaPass)   disagreementType = 'both_pass';
    else if (wcagPass && !apcaPass) disagreementType = 'wcag_pass_apca_fail';
    else if (!wcagPass && apcaPass) disagreementType = 'apca_pass_wcag_fail';

    return {
        fgHex,
        bgHex,
        wcagRatio: wcagRatio.toFixed(2),
        wcagPass,
        apcaScore: apcaScore.toFixed(1),
        apcaPass,
        disagreementType,
        fgRange: getColorRange(fgHex),
    };
}

// ---------------------------------------------------------------------------
// Color blindness simulation
// ---------------------------------------------------------------------------

/**
 * Color blindness simulation matrices.
 * Based on Brettel, Viénot and Mollon JOSA 14/10 1997
 * and Machado, Oliveira and Fernandes IEEE CG&A 29/4 2009.
 */
export const colorBlindMatrices = {
    protanopia: [
        [0.567, 0.433, 0.000],
        [0.558, 0.442, 0.000],
        [0.000, 0.242, 0.758],
    ],
    deuteranopia: [
        [0.625, 0.375, 0.000],
        [0.700, 0.300, 0.000],
        [0.000, 0.300, 0.700],
    ],
    tritanopia: [
        [0.950, 0.050, 0.000],
        [0.000, 0.433, 0.567],
        [0.000, 0.475, 0.525],
    ],
};

/**
 * Simulate color blindness for a 6-digit hex color.
 * The input hex must already be in #rrggbb format (no 3-digit shorthand).
 *
 * @param {string} hex  6-digit hex color (#rrggbb)
 * @param {'protanopia'|'deuteranopia'|'tritanopia'} type
 * @returns {string}    Simulated hex color, or original if type is unknown
 */
export function simulateColorBlindness(hex, type) {
    if (!type || !colorBlindMatrices[type]) return hex;

    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const m = colorBlindMatrices[type];

    const newR = m[0][0] * r + m[0][1] * g + m[0][2] * b;
    const newG = m[1][0] * r + m[1][1] * g + m[1][2] * b;
    const newB = m[2][0] * r + m[2][1] * g + m[2][2] * b;

    const toHex = (val) =>
        Math.round(Math.max(0, Math.min(255, val * 255)))
            .toString(16)
            .padStart(2, '0');

    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

// ---------------------------------------------------------------------------
// Random color generation
// ---------------------------------------------------------------------------

/**
 * Generate a random 6-digit hex color.
 *
 * @returns {string}
 */
export function getRandomHexColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

/**
 * Generate a random hex color within a named perceptual range.
 * Falls back to a fully random color for unknown ranges.
 *
 * @param {string} range
 * @returns {string}
 */
export function randomColorInRange(range) {
    if (!range) return getRandomHexColor();

    let r, g, b;

    switch (range) {
        case 'red':
            r = Math.floor(Math.random() * 256);
            g = Math.floor(Math.random() * 128);
            b = Math.floor(Math.random() * 128);
            break;
        case 'green':
            r = Math.floor(Math.random() * 128);
            g = Math.floor(Math.random() * 256);
            b = Math.floor(Math.random() * 128);
            break;
        case 'blue':
            r = Math.floor(Math.random() * 128);
            g = Math.floor(Math.random() * 128);
            b = Math.floor(Math.random() * 256);
            break;
        case 'orange':
            r = Math.floor(200 + Math.random() * 56);
            g = Math.floor(100 + Math.random() * 156);
            b = Math.floor(Math.random() * 100);
            break;
        case 'purple':
            r = Math.floor(128 + Math.random() * 128);
            g = Math.floor(Math.random() * 128);
            b = Math.floor(128 + Math.random() * 128);
            break;
        case 'yellow':
            r = Math.floor(200 + Math.random() * 56);
            g = Math.floor(200 + Math.random() * 56);
            b = Math.floor(Math.random() * 100);
            break;
        case 'cyan':
            r = Math.floor(Math.random() * 128);
            g = Math.floor(128 + Math.random() * 128);
            b = Math.floor(128 + Math.random() * 128);
            break;
        case 'gray': {
            const grayValue = Math.floor(Math.random() * 256);
            r = g = b = grayValue;
            break;
        }
        case 'warm':
            r = Math.floor(150 + Math.random() * 106);
            g = Math.floor(100 + Math.random() * 156);
            b = Math.floor(Math.random() * 150);
            break;
        case 'cool':
            r = Math.floor(Math.random() * 150);
            g = Math.floor(100 + Math.random() * 156);
            b = Math.floor(150 + Math.random() * 106);
            break;
        default:
            return getRandomHexColor();
    }

    return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}
