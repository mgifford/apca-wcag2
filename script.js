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
        const wcagSample = {
            size: WCAG_SIZE[wcagThresh] || 16,
            caption: WCAG_DESC[wcagThresh] || '',
            level: WCAG_LEVEL[wcagThresh] || '',
        };
        const apcaOption = apcaThresholdSelect.selectedOptions[0];
        const apcaSample = {
            size: apcaOption ? Number(apcaOption.dataset.size) : 20,
            caption: apcaOption ? apcaOption.dataset.level : '', // "Basic" / "Enhanced"
        };

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
                renderCard(res, wcagSample, apcaSample);
                generatedCount++;
            }
        }
        
        comboCountEl.textContent = generatedCount;
        statusMsg.textContent = generatedCount < count ? `Could only find ${generatedCount} matches in ${attempts} tries.` : '';
    }

    // WCAG sample size (px), size caption, and conformance level by WCAG threshold.
    // The APCA sample size and level caption come from the selected dropdown
    // option's data-size / data-level attributes, read in generateCards().
    const WCAG_SIZE  = { '3.0': 24, '4.5': 16, '7.0': 13 };
    const WCAG_DESC  = { '3.0': 'Large', '4.5': 'Small', '7.0': 'AAA small' }; // caption under the sample
    const WCAG_LEVEL = { '3.0': 'AA', '4.5': 'AA', '7.0': 'AAA' };             // conformance, shown by the ratio

    // Two-line sample (algorithm name + caption descriptor), both lines at the
    // selected size, inside the shared color field.
    function makeAlgo(text, sizePx, caption) {
        const wrap = document.createElement('div');
        wrap.className = 'sample-algo';
        wrap.style.fontSize = sizePx + 'px';

        const name = document.createElement('div');
        name.textContent = text;
        wrap.appendChild(name);

        if (caption) {
            const cap = document.createElement('div');
            cap.textContent = caption;
            wrap.appendChild(cap);
        }
        return wrap;
    }

    function renderCard(data, wcagSample, apcaSample) {
        const card = document.createElement('div');
        card.className = 'contrast-card';

        // One full-width color field holding both algorithm samples, each at the
        // size selected in its own threshold (WCAG and APCA sizes differ).
        const patch = document.createElement('div');
        patch.className = 'sample-patch';
        patch.style.color = data.fgHex;
        patch.style.backgroundColor = data.bgHex;
        patch.appendChild(makeAlgo('WCAG', wcagSample.size, wcagSample.caption));
        patch.appendChild(makeAlgo('APCA', apcaSample.size, apcaSample.caption));

        // Prepare clean Hex values (remove '#')
        const cleanFg = data.fgHex.replace('#', '');
        const cleanBg = data.bgHex.replace('#', '');

        // 1. WCAG Link (OddContrast)
        // Format: https://www.oddcontrast.com/#hex__*FG__*BG
        const wcagUrl = `https://www.oddcontrast.com/#hex__*${cleanFg}__*${cleanBg}`;

        // 2. APCA Link (Contrast.tools)
        // Format: https://contrast.tools/?text=FG&background=BG
        const apcaUrl = `https://contrast.tools/?text=${cleanFg}&background=${cleanBg}`;

        // 2b. Alt APCA Link (apcacontrast.com official demo tool)
        // Format: https://apcacontrast.com/?BG=abcdef&TXT=123456&DEV=G4g 
        // const apcaUrl = `https://apcacontrast.com/?BG=${cleanBg}&TXT=${cleanFg}&DEV=G4g`;


        const details = document.createElement('div');
        details.className = 'details';
        details.innerHTML = `
            <p>FG ${data.fgHex} <br> BG ${data.bgHex}</p>
            <p>
                <span>WCAG ${data.wcagRatio} (${wcagSample.level})</span>
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
        
        card.appendChild(patch);
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