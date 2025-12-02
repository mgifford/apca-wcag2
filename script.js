// IMPORT THE OFFICIAL PACKAGE (No build step required)
import { calcAPCA } from 'https://esm.sh/apca-w3';

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const resultsContainer = document.getElementById('results-container');
    const comboCountEl = document.getElementById('combo-count');
    const generateButton = document.getElementById('generate-button');
    const statusMsg = document.getElementById('status-msg');
    
    // Inputs
    const disagreementFilter = document.getElementById('disagreement-filter');
    const colorRangeFilter = document.getElementById('color-range-filter');
    const wcagThresholdSelect = document.getElementById('wcag-threshold');
    const apcaThresholdSelect = document.getElementById('apca-threshold');
    
    // Lock Controls
    const lockFgCheckbox = document.getElementById('lock-fg');
    const fixedFgInput = document.getElementById('fixed-fg');
    const lockBgCheckbox = document.getElementById('lock-bg');
    const fixedBgInput = document.getElementById('fixed-bg');
    
    // --- WCAG MATH CONSTANTS (Still needed locally as we aren't importing a WCAG lib) ---
    const sRGBtrc = 2.4;
    
    // --- HELPER FUNCTIONS ---

    // 1. Convert Hex to RGB Object (For WCAG local math)
    function hexToRgb(hex) {
        let c;
        if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
            c = hex.substring(1).split('');
            if(c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            c = '0x'+c.join('');
            return { r: (c>>16)&255, g: (c>>8)&255, b: c&255 };
        }
        return {r:0, g:0, b:0};
    }

    // 2. Convert Hex to 32-bit Integer (For OFFICIAL APCA lib)
    // The library expects 0xAARRGGBB format (Alpha, Red, Green, Blue)
    function hexToInt(hex) {
        // Remove hash
        const clean = hex.replace('#', '');
        // Add 'FF' for full opacity at the start, then parse
        if (clean.length === 3) {
            const expanded = clean[0]+clean[0] + clean[1]+clean[1] + clean[2]+clean[2];
            return parseInt('FF' + expanded, 16);
        }
        return parseInt('FF' + clean, 16);
    }

    // 3. Generate Random Hex
    function getRandomHexColor() {
        return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    }

    // 4. Linearization for WCAG
    function sRGBtoLinWCAG(C) {
        const c = C / 255;
        return (c <= 0.03928) ? c / 12.92 : Math.pow(((c + 0.055) / 1.055), sRGBtrc);
    }

    // 5. Calculate WCAG Luminance
    function getLuminanceWCAG(r, g, b) {
        const R = sRGBtoLinWCAG(r);
        const G = sRGBtoLinWCAG(g);
        const B = sRGBtoLinWCAG(b);
        return (0.2126 * R) + (0.7152 * G) + (0.0722 * B);
    }

    // 6. Calculate WCAG Contrast Ratio
    function getWCAG2Contrast(L1, L2) {
        const ratio = (L1 + 0.05) / (L2 + 0.05);
        return Math.floor(ratio * 100) / 100;
    }

    // 7. Get Color Range
    function getColorRange(hex) {
        const {r, g, b} = hexToRgb(hex);
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;
        
        if (diff < 30) return 'gray'; 
        
        if (max === r && max > g && max > b) return (g > b && g > r * 0.5) ? 'orange' : 'red';
        if (max === g && max > r && max > b) return (r > b) ? 'yellow' : 'green';
        if (max === b && max > r && max > g) return (r > g) ? 'purple' : 'blue';
        
        // Fallbacks
        if (r > 200 && g > 200) return 'yellow';
        if (g > 200 && b > 200) return 'cyan';
        return 'any';
    }

    // --- MAIN LOGIC ---

    function calculateResult(fgHex, bgHex, wcagThresh, apcaThresh) {
        // Prepare Data for WCAG (Local Math)
        const fgRgb = hexToRgb(fgHex);
        const bgRgb = hexToRgb(bgHex);
        
        // Prepare Data for APCA (Official Library)
        // Library requires integer input: 0xFFRRGGBB
        const fgInt = hexToInt(fgHex);
        const bgInt = hexToInt(bgHex);

        // WCAG Calculation
        const Ltext_wcag = getLuminanceWCAG(fgRgb.r, fgRgb.g, fgRgb.b);
        const Lbg_wcag = getLuminanceWCAG(bgRgb.r, bgRgb.g, bgRgb.b);
        const wcagRatio = getWCAG2Contrast(Math.max(Ltext_wcag, Lbg_wcag), Math.min(Ltext_wcag, Lbg_wcag));
        const wcagPass = wcagRatio >= parseFloat(wcagThresh);

        // APCA Calculation (USING IMPORTED LIBRARY)
        // calcAPCA(text, bg) -> Returns a float (positive or negative)
        const rawApca = calcAPCA(fgInt, bgInt);
        const apcaScore = Math.abs(rawApca); // We use absolute value for checking magnitude
        const apcaPass = apcaScore >= parseFloat(apcaThresh);

        let disagreementType = 'both_fail';
        if (wcagPass && apcaPass) disagreementType = 'both_pass';
        else if (wcagPass && !apcaPass) disagreementType = 'wcag_pass_apca_fail';
        else if (!wcagPass && apcaPass) disagreementType = 'apca_pass_wcag_fail';

        return {
            fgHex, bgHex,
            wcagRatio: wcagRatio.toFixed(2), wcagPass,
            apcaScore: apcaScore.toFixed(1), apcaPass,
            disagreementType,
            fgRange: getColorRange(fgHex)
        };
    }

    function generateCards() {
        resultsContainer.innerHTML = '';
        statusMsg.textContent = 'Generating...';
        
        const count = 25;
        const targetDisagreement = disagreementFilter.value;
        const targetRange = colorRangeFilter.value;
        const wcagThresh = wcagThresholdSelect.value;
        const apcaThresh = apcaThresholdSelect.value;

        let generatedCount = 0;
        let attempts = 0;
        const maxAttempts = 2000; 

        while (generatedCount < count && attempts < maxAttempts) {
            attempts++;
            
            const fg = lockFgCheckbox.checked ? fixedFgInput.value : getRandomHexColor();
            const bg = lockBgCheckbox.checked ? fixedBgInput.value : getRandomHexColor();
            
            const res = calculateResult(fg, bg, wcagThresh, apcaThresh);
            
            let validDisagreement = false;
            if (targetDisagreement === 'all') validDisagreement = true;
            else if (targetDisagreement === 'all_disagreements') validDisagreement = (res.wcagPass !== res.apcaPass);
            else validDisagreement = (res.disagreementType === targetDisagreement);

            let validRange = true;
            if (targetRange !== 'any' && !lockFgCheckbox.checked) {
                validRange = (res.fgRange === targetRange);
            }

            if (validDisagreement && validRange) {
                renderCard(res);
                generatedCount++;
            }
        }
        
        comboCountEl.textContent = generatedCount;
        statusMsg.textContent = generatedCount < count ? `Could only find ${generatedCount} matches in ${attempts} tries.` : '';
    }

    function renderCard(data) {
        const card = document.createElement('div');
        card.className = 'contrast-card';
        
        const preview = document.createElement('div');
        preview.className = 'sample-text';
        preview.textContent = 'Aa';
        preview.style.color = data.fgHex;
        preview.style.backgroundColor = data.bgHex;
        
        const cleanFg = data.fgHex.replace('#', '');
        const cleanBg = data.bgHex.replace('#', '');

        const wcagUrl = `https://www.oddcontrast.com/#hex__*${cleanFg}__*${cleanBg}`;
        const apcaUrl = `https://contrast.tools/?text=${cleanFg}&background=${cleanBg}`;

        const details = document.createElement('div');
        details.className = 'details';
        details.innerHTML = `
            <p>FG ${data.fgHex} <br> BG ${data.bgHex}</p>
            <p>
                <span>WCAG ${data.wcagRatio}</span>
                <span class="tag ${data.wcagPass ? 'pass' : 'fail'}">${data.wcagPass ? 'PASS' : 'FAIL'}</span>
            </p>
            <p>
                <span>APCA Lc ${data.apcaScore}</span>
                <span class="tag ${data.apcaPass ? 'pass' : 'fail'}">${data.apcaPass ? 'PASS' : 'FAIL'}</span>
            </p>
            
            <div class="links-row">
                <a href="${wcagUrl}" target="_blank" class="link-btn" title="Verify at OddContrast">Check WCAG ↗</a>
                <a href="${apcaUrl}" target="_blank" class="link-btn" title="Verify at Contrast.tools">Check APCA ↗</a>
            </div>
        `;
        
        card.appendChild(preview);
        card.appendChild(details);
        resultsContainer.appendChild(card);
    }

    // --- EVENT LISTENERS ---
    
    generateButton.addEventListener('click', generateCards);
    disagreementFilter.addEventListener('change', generateCards);
    colorRangeFilter.addEventListener('change', generateCards);
    wcagThresholdSelect.addEventListener('change', generateCards);
    apcaThresholdSelect.addEventListener('change', generateCards);

    // Initial Load
    generateCards();
});
