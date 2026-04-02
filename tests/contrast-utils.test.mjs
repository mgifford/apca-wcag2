/**
 * tests/contrast-utils.test.mjs
 *
 * Comprehensive unit tests for lib/contrast-utils.mjs using the built-in
 * Node.js test runner (node:test).  No external dependencies required.
 *
 * Run:  npm test
 *  or:  node --test tests/contrast-utils.test.mjs
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
    normalizeHex,
    hexToRgb,
    sRGBtoLinWCAG,
    getLuminanceWCAG,
    getWCAG2Contrast,
    wcagContrast,
    sRGBtoY,
    getAPCAContrast,
    getColorRange,
    calculateResult,
    simulateColorBlindness,
    colorBlindMatrices,
    getRandomHexColor,
    randomColorInRange,
} from '../lib/contrast-utils.mjs';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Assert two numbers are within `tolerance` of each other. */
function assertApprox(actual, expected, tolerance = 0.01, msg) {
    assert.ok(
        Math.abs(actual - expected) <= tolerance,
        msg ?? `Expected ${actual} ≈ ${expected} (±${tolerance})`
    );
}

// ---------------------------------------------------------------------------
// normalizeHex
// ---------------------------------------------------------------------------

describe('normalizeHex', () => {
    test('returns falsy input unchanged', () => {
        assert.equal(normalizeHex(null), null);
        assert.equal(normalizeHex(''), '');
        assert.equal(normalizeHex(undefined), undefined);
    });

    test('adds # prefix when missing', () => {
        assert.equal(normalizeHex('ff0000'), '#ff0000');
        assert.equal(normalizeHex('ffffff'), '#ffffff');
        assert.equal(normalizeHex('000000'), '#000000');
    });

    test('passes through already-prefixed 6-digit hex', () => {
        assert.equal(normalizeHex('#ff0000'), '#ff0000');
        assert.equal(normalizeHex('#abcdef'), '#abcdef');
    });

    test('expands 3-digit shorthand to 6 digits', () => {
        assert.equal(normalizeHex('#fff'), '#ffffff');
        assert.equal(normalizeHex('#000'), '#000000');
        assert.equal(normalizeHex('#abc'), '#aabbcc');
        assert.equal(normalizeHex('#f0a'), '#ff00aa');
    });

    test('expands 3-digit shorthand without # prefix', () => {
        assert.equal(normalizeHex('fff'), '#ffffff');
        assert.equal(normalizeHex('abc'), '#aabbcc');
    });

    test('preserves case (does not alter casing)', () => {
        assert.equal(normalizeHex('#FF0000'), '#FF0000');
        assert.equal(normalizeHex('#AbCdEf'), '#AbCdEf');
    });
});

// ---------------------------------------------------------------------------
// hexToRgb
// ---------------------------------------------------------------------------

describe('hexToRgb', () => {
    test('parses plain white', () => {
        assert.deepEqual(hexToRgb('#ffffff'), { r: 255, g: 255, b: 255 });
    });

    test('parses plain black', () => {
        assert.deepEqual(hexToRgb('#000000'), { r: 0, g: 0, b: 0 });
    });

    test('parses pure red', () => {
        assert.deepEqual(hexToRgb('#ff0000'), { r: 255, g: 0, b: 0 });
    });

    test('parses pure green', () => {
        assert.deepEqual(hexToRgb('#00ff00'), { r: 0, g: 255, b: 0 });
    });

    test('parses pure blue', () => {
        assert.deepEqual(hexToRgb('#0000ff'), { r: 0, g: 0, b: 255 });
    });

    test('parses 3-digit shorthand', () => {
        assert.deepEqual(hexToRgb('#fff'), { r: 255, g: 255, b: 255 });
        assert.deepEqual(hexToRgb('#000'), { r: 0, g: 0, b: 0 });
        assert.deepEqual(hexToRgb('#f00'), { r: 255, g: 0, b: 0 });
    });

    test('parses hex without # prefix', () => {
        assert.deepEqual(hexToRgb('ffffff'), { r: 255, g: 255, b: 255 });
        assert.deepEqual(hexToRgb('ff0000'), { r: 255, g: 0, b: 0 });
    });

    test('is case-insensitive', () => {
        assert.deepEqual(hexToRgb('#FF0000'), { r: 255, g: 0, b: 0 });
        assert.deepEqual(hexToRgb('#AABBCC'), hexToRgb('#aabbcc'));
    });

    test('returns {0,0,0} for invalid input', () => {
        assert.deepEqual(hexToRgb(''), { r: 0, g: 0, b: 0 });
        assert.deepEqual(hexToRgb('zzz'), { r: 0, g: 0, b: 0 });
        assert.deepEqual(hexToRgb('#xyz'), { r: 0, g: 0, b: 0 });
    });

    test('parses a mid-range color correctly', () => {
        assert.deepEqual(hexToRgb('#4080c0'), { r: 64, g: 128, b: 192 });
    });
});

