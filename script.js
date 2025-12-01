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
    
    // --- CORE CONTRAST ALGORITHMS ---

    // 1. WCAG 2.x Relative Luminance and Contrast Ratio
    
    /**
     * Converts an sRGB color channel (0-255) to a linear light value.
     * @param {number} C - color channel value (R, G, or B) from 0 to 255.
     * @returns {number} The linear light value.
     */
    function sRGBtoLin(C) {
        const c = C / 255;
        return (c <= 0.03928) ? c / 12.92 : Math.pow(((c + 0.055) / 1.055), 2.4);
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
     * Calculates the APCA contrast score (Lc).
     * @param {number} Yt - Text (foreground) Luminance.
     * @param {number} Yb - Background Luminance.
     * @returns {number} The APCA Lc score (-108 to 108).
     */
    function getAPCAContrast(Yt, Yb) {
        let S_APCA;

        // Black on White (light text on dark background is negative)
        if (Yb > Yt) {
            S_APCA = (Math.pow(Yb, APCA_PARAMS.main_bg_light) - Math.pow(Yt, APCA_PARAMS.main_text_light)) * 1.1;
        } 
        // White on Black (dark text on light background is positive)
        else {
            S_APCA = (Math.pow(Yb, APCA_PARAMS.main_bg_dark) - Math.pow(Yt, APCA_PARAMS.main_text_dark)) * 1.1;
        }

        // The final Lc value is derived by multiplying by 100
        const Lc = S_APCA * 100;

        // Apply a small clamp near zero for readability
        if (Math.abs(Lc) < 0.1) return 0;

        return Math.round(Lc * 10) / 10; // Round to one decimal place
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

    // --- MAIN LOGIC ---

    function calculateAndDisplay() {
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

        // 3. Calculate APCA
        const Ltext_apca = getLuminanceAPCA(textRgb.r, textRgb.g, textRgb.b);
        const Lbg_apca = getLuminanceAPCA(bgRgb.r, bgRgb.g, bgRgb.b);
        
        const apcaScore = getAPCAContrast(Ltext_apca, Lbg_apca);

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
    textColorInput.addEventListener('input', handleColorInput);
    bgColorInput.addEventListener('input', handleColorInput);
    textColorHexInput.addEventListener('input', handleColorInput);
    bgColorHexInput.addEventListener('input', handleColorInput);
    swapButton.addEventListener('click', swapColors);

    // Initial calculation on load
    calculateAndDisplay();
});
