document.addEventListener('DOMContentLoaded', () => {
    const textColorInput = document.getElementById('text-color');
    const bgColorInput = document.getElementById('bg-color');
    const textColorHexInput = document.getElementById('text-color-hex');
    const bgColorHexInput = document.getElementById('bg-color-hex');
    const swapButton = document.getElementById('swap-button');
    const preview = document.getElementById('preview');
    const wcagScoreEl = document.getElementById('wcag-score');
    const wcagPassEl = document.getElementById('wcag-pass');
    const apcaScoreEl = document.getElementById('apca-score');
    const apcaPassEl = document.getElementById('apca-pass');

    // Explorer controls
    const filterModeEl = document.getElementById('filter-mode');
    const colorRangeEl = document.getElementById('color-range');
    const wcagThresholdEl = document.getElementById('wcag-threshold');
    const apcaThresholdEl = document.getElementById('apca-threshold');
    const colorBlindEl = document.getElementById('color-blind');
    const bgDefaultEl = document.getElementById('bg-default');
    const randomizeEl = document.getElementById('randomize');
    const generateButton = document.getElementById('generate-button');
    const resultsGrid = document.getElementById('results-grid');
    
    // --- CORE CONTRAST ALGORITHMS ---

    // 1. WCAG 2.x Relative Luminance and Contrast Ratio
    
    /**
     * Converts an sRGB color channel (0-255) to a linear light value.
     * @param {number} C - color channel value (R, G, or B) from 0 to 255.
     * @returns {number} The linear light value.
     */
    function sRGBtoLin(C) {
        const c = C / 255;
        // WCAG uses 0.04045 and 12.92
        return (c <= 0.04045) ? (c / 12.92) : Math.pow(((c + 0.055) / 1.055), 2.4);
    }
    
    /**
     * Calculates Relative Luminance (Y) for WCAG 2.x.
     * @param {number} r, g, b - sRGB color channel values (0-255).
     * @returns {number} Relative Luminance (Y) from 0 to 1.
     */
    function getLuminanceWCAG(r, g, b) {
        const R = sRGBtoLin(r);
        const G = sRGBtoLin(g);
        const B = sRGBtoLin(b);
        return (0.2126 * R) + (0.7152 * G) + (0.0722 * B);
    }

    /**
     * Calculates the WCAG 2.x Contrast Ratio.
     * @param {number} L1 - Luminance of the lighter color.
     * @param {number} L2 - Luminance of the darker color.
     * @returns {number} The contrast ratio (1 to 21).
     */
    function getWCAG2Contrast(L1, L2) {
        const ratio = (L1 + 0.05) / (L2 + 0.05);
        return Math.round(ratio * 100) / 100; // Round to two decimal places
    }

    // 2. APCA Contrast (SAPC-APCA)
    
    // Simplified exponent constants for APCA (using Bronze Simple Mode guidelines)
    const APCA_PARAMS = {
        main_text_light: 0.56,
        main_text_dark: 0.58,
        main_bg_light: 0.057,
        main_bg_dark: 0.062,
        sRGB_trc: 2.4 // Standard sRGB TRC
    };

    /**
     * Calculates Luminance (Y) for APCA (uses a different TRC for input).
     * @param {number} r, g, b - sRGB color channel values (0-255).
     * @returns {number} The APCA-specific Y luminance.
     */
    function getLuminanceAPCA(r, g, b) {
        const R = Math.pow(r / 255, APCA_PARAMS.sRGB_trc);
        const G = Math.pow(g / 255, APCA_PARAMS.sRGB_trc);
        const B = Math.pow(b / 255, APCA_PARAMS.sRGB_trc);
        return (0.2126 * R) + (0.7152 * G) + (0.0722 * B);
    }

    /**
     * Calculates APCA contrast score (Lc) using official APCA-W3 when available.
     * Fallbacks to approximate method if library is not present.
     */
    function getAPCAContrastFromHex(fgHex, bgHex) {
        try {
            if (window.APCA && typeof window.APCA.APCAcontrast === 'function') {
                const txt = fgHex.replace('#','').toUpperCase();
                const bg = bgHex.replace('#','').toUpperCase();
                const lc = window.APCA.APCAcontrast(txt, bg);
                return Math.round(lc * 10) / 10;
            }
        } catch (_) {}

        // Fallback approximate calculation
        const fg = hexToRgb(fgHex);
        const bg = hexToRgb(bgHex);
        const Yt = getLuminanceAPCA(fg.r, fg.g, fg.b);
        const Yb = getLuminanceAPCA(bg.r, bg.g, bg.b);
        let S_APCA;
        if (Yb > Yt) {
            S_APCA = (Math.pow(Yb, APCA_PARAMS.main_bg_light) - Math.pow(Yt, APCA_PARAMS.main_text_light)) * 1.1;
        } else {
            S_APCA = (Math.pow(Yb, APCA_PARAMS.main_bg_dark) - Math.pow(Yt, APCA_PARAMS.main_text_dark)) * 1.1;
        }
        const Lc = S_APCA * 100;
        if (Math.abs(Lc) < 0.1) return 0;
        return Math.round(Lc * 10) / 10;
    }

    // --- UTILITY FUNCTIONS ---

    /**
     * Converts a HEX string to an RGB object.
     * @param {string} hex - The hex color string (#RRGGBB).
     * @returns {{r: number, g: number, b: number}} RGB components (0-255).
     */
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    function rgbToHex({ r, g, b }) {
        const toHex = (n) => n.toString(16).padStart(2, '0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    // Color blindness simulation (simple approximations)
    function simulateColorBlindness(rgb, type) {
        const { r, g, b } = rgb;
        const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
        if (type === 'protanopia') {
            // Reduced red sensitivity
            return { r: clamp(0.56667 * r + 0.43333 * g), g: clamp(0.55833 * r + 0.44167 * g), b };
        } else if (type === 'deuteranopia') {
            // Reduced green sensitivity
            return { r: clamp(0.625 * r + 0.375 * g), g: clamp(0.7 * r + 0.3 * g), b };
        } else if (type === 'tritanopia') {
            // Reduced blue sensitivity
            return { r, g: clamp(0.95 * g + 0.05 * b), b: clamp(0.43333 * g + 0.56667 * b) };
        }
        return rgb;
    }

    // Ranged color generation
    function randomInRange(range) {
        function rand(n) { return Math.floor(Math.random() * n); }
        const any = { r: rand(256), g: rand(256), b: rand(256) };
        switch (range) {
            case 'green': return { r: rand(100), g: 100 + rand(156), b: rand(100) };
            case 'blue': return { r: rand(100), g: rand(100), b: 100 + rand(156) };
            case 'red': return { r: 100 + rand(156), g: rand(100), b: rand(100) };
            case 'orange': return { r: 160 + rand(96), g: 80 + rand(96), b: rand(64) };
            case 'purple': return { r: 120 + rand(136), g: rand(80), b: 120 + rand(136) };
            case 'yellow': return { r: 180 + rand(76), g: 160 + rand(96), b: rand(60) };
            case 'cyan': return { r: rand(80), g: 120 + rand(136), b: 120 + rand(136) };
            case 'gray': {
                const v = rand(256); return { r: v, g: v, b: v };
            }
            case 'warm': return { r: 140 + rand(116), g: 60 + rand(120), b: rand(100) };
            case 'cool': return { r: rand(100), g: 80 + rand(120), b: 120 + rand(136) };
            default: return any;
        }
    }

    // Pass/fail helpers per thresholds
    function wcagPassFromRatio(ratio, threshold) {
        return ratio >= Number(threshold);
    }

    function apcaPassFromLc(absLc, threshold) {
        return absLc >= Number(threshold);
    }

    // Calculate both scores for hex colors, with optional color blindness sim
    function evaluatePair(fgHex, bgHex, cbType = 'none') {
        const fgRgbBase = hexToRgb(fgHex);
        const bgRgbBase = hexToRgb(bgHex);
        const fgRgb = cbType === 'none' ? fgRgbBase : simulateColorBlindness(fgRgbBase, cbType);
        const bgRgb = cbType === 'none' ? bgRgbBase : simulateColorBlindness(bgRgbBase, cbType);

        // WCAG
        const Ltext_wcag = getLuminanceWCAG(fgRgb.r, fgRgb.g, fgRgb.b);
        const Lbg_wcag = getLuminanceWCAG(bgRgb.r, bgRgb.g, bgRgb.b);
        const L1 = Math.max(Ltext_wcag, Lbg_wcag);
        const L2 = Math.min(Ltext_wcag, Lbg_wcag);
        const wcagRatio = getWCAG2Contrast(L1, L2);

        // APCA using official library if available
        const simFgHex = rgbToHex(fgRgb);
        const simBgHex = rgbToHex(bgRgb);
        const apcaScore = getAPCAContrastFromHex(simFgHex, simBgHex);
        const absApcaScore = Math.abs(apcaScore);

        return { wcagRatio, apcaScore, absApcaScore, fgHex, bgHex };
    }

    function buildLinksCard(fg, bg) {
        const txt = fg.replace('#','').toUpperCase();
        const bgHex = bg.replace('#','').toUpperCase();
        const ccUrl = `https://www.color-contrast.dev/?txtColor=${txt}&bgColor=${bgHex}`;
        return { ccUrl };
    }

    function makeCardHTML(entry, thresholds, cbType) {
        const { wcagRatio, absApcaScore, fgHex, bgHex } = entry;
        const wcagPass = wcagPassFromRatio(wcagRatio, thresholds.wcag);
        const apcaPass = apcaPassFromLc(absApcaScore, thresholds.apca);
        const { ccUrl } = buildLinksCard(fgHex, bgHex);
        const cbMeta = cbType !== 'none' ? ` • ${cbType}` : '';
        return `
        <div class="card">
            <div class="swatch" style="color:${fgHex};background:${bgHex}">Aa
            </div>
            <div class="card-body">
                <div class="meta">FG ${fgHex} on BG ${bgHex}${cbMeta}</div>
                <div>
                    <span class="badge wcag">WCAG</span> ${wcagRatio.toFixed(2)} ${wcagPass ? '(PASS)' : '(FAIL)'}
                </div>
                <div>
                    <span class="badge apca">APCA</span> Lc ${absApcaScore.toFixed(1)} ${apcaPass ? '(PASS)' : '(FAIL)'}
                </div>
                <div class="links">
                    <a href="${ccUrl}" target="_blank" rel="noopener">Open in color-contrast.dev</a>
                </div>
            </div>
        </div>`;
    }

    function matchesFilter(entry, thresholds, filterMode) {
        const wcagPass = wcagPassFromRatio(entry.wcagRatio, thresholds.wcag);
        const apcaPass = apcaPassFromLc(entry.absApcaScore, thresholds.apca);
        switch (filterMode) {
            case 'wcag-pass-apca-fail': return wcagPass && !apcaPass;
            case 'apca-pass-wcag-fail': return apcaPass && !wcagPass;
            case 'both-pass': return wcagPass && apcaPass;
            case 'disagree': return wcagPass !== apcaPass;
            default: return true;
        }
    }

    function generateSet() {
        const filterMode = filterModeEl.value;
        const colorRange = colorRangeEl.value;
        const thresholds = {
            wcag: Number(wcagThresholdEl.value),
            apca: Number(apcaThresholdEl.value)
        };
        const cbType = colorBlindEl.value;
        const bgDefault = bgDefaultEl.value || '#000000';
        const randomize = randomizeEl.checked;

        resultsGrid.innerHTML = '';
        const cards = [];

        // Try to find up to 25 matches; cap iterations to avoid long loops
        let attempts = 0;
        while (cards.length < 25 && attempts < 5000) {
            attempts++;
            const fgRgb = randomInRange(colorRange);
            const fgHex = rgbToHex(fgRgb);
            const bgHex = randomize ? rgbToHex(randomInRange(colorRange)) : bgDefault.toUpperCase();
            const entry = evaluatePair(fgHex, bgHex, cbType);
            if (matchesFilter(entry, thresholds, filterMode)) {
                cards.push(makeCardHTML(entry, thresholds, cbType));
            }
        }

        if (cards.length === 0) {
            resultsGrid.innerHTML = '<p>No matches found. Try relaxing thresholds or changing range.</p>';
        } else {
            resultsGrid.innerHTML = cards.join('');
        }
    }

    // --- MAIN LOGIC ---

    function calculateAndDisplay() {
        // If the calculator UI has been removed, safely no-op
        if (!preview || !textColorHexInput || !bgColorHexInput || !wcagScoreEl || !wcagPassEl || !apcaScoreEl || !apcaPassEl) {
            return;
        }
        const textHex = textColorHexInput.value.toUpperCase();
        const bgHex = bgColorHexInput.value.toUpperCase();
        
        // 1. Update Preview
        preview.style.color = textHex;
        preview.style.backgroundColor = bgHex;

        const textRgb = hexToRgb(textHex);
        const bgRgb = hexToRgb(bgHex);
        
        // 2. Calculate WCAG 2.x
        const Ltext_wcag = getLuminanceWCAG(textRgb.r, textRgb.g, textRgb.b);
        const Lbg_wcag = getLuminanceWCAG(bgRgb.r, bgRgb.g, bgRgb.b);

        const L1 = Math.max(Ltext_wcag, Lbg_wcag);
        const L2 = Math.min(Ltext_wcag, Lbg_wcag);
        const wcagRatio = getWCAG2Contrast(L1, L2);
        
        wcagScoreEl.textContent = `${wcagRatio.toFixed(1)}:1`;
        
        // WCAG Status
        wcagPassEl.className = 'wcag-status';
        if (wcagRatio >= 7.0) {
            wcagPassEl.textContent = 'AAA Pass';
            wcagPassEl.classList.add('wcag-aaa');
        } else if (wcagRatio >= 4.5) {
            wcagPassEl.textContent = 'AA Pass (Normal)';
            wcagPassEl.classList.add('wcag-aa');
        } else if (wcagRatio >= 3.0) {
            wcagPassEl.textContent = 'AA Pass (Large Text)';
            wcagPassEl.classList.add('wcag-aa');
        } else {
            wcagPassEl.textContent = 'Fail';
            wcagPassEl.classList.add('wcag-fail');
        }

        // 3. Calculate APCA (official library if available)
        const apcaScore = getAPCAContrastFromHex(textHex, bgHex);

        // APCA score is absolute value for reading the requirement table
        const absApcaScore = Math.abs(apcaScore);

        apcaScoreEl.textContent = `Lc ${absApcaScore.toFixed(1)}`;

        // APCA Status (Simplified based on Bronze/Silver levels)
        apcaPassEl.className = 'apca-status';
        if (absApcaScore >= 75) {
            apcaPassEl.textContent = 'Super (Body Text)';
            apcaPassEl.classList.add('apca-super');
        } else if (absApcaScore >= 60) {
            apcaPassEl.textContent = 'Good (Body Text)';
            apcaPassEl.classList.add('apca-good');
        } else if (absApcaScore >= 45) {
            apcaPassEl.textContent = 'Low (Non-Text/Large)';
            apcaPassEl.classList.add('apca-low');
        } else {
            apcaPassEl.textContent = 'Fail (Too Low)';
            apcaPassEl.classList.add('apca-fail');
        }
    }

    // --- EVENT LISTENERS ---

    function handleColorInput(e) {
        // Update the other input type for the same color
        if (e.target === textColorInput) {
            textColorHexInput.value = textColorInput.value.toUpperCase();
        } else if (e.target === bgColorInput) {
            bgColorHexInput.value = bgColorInput.value.toUpperCase();
        } else if (e.target === textColorHexInput) {
            if (textColorHexInput.value.length === 7) {
                textColorInput.value = textColorHexInput.value;
            }
        } else if (e.target === bgColorHexInput) {
            if (bgColorHexInput.value.length === 7) {
                bgColorInput.value = bgColorHexInput.value;
            }
        }
        calculateAndDisplay();
    }

    function swapColors() {
        const tempTextHex = textColorHexInput.value;
        const tempBgHex = bgColorHexInput.value;

        // Swap the Hex inputs
        textColorHexInput.value = tempBgHex;
        bgColorHexInput.value = tempTextHex;

        // Swap the Color inputs
        textColorInput.value = tempBgHex;
        bgColorInput.value = tempTextHex;
        
        calculateAndDisplay();
    }

    // Attach listeners
    if (textColorInput) textColorInput.addEventListener('input', handleColorInput);
    if (bgColorInput) bgColorInput.addEventListener('input', handleColorInput);
    if (textColorHexInput) textColorHexInput.addEventListener('input', handleColorInput);
    if (bgColorHexInput) bgColorHexInput.addEventListener('input', handleColorInput);
    if (swapButton) swapButton.addEventListener('click', swapColors);

    // Initial calculation on load
    calculateAndDisplay();

    // Explorer actions
    if (generateButton) {
        generateButton.addEventListener('click', generateSet);
    }

    // Auto-generate on selection changes
    const autoInputs = [
        filterModeEl,
        colorRangeEl,
        wcagThresholdEl,
        apcaThresholdEl,
        colorBlindEl,
        bgDefaultEl,
        randomizeEl
    ].filter(Boolean);

    autoInputs.forEach((el) => {
        const evt = (el.tagName === 'INPUT' && el.type === 'text') ? 'input' : 'change';
        el.addEventListener(evt, generateSet);
    });

    // Generate initial examples for immediate value
    generateSet();
});