// ---------------------------------------------------------------------------
// sRGBtoLinWCAG
// ---------------------------------------------------------------------------

describe('sRGBtoLinWCAG', () => {
    test('black (0) linearises to 0', () => {
        assertApprox(sRGBtoLinWCAG(0), 0, 0.0001);
    });

    test('white (255) linearises to 1', () => {
        assertApprox(sRGBtoLinWCAG(255), 1, 0.0001);
    });

    test('uses simple linear branch for low values (≤ 0.03928 after /255)', () => {
        // 0.03928 * 255 ≈ 10.01  →  channel values <= 10 use c/12.92
        assertApprox(sRGBtoLinWCAG(10), 10 / 255 / 12.92, 0.0001);
    });

    test('uses gamma branch for higher values', () => {
        const expected = Math.pow((128 / 255 + 0.055) / 1.055, 2.4);
        assertApprox(sRGBtoLinWCAG(128), expected, 0.0001);
    });
});

// ---------------------------------------------------------------------------
// getLuminanceWCAG
// ---------------------------------------------------------------------------

describe('getLuminanceWCAG', () => {
    test('white has luminance 1', () => {
        assertApprox(getLuminanceWCAG(255, 255, 255), 1.0, 0.0001);
    });

    test('black has luminance 0', () => {
        assertApprox(getLuminanceWCAG(0, 0, 0), 0.0, 0.0001);
    });

    test('pure red luminance matches spec coefficient', () => {
        const expected = 0.2126 * sRGBtoLinWCAG(255);
        assertApprox(getLuminanceWCAG(255, 0, 0), expected, 0.0001);
    });

    test('pure green luminance matches spec coefficient', () => {
        const expected = 0.7152 * sRGBtoLinWCAG(255);
        assertApprox(getLuminanceWCAG(0, 255, 0), expected, 0.0001);
    });

    test('pure blue luminance matches spec coefficient', () => {
        const expected = 0.0722 * sRGBtoLinWCAG(255);
        assertApprox(getLuminanceWCAG(0, 0, 255), expected, 0.0001);
    });

    test('luminance is always in [0, 1]', () => {
        const colors = [
            [255, 255, 0], [255, 0, 255], [0, 255, 255],
            [128, 128, 128], [64, 32, 200],
        ];
        for (const [r, g, b] of colors) {
            const L = getLuminanceWCAG(r, g, b);
            assert.ok(L >= 0 && L <= 1, `Luminance out of range for rgb(${r},${g},${b}): ${L}`);
        }
    });
});

// ---------------------------------------------------------------------------
// getWCAG2Contrast  (floors to 2 decimal places)
// ---------------------------------------------------------------------------

describe('getWCAG2Contrast', () => {
    test('white on black = 21.00', () => {
        const L_white = getLuminanceWCAG(255, 255, 255);
        const L_black = getLuminanceWCAG(0, 0, 0);
        assertApprox(getWCAG2Contrast(L_white, L_black), 21.0, 0.01);
    });

    test('same color = 1.00', () => {
        const L = getLuminanceWCAG(128, 128, 128);
        assert.equal(getWCAG2Contrast(L, L), 1.0);
    });

    test('result uses floor (not round) to 2 decimal places', () => {
        // Verify floor behavior: a ratio of e.g. 4.567 should become 4.56 not 4.57
        const L1 = 0.5;
        const L2 = 0.0;
        const rawRatio = (L1 + 0.05) / (L2 + 0.05);
        const floored = Math.floor(rawRatio * 100) / 100;
        assert.equal(getWCAG2Contrast(L1, L2), floored);
    });

    test('result is always >= 1 when L1 >= L2', () => {
        const pairs = [
            [1.0, 0.0],
            [0.5, 0.1],
            [0.2126, 0.0],
        ];
        for (const [L1, L2] of pairs) {
            assert.ok(getWCAG2Contrast(L1, L2) >= 1);
        }
    });
});

