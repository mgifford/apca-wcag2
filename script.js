import {
    hexToRgb,
    getRandomHexColor,
    getLuminanceWCAG,
    getWCAG2Contrast,
    sRGBtoY,
    getAPCAContrast,
    getColorRange,
    calculateResult,
} from './lib/contrast-utils.mjs';

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
        
        // Visual Preview
        const preview = document.createElement('div');
        preview.className = 'sample-text';
        preview.textContent = 'Aa';
        preview.style.color = data.fgHex;
        preview.style.backgroundColor = data.bgHex;
        
        // Prepare clean Hex values (remove '#')
        const cleanFg = data.fgHex.replace('#', '');
        const cleanBg = data.bgHex.replace('#', '');

        // 1. WCAG Link (OddContrast)
        // Format: https://www.oddcontrast.com/#hex__*FG__*BG
        const wcagUrl = `https://www.oddcontrast.com/#hex__*${cleanFg}__*${cleanBg}`;

        // 2. APCA Link (Contrast.tools)
        // Format: https://contrast.tools/?text=FG&background=BG
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
    
    // Generate Button
    generateButton.addEventListener('click', generateCards);
    
    // Auto-regenerate on changes
    disagreementFilter.addEventListener('change', generateCards);
    colorRangeFilter.addEventListener('change', generateCards);
    wcagThresholdSelect.addEventListener('change', generateCards);
    apcaThresholdSelect.addEventListener('change', generateCards);

    // Initial Load
    generateCards();

});