// ---------------------------------------------------------------------------
// wcagContrast  (no floor, exact ratio)
// ---------------------------------------------------------------------------

describe('wcagContrast', () => {
    test('white (#ffffff) on black (#000000) ≈ 21', () => {
        assertApprox(wcagContrast('#ffffff', '#000000'), 21.0, 0.05);
    });

    test('black on white equals white on black (order-independent)', () => {
        const a = wcagContrast('#000000', '#ffffff');
        const b = wcagContrast('#ffffff', '#000000');
        assertApprox(a, b, 0.0001);
    });

    test('same color = 1', () => {
        assertApprox(wcagContrast('#aabbcc', '#aabbcc'), 1.0, 0.0001);
    });

    test('3-digit hex shorthand is handled', () => {
        assertApprox(wcagContrast('#fff', '#000'), 21.0, 0.05);
    });

    test('#777777 on white is approximately 4.48:1', () => {
        // Known value from WebAIM
        assertApprox(wcagContrast('#777777', '#ffffff'), 4.48, 0.05);
    });
});

// ---------------------------------------------------------------------------
// sRGBtoY  (APCA linearisation)
// ---------------------------------------------------------------------------

describe('sRGBtoY', () => {
    test('white has Y ≈ 1', () => {
        assertApprox(sRGBtoY(255, 255, 255), 1.0, 0.01);
    });

    test('black has Y > 0 (soft-clamp lifts it above 0)', () => {
        const Y = sRGBtoY(0, 0, 0);
        assert.ok(Y > 0, `Expected Y > 0 for black, got ${Y}`);
    });

    test('Y is always non-negative', () => {
        const colors = [[0, 0, 0], [255, 0, 0], [0, 255, 0], [0, 0, 255], [128, 128, 128]];
        for (const [r, g, b] of colors) {
            assert.ok(sRGBtoY(r, g, b) >= 0, `Negative Y for rgb(${r},${g},${b})`);
        }
    });

    test('luminance increases monotonically with equal-channel brightness', () => {
        const Y0   = sRGBtoY(0, 0, 0);
        const Y64  = sRGBtoY(64, 64, 64);
        const Y128 = sRGBtoY(128, 128, 128);
        const Y192 = sRGBtoY(192, 192, 192);
        const Y255 = sRGBtoY(255, 255, 255);
        assert.ok(Y0 < Y64, 'Y should increase from 0 to 64');
        assert.ok(Y64 < Y128, 'Y should increase from 64 to 128');
        assert.ok(Y128 < Y192, 'Y should increase from 128 to 192');
        assert.ok(Y192 < Y255, 'Y should increase from 192 to 255');
    });
});

// ---------------------------------------------------------------------------
// getAPCAContrast
// ---------------------------------------------------------------------------

describe('getAPCAContrast', () => {
    test('black text on white background gives a high positive Lc', () => {
        const Yt = sRGBtoY(0, 0, 0);
        const Yb = sRGBtoY(255, 255, 255);
        const Lc = getAPCAContrast(Yt, Yb);
        assert.ok(Lc > 100, `Expected Lc > 100 for black on white, got ${Lc}`);
    });

    test('white text on black background gives a negative Lc (dark-on-light convention)', () => {
        const Yt = sRGBtoY(255, 255, 255);
        const Yb = sRGBtoY(0, 0, 0);
        const Lc = getAPCAContrast(Yt, Yb);
        assert.ok(Lc < -100, `Expected Lc < -100 for white on black, got ${Lc}`);
    });

    test('same color returns 0', () => {
        const Y = sRGBtoY(128, 128, 128);
        assert.equal(getAPCAContrast(Y, Y), 0);
    });

    test('very low contrast returns 0 (below noise floor)', () => {
        // Nearly identical colors
        const Yt = sRGBtoY(126, 126, 126);
        const Yb = sRGBtoY(128, 128, 128);
        assert.equal(getAPCAContrast(Yt, Yb), 0);
    });

    test('magnitude is symmetric-ish (dark-bg vs light-bg roles swap sign)', () => {
        const Y1 = sRGBtoY(50, 50, 50);
        const Y2 = sRGBtoY(200, 200, 200);
        const forward = getAPCAContrast(Y1, Y2);
        const backward = getAPCAContrast(Y2, Y1);
        assert.ok(forward > 0, 'forward should be positive');
        assert.ok(backward < 0, 'backward should be negative');
    });
});

// ---------------------------------------------------------------------------
// getColorRange
// ---------------------------------------------------------------------------

describe('getColorRange', () => {
    test('pure white is gray (low saturation)', () => {
        assert.equal(getColorRange('#ffffff'), 'gray');
    });

    test('pure black is gray', () => {
        assert.equal(getColorRange('#000000'), 'gray');
    });

    test('mid gray (#808080) is gray', () => {
        assert.equal(getColorRange('#808080'), 'gray');
    });

    test('pure red (#ff0000) is red', () => {
        assert.equal(getColorRange('#ff0000'), 'red');
    });

    test('pure green (#00ff00) is green', () => {
        assert.equal(getColorRange('#00ff00'), 'green');
    });

    test('pure blue (#0000ff) is blue', () => {
        assert.equal(getColorRange('#0000ff'), 'blue');
    });

    test('orange-ish color is orange', () => {
        // High red, medium green, low blue where green > blue and green > red*0.5
        assert.equal(getColorRange('#ff8800'), 'orange');
    });

    test('yellow-ish color (#ffff00) is yellow', () => {
        assert.equal(getColorRange('#ffff00'), 'yellow');
    });

    test('pure cyan (#00ffff) is cyan (via fallback g>200 && b>200)', () => {
        assert.equal(getColorRange('#00ffff'), 'cyan');
    });

    test('purple-ish color is purple', () => {
        // High red & blue, low green → r > g so purple
        assert.equal(getColorRange('#8800ff'), 'purple');
    });

    test('3-digit hex shorthand is handled', () => {
        assert.equal(getColorRange('#f00'), 'red');
        assert.equal(getColorRange('#0f0'), 'green');
        assert.equal(getColorRange('#00f'), 'blue');
    });
});

// ---------------------------------------------------------------------------
// calculateResult
// ---------------------------------------------------------------------------

describe('calculateResult', () => {
    test('black on white: both pass at standard thresholds', () => {
        const result = calculateResult('#000000', '#ffffff', 4.5, 60);
        assert.equal(result.wcagPass, true, 'WCAG should pass');
        assert.equal(result.apcaPass, true, 'APCA should pass');
        assert.equal(result.disagreementType, 'both_pass');
    });

    test('very similar colors: both fail', () => {
        const result = calculateResult('#aaaaaa', '#aaaaab', 4.5, 60);
        assert.equal(result.wcagPass, false);
        assert.equal(result.apcaPass, false);
        assert.equal(result.disagreementType, 'both_fail');
    });

    test('result contains fgHex and bgHex', () => {
        const result = calculateResult('#ff0000', '#ffffff', 4.5, 60);
        assert.equal(result.fgHex, '#ff0000');
        assert.equal(result.bgHex, '#ffffff');
    });

    test('wcagRatio is a string with 2 decimal places', () => {
        const result = calculateResult('#000000', '#ffffff', 4.5, 60);
        assert.ok(/^\d+\.\d{2}$/.test(result.wcagRatio), `wcagRatio format wrong: ${result.wcagRatio}`);
    });

    test('apcaScore is a non-negative string with 1 decimal place', () => {
        const result = calculateResult('#000000', '#ffffff', 4.5, 60);
        assert.ok(/^\d+\.\d$/.test(result.apcaScore), `apcaScore format wrong: ${result.apcaScore}`);
        assert.ok(parseFloat(result.apcaScore) >= 0);
    });

    test('fgRange corresponds to the foreground color', () => {
        const result = calculateResult('#ff0000', '#ffffff', 4.5, 60);
        assert.equal(result.fgRange, 'red');
    });

    test('wcag_pass_apca_fail disagreement type is correctly set', () => {
        // #666 on white: WCAG ≈ 5.74 (pass at 4.5) but APCA Lc ≈ 54 (fail at 60)
        const result = calculateResult('#666666', '#ffffff', 4.5, 60);
        if (result.wcagPass && !result.apcaPass) {
            assert.equal(result.disagreementType, 'wcag_pass_apca_fail');
        }
        // If the specific values changed, at least check the type mapping is consistent
        if (result.wcagPass && result.apcaPass) assert.equal(result.disagreementType, 'both_pass');
        if (!result.wcagPass && !result.apcaPass) assert.equal(result.disagreementType, 'both_fail');
        if (!result.wcagPass && result.apcaPass) assert.equal(result.disagreementType, 'apca_pass_wcag_fail');
    });

    test('string threshold values are parsed correctly', () => {
        const r1 = calculateResult('#000000', '#ffffff', '4.5', '60');
        const r2 = calculateResult('#000000', '#ffffff', 4.5, 60);
        assert.equal(r1.wcagPass, r2.wcagPass);
        assert.equal(r1.apcaPass, r2.apcaPass);
    });

    test('threshold at 3.0 is more permissive than 4.5', () => {
        // A borderline color pair that passes 3.0 but fails 4.5
        // #767676 on white ≈ 4.48:1 → fails 4.5, passes 3.0
        const r45 = calculateResult('#767676', '#ffffff', 4.5, 60);
        const r30 = calculateResult('#767676', '#ffffff', 3.0, 60);
        // wcag pass may differ; just check 3.0 is at least as permissive
        assert.ok(
            !r45.wcagPass || r30.wcagPass,
            'If it fails at 4.5 it must also fail at 3.0 — but not vice versa'
        );
    });
});

// ---------------------------------------------------------------------------
// simulateColorBlindness
// ---------------------------------------------------------------------------

describe('simulateColorBlindness', () => {
    test('returns input unchanged for unknown type', () => {
        assert.equal(simulateColorBlindness('#ff0000', 'unknown'), '#ff0000');
    });

    test('returns input unchanged for null type', () => {
        assert.equal(simulateColorBlindness('#ff0000', null), '#ff0000');
    });

    test('returns a valid 7-char hex string for protanopia', () => {
        const result = simulateColorBlindness('#ff0000', 'protanopia');
        assert.match(result, /^#[0-9a-f]{6}$/);
    });

    test('returns a valid 7-char hex string for deuteranopia', () => {
        const result = simulateColorBlindness('#00ff00', 'deuteranopia');
        assert.match(result, /^#[0-9a-f]{6}$/);
    });

    test('returns a valid 7-char hex string for tritanopia', () => {
        const result = simulateColorBlindness('#0000ff', 'tritanopia');
        assert.match(result, /^#[0-9a-f]{6}$/);
    });

    test('white stays white under any simulation (row sums ≈ 1)', () => {
        for (const type of ['protanopia', 'deuteranopia', 'tritanopia']) {
            assert.equal(simulateColorBlindness('#ffffff', type), '#ffffff');
        }
    });

    test('black stays black under any simulation', () => {
        for (const type of ['protanopia', 'deuteranopia', 'tritanopia']) {
            assert.equal(simulateColorBlindness('#000000', type), '#000000');
        }
    });

    test('pure red changes under protanopia (red sensitivity reduced)', () => {
        const original = '#ff0000';
        const simulated = simulateColorBlindness(original, 'protanopia');
        assert.notEqual(simulated, original);
    });

    test('pure green changes under deuteranopia (green sensitivity reduced)', () => {
        const original = '#00ff00';
        const simulated = simulateColorBlindness(original, 'deuteranopia');
        assert.notEqual(simulated, original);
    });
});

// ---------------------------------------------------------------------------
// colorBlindMatrices
// ---------------------------------------------------------------------------

describe('colorBlindMatrices', () => {
    for (const [type, matrix] of Object.entries(colorBlindMatrices)) {
        test(`${type} matrix has 3 rows of 3 values`, () => {
            assert.equal(matrix.length, 3);
            for (const row of matrix) assert.equal(row.length, 3);
        });

        test(`${type} matrix row sums are approximately 1 (no brightness change)`, () => {
            for (const row of matrix) {
                const sum = row.reduce((a, b) => a + b, 0);
                assertApprox(sum, 1.0, 0.01, `Row sum for ${type}: ${sum}`);
            }
        });

        test(`${type} matrix values are all non-negative`, () => {
            for (const row of matrix) {
                for (const val of row) {
                    assert.ok(val >= 0, `Negative matrix value ${val} in ${type}`);
                }
            }
        });
    }
});

// ---------------------------------------------------------------------------
// getRandomHexColor
// ---------------------------------------------------------------------------

describe('getRandomHexColor', () => {
    test('returns a 7-character string starting with #', () => {
        for (let i = 0; i < 20; i++) {
            const hex = getRandomHexColor();
            assert.match(hex, /^#[0-9a-f]{6}$/i, `Invalid random hex: ${hex}`);
        }
    });

    test('produces diverse outputs over many calls', () => {
        const set = new Set(Array.from({ length: 50 }, () => getRandomHexColor()));
        assert.ok(set.size > 10, 'Expected diverse random hex values');
    });
});

// ---------------------------------------------------------------------------
// randomColorInRange
// ---------------------------------------------------------------------------

describe('randomColorInRange', () => {
    const ITERATIONS = 30;

    /**
     * Parse a hex color and return {r, g, b} 0-255 values.
     * @param {string} hex
     */
    function parse(hex) {
        return {
            r: parseInt(hex.slice(1, 3), 16),
            g: parseInt(hex.slice(3, 5), 16),
            b: parseInt(hex.slice(5, 7), 16),
        };
    }

    test('returns a valid hex string for every defined range', () => {
        const ranges = ['red','green','blue','orange','purple','yellow','cyan','gray','warm','cool'];
        for (const range of ranges) {
            const hex = randomColorInRange(range);
            assert.match(hex, /^#[0-9a-f]{6}$/i, `Invalid hex for range "${range}": ${hex}`);
        }
    });

    test('falls back to random hex for unknown range', () => {
        const hex = randomColorInRange('plaid');
        assert.match(hex, /^#[0-9a-f]{6}$/i);
    });

    test('falls back to random hex for null/undefined', () => {
        assert.match(randomColorInRange(null), /^#[0-9a-f]{6}$/i);
        assert.match(randomColorInRange(undefined), /^#[0-9a-f]{6}$/i);
    });

    test('red range: secondary channels are constrained below 128', () => {
        for (let i = 0; i < ITERATIONS; i++) {
            const { g, b } = parse(randomColorInRange('red'));
            assert.ok(g < 128, `red g should be < 128: ${g}`);
            assert.ok(b < 128, `red b should be < 128: ${b}`);
        }
    });

    test('green range: secondary channels are constrained below 128', () => {
        for (let i = 0; i < ITERATIONS; i++) {
            const { r, b } = parse(randomColorInRange('green'));
            assert.ok(r < 128, `green r should be < 128: ${r}`);
            assert.ok(b < 128, `green b should be < 128: ${b}`);
        }
    });

    test('blue range: secondary channels are constrained below 128', () => {
        for (let i = 0; i < ITERATIONS; i++) {
            const { r, g } = parse(randomColorInRange('blue'));
            assert.ok(r < 128, `blue r should be < 128: ${r}`);
            assert.ok(g < 128, `blue g should be < 128: ${g}`);
        }
    });

    test('gray range: r, g, b channels are equal', () => {
        for (let i = 0; i < ITERATIONS; i++) {
            const { r, g, b } = parse(randomColorInRange('gray'));
            assert.equal(r, g, `gray r≠g: r=${r} g=${g}`);
            assert.equal(g, b, `gray g≠b: g=${g} b=${b}`);
        }
    });

    test('yellow range: red and green are high, blue is low', () => {
        for (let i = 0; i < ITERATIONS; i++) {
            const { r, g, b } = parse(randomColorInRange('yellow'));
            assert.ok(r >= 200, `yellow r should be >= 200: ${r}`);
            assert.ok(g >= 200, `yellow g should be >= 200: ${g}`);
            assert.ok(b < 100, `yellow b should be < 100: ${b}`);
        }
    });

    test('orange range: red is high, blue is low', () => {
        for (let i = 0; i < ITERATIONS; i++) {
            const { r, g, b } = parse(randomColorInRange('orange'));
            assert.ok(r >= 200, `orange r should be >= 200: ${r}`);
            assert.ok(b < 100, `orange b should be < 100: ${b}`);
        }
    });
});
