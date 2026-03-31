# Accessibility Commitment (ACCESSIBILITY.md)

## 1. Our commitment

We believe accessibility is a subset of quality. This project commits to **WCAG 2.2 AA** standards for all documentation and example code. We track our progress publicly to remain accountable to our users.

This project — **apca-wcag2** — exists specifically to help accessibility practitioners, designers, and developers understand the differences and relationships between WCAG 2.x contrast ratios and the Advanced Perceptual Contrast Algorithm (APCA). Color contrast is therefore both our subject matter and our primary accessibility obligation.

## 2. Real-time health metrics

| Metric | Status / Value |
| :--- | :--- |
| **Open A11y Issues** | [View open accessibility issues](https://github.com/mgifford/apca-wcag2/labels/accessibility) |
| **Automated Test Pass Rate** | Monitored via link checking and documentation validation |
| **A11y PRs Merged (MTD)** | Tracked in [project insights](https://github.com/mgifford/apca-wcag2/pulse) |
| **Browser Support** | Last 2 major versions of Chrome, Firefox, Safari |

## 3. Contributor requirements (the guardrails)

To contribute to this repo, you must follow these guidelines:

- **Color contrast:** All UI elements must meet the thresholds defined in [Section 6 (Color Contrast Best Practices)](#6-color-contrast-accessibility-best-practices) of this document.
- **Documentation testing:** All documentation examples must follow accessibility best practices.
- **Keyboard accessibility:** All interactive elements must be fully keyboard-operable.
- **Non-color cues:** Results must never be conveyed by color alone — numeric values and text labels are required.
- **Link validation:** All documentation links must be functional.
- **Inclusive language:** Use person-centred, respectful language throughout.

## 4. Reporting and severity taxonomy

Please use our [issue templates](https://github.com/mgifford/apca-wcag2/issues/new) when reporting issues. We prioritize based on:

- **Critical:** An inaccessible UI element that prevents users from completing core tasks
- **High:** Significant guidance gap or misleading information that could create accessibility barriers
- **Medium:** Documentation clarity issues or incomplete examples
- **Low:** Minor improvements, typos, or enhancements

## 5. Browser and assistive technology testing

### Browser support

This project supports the **last 2 major versions** of all major browser engines:
- **Chrome/Chromium** (including Edge, Brave, Opera)
- **Firefox**
- **Safari/WebKit** (macOS and iOS)

### Assistive technology testing

Contributors are encouraged to test documentation and the interactive tool with:

- **Screen readers:** JAWS, NVDA, VoiceOver, TalkBack
- **Keyboard navigation:** Tab, arrow keys, standard shortcuts
- **Magnification tools:** Browser zoom up to 200% and 400%
- **Voice control:** Dragon, Voice Control

### Known visual-nature limitations

Because this project explores color and contrast, some visualizations may be difficult to make fully accessible. Where this is unavoidable, limitations must be documented and numeric or text equivalents must always be provided alongside any color-only output.

---

## 6. Color Contrast Accessibility Best Practices

> **Note:** Color contrast is the central subject of this project. The guidance below applies both to this tool itself and to the web interfaces that practitioners build using what they learn here. This section integrates content from the [Color Contrast Accessibility Best Practices](https://github.com/mgifford/ACCESSIBILITY.md/blob/main/examples/COLOR_CONTRAST_ACCESSIBILITY_BEST_PRACTICES.md) guide with extra context for APCA vs WCAG 2.x usage.

This section defines accessibility requirements for color contrast in web interfaces, ensuring all users can perceive and distinguish content regardless of vision ability, ambient lighting, or display settings. It covers WCAG 2.2 Level AA requirements for text, non-text elements, and focus indicators — as well as emerging guidance on APCA and forced-colors mode.

Color perception varies greatly across users. People with low vision, color vision deficiencies, or age-related vision changes all depend on sufficient contrast. Meeting contrast requirements benefits everyone: high-contrast interfaces are also easier to read in bright sunlight, on low-quality displays, and in print.

---

### 6.1 Core Principle

Sufficient contrast between foreground and background colors is a prerequisite for users to read text, identify UI components, perceive graphical content, and track keyboard focus. **Color alone must never be the sole means of conveying information.**

All visual interface elements that convey information or require user interaction must meet the applicable WCAG 2.2 Level AA contrast thresholds listed in this document. Contrast must be maintained in **light mode, dark mode, and forced-colors (high contrast) mode**.

---

### 6.2 WCAG 2.2 Requirements Overview

| Success Criterion | Level | Requirement | Applies To |
|:---|:---:|:---|:---|
| 1.4.1 Use of Color | A | Color must not be the only visual means of conveying information | All content |
| 1.4.3 Contrast (Minimum) | AA | 4.5:1 for normal text; 3:1 for large text | Text and images of text |
| 1.4.6 Contrast (Enhanced) | AAA | 7:1 for normal text; 4.5:1 for large text | Text and images of text |
| 1.4.11 Non-text Contrast | AA | 3:1 against adjacent colors | UI components, graphical objects |
| 2.4.13 Focus Appearance | AA | Focus indicator area ≥ perimeter of component × 2 CSS pixels; 3:1 contrast change | Keyboard focus indicators |

> **WCAG 2.2 note:** 2.4.13 Focus Appearance is new in WCAG 2.2 at Level AA. Teams that previously targeted 2.4.7 (Focus Visible, AA) must also now satisfy 2.4.13.

---

### 6.3 Text Contrast (WCAG 1.4.3)

#### Contrast ratio thresholds

| Text type | Minimum (Level AA) | Enhanced (Level AAA) |
|:---|:---:|:---:|
| Normal text (below 18pt / 14pt bold) | **4.5:1** | 7:1 |
| Large text (18pt+ / 14pt+ bold) | **3:1** | 4.5:1 |
| Logotypes (text in logos) | Exempt | Exempt |
| Incidental text (purely decorative) | Exempt | Exempt |
| Disabled controls | Exempt | Exempt |

#### What counts as "large text"

- **18pt** (approximately 24 CSS `px`) or larger in regular weight
- **14pt** (approximately 18.67 CSS `px`) or larger in bold weight

#### Preferred CSS pattern — text colors using custom properties

```css
:root {
  /* Normal body text — 4.5:1 against white background */
  --color-text:        #1a1a1a;   /* contrast vs #fff: 16.75:1 ✓ */
  --color-text-muted:  #595959;   /* contrast vs #fff: 7.0:1   ✓ */

  /* Large heading text — may use 3:1 minimum */
  --color-heading:     #333333;   /* contrast vs #fff: 12.63:1 ✓ */

  /* Link text — meets 4.5:1 against white and has non-color distinction */
  --color-link:        #0066cc;   /* contrast vs #fff: 4.52:1  ✓ */

  --color-background:  #ffffff;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-text:        #e8e8e8;   /* contrast vs #1a1a1a: 13.61:1 ✓ */
    --color-text-muted:  #b0b0b0;   /* contrast vs #1a1a1a:  7.0:1  ✓ */
    --color-heading:     #f0f0f0;
    --color-link:        #66aaff;   /* contrast vs #1a1a1a: 5.74:1  ✓ */
    --color-background:  #1a1a1a;
  }
}
```

#### Images of text

Text embedded in images must meet the same 4.5:1 (or 3:1 large text) requirement. Prefer real text rendered in CSS to avoid this constraint and gain responsive scaling.

---

### 6.4 Non-text Contrast (WCAG 1.4.11)

Non-text elements that are required for users to understand or operate the interface must meet a **3:1 contrast ratio** against adjacent colors.

**Applies to:**
- Form input borders (text fields, checkboxes, radio buttons, select dropdowns)
- Interactive UI component boundaries (buttons without text, sliders, toggles)
- Icons and graphical objects that convey meaning
- Charts and data visualization elements that encode information
- Status indicators (progress bars, meter fills)

**Does not apply to:**
- Decorative graphics or illustrations that do not convey meaning
- Inactive or disabled components
- Logos and brand marks
- Information also available in text (the graphical element is supplementary)

---

### 6.5 Use of Color (WCAG 1.4.1)

Color alone must not be the sole means of conveying information, indicating an action, prompting a response, or distinguishing a visual element. A second, non-color cue must always accompany color.

**Common failure patterns to avoid:**

```html
<!-- Bad: required field indicated only by red label color -->
<label style="color: red;">Email address</label>
<input type="email">

<!-- Bad: error state communicated only by red border -->
<input type="email" style="border-color: red;">
```

**Preferred patterns:**

```html
<!-- Good: required field — asterisk + color -->
<label>
  Email address
  <span aria-hidden="true" class="required-marker">*</span>
  <span class="sr-only">(required)</span>
</label>
<input type="email" aria-required="true">

<!-- Good: error state — icon + text + color + border -->
<div class="field field--error">
  <label for="email">Email address</label>
  <input id="email" type="email" aria-describedby="email-error" aria-invalid="true">
  <p id="email-error" class="error-message">
    <svg aria-hidden="true" focusable="false" class="icon-error">
      <use href="#icon-exclamation"></use>
    </svg>
    Please enter a valid email address.
  </p>
</div>
```

> **Relevance to apca-wcag2:** This tool displays contrast scores for color pairs. Pass/fail indicators must use both a text label (e.g., "PASS" / "FAIL") and color so that color-blind and low-vision users can read results.

---

### 6.6 Focus Appearance (WCAG 2.4.13)

WCAG 2.2 adds **2.4.13 Focus Appearance** at Level AA. A visible keyboard focus indicator must:

1. Have an area of at least the size of a **2 CSS pixel thick perimeter** around the unfocused component.
2. Have a **contrast ratio of at least 3:1** between the focused and unfocused states.
3. Have a **contrast ratio of at least 3:1** against every adjacent color in the unfocused state.

#### Preferred CSS pattern — visible focus ring

```css
:root {
  --focus-ring-color:  #0066cc;
  --focus-ring-width:  3px;
  --focus-ring-offset: 2px;
}

:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
  box-shadow: 0 0 0 calc(var(--focus-ring-width) + var(--focus-ring-offset))
              #ffffff;
}

@media (prefers-color-scheme: dark) {
  :root {
    --focus-ring-color: #99ccff;
  }
}
```

**Never do this:**

```css
/* NEVER — completely removes focus visibility */
:focus {
  outline: none;
}
```

---

### 6.7 APCA — The Emerging Standard

> **This section is especially relevant to apca-wcag2.** This project exists to help practitioners understand APCA alongside WCAG 2.x — so we explain both here in depth.

The **Advanced Perceptual Contrast Algorithm (APCA)** is being developed by the W3C Silver Task Force as a candidate replacement for the WCAG 2.x contrast ratio formula. APCA models human contrast perception more accurately than the current luminance-based ratio, particularly for:

- **Asymmetric polarity:** Dark text on light backgrounds vs. light text on dark backgrounds are treated differently because human vision responds asymmetrically.
- **Spatial frequency:** Thin strokes and small font sizes require higher contrast than large text.
- **Saturated colors:** Pure reds and blues are handled more accurately by APCA than by the WCAG 2.x formula, which can produce misleading results for highly saturated hues.

#### Current status

APCA is **not yet required by WCAG 2.2**. It is expected to appear in WCAG 3.0. Teams adopting APCA today should **continue to meet WCAG 2.2 AA requirements** in parallel and treat APCA as supplemental guidance.

This project is informational and educational — it does **not** certify compliance with either WCAG 2.x or APCA.

#### APCA Lightness Contrast (Lc) thresholds (informational)

| Content type | Minimum Lc | Recommended Lc |
|:---|:---:|:---:|
| Normal body text (16px / 400 weight) | 60 | 75 |
| Large heading text (24px+ / 700 weight) | 45 | 60 |
| UI component labels | 45 | 60 |
| Placeholder / muted text | 30 | 45 |

Lc values are positive for dark-on-light and negative for light-on-dark; only the absolute value is used for threshold comparisons.

#### Where WCAG 2.x and APCA disagree

A central finding of this project is that the two algorithms frequently disagree. Common patterns:

| Pattern | Cause | Example |
|:---|:---|:---|
| WCAG passes, APCA fails | Saturated colors (especially greens) score higher in WCAG 2.x relative luminance than APCA perceives them | `#1cc285` on `#000000`: WCAG 9.10 ✓, APCA Lc −57.2 ✗ |
| APCA passes, WCAG fails | Asymmetric polarity — light text on dark can require a different threshold | Rare with default thresholds; more common with relaxed APCA thresholds |
| Both pass | High-contrast combinations that satisfy both models | Black text on white |
| Both fail | Most random color combinations | — |

Use the `apca-wcag2-diff.mjs` command-line tool's `--wcag-fails`, `--apca-fails`, and `--both-pass` flags to explore these patterns interactively (see [README.md](./README.md) for usage).

#### Evaluating APCA contrast programmatically

```javascript
// Using the APCA-W3 package (github.com/Myndex/SAPC-APCA)
import { APCAcontrast, sRGBtoY } from "apca-w3";

const textColor       = "#1a1a1a";
const backgroundColor = "#ffffff";

const Lc = APCAcontrast(sRGBtoY(backgroundColor), sRGBtoY(textColor));
// Lc ≈ 106 — well above 75 threshold for normal body text ✓
console.log(`APCA Lc: ${Math.abs(Lc).toFixed(1)}`);
```

---

### 6.8 Evaluating WCAG 2.x Contrast Ratios

The WCAG contrast ratio formula uses relative luminance (L) as defined in WCAG 2.x:

```
Contrast Ratio = (L1 + 0.05) / (L2 + 0.05)

Where L1 is the relative luminance of the lighter color
and   L2 is the relative luminance of the darker color.
```

This formula is based on the sRGB color space. It has known limitations for colors of similar luminance but different hue (e.g., blue on red) — see [Section 6.7](#67-apca--the-emerging-standard) for the APCA approach.

#### Recommended contrast-checking tools

| Tool | Use case |
|:---|:---|
| [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) | Quick manual checks — text contrast |
| [Colour Contrast Analyser (TPGi)](https://www.tpgi.com/color-contrast-checker/) | Desktop app for sampling on-screen colors |
| [axe DevTools](https://www.deque.com/axe/devtools/) | Browser extension with contrast violation detection |
| [apcacontrast.com](https://apcacontrast.com/) | APCA-based contrast evaluation |
| [Stark (Figma/Sketch plugin)](https://www.getstark.co/) | Design-time contrast checking |
| [Chrome DevTools CSS Overview](https://developer.chrome.com/docs/devtools/) | Browser-based audit of contrast issues |

---

### 6.9 CSS Custom Properties for Accessible Color Palettes

Centralizing all design-system colors as CSS custom properties makes contrast validation and theming manageable at scale.

```css
/* Design token layer — raw color values */
:root {
  --color-neutral-0:   #ffffff;
  --color-neutral-600: #595959;  /* 7.0:1 on #fff */
  --color-neutral-900: #1a1a1a;  /* 16.75:1 on #fff */
  --color-brand-500:   #0066cc;  /* 4.52:1 on #fff ✓ */
  --color-brand-700:   #004c99;  /* 7.59:1 on #fff ✓ */

  /* Semantic layer */
  --color-text-primary:   var(--color-neutral-900);
  --color-text-secondary: var(--color-neutral-600);
  --color-text-link:      var(--color-brand-500);
  --color-surface:        var(--color-neutral-0);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-text-primary:   #e8e8e8;  /* 13.61:1 on #1a1a1a ✓ */
    --color-text-secondary: #a0a0a0;  /* 7.11:1 on #1a1a1a  ✓ */
    --color-text-link:      #66aaff;  /* 5.74:1 on #1a1a1a  ✓ */
    --color-surface:        #1a1a1a;
  }
}
```

---

### 6.10 Forced Colors Mode (High Contrast)

Windows High Contrast Mode and the CSS `forced-colors` media query replace author colors with system-defined colors. Interfaces can break if they rely on `background-color` or `color` for information.

```css
@media (forced-colors: active) {
  .button {
    background-color: ButtonFace;
    color: ButtonText;
    border: 2px solid ButtonBorder;
  }
}

/* Good: outline is forced-colors-safe */
:focus-visible {
  outline: 3px solid Highlight;
  outline-offset: 2px;
}

/* Risk: box-shadow may not render in forced-colors mode */
:focus-visible {
  box-shadow: 0 0 0 3px #0066cc; /* May be suppressed */
}
```

**Testing forced-colors mode:**
- Enable **High Contrast Mode** in Windows Accessibility settings.
- In Chrome DevTools → Rendering panel → "Emulate CSS media feature forced-colors: active".
- In Firefox, type `about:config` → `ui.forcedColors: 1`.

---

### 6.11 Disabled State Contrast

Disabled controls are **exempt** from WCAG 1.4.3 and 1.4.11 contrast requirements. However, the exemption is not a license to make disabled content unreadable. Best practices:

- Provide a clear visual distinction between disabled and enabled states beyond reduced opacity.
- Include a tooltip or instructional text explaining when/why a control is disabled.
- Avoid relying solely on reduced opacity (e.g., `opacity: 0.4`).

```html
<!-- Good: disabled state with explanatory context -->
<button disabled aria-describedby="submit-note">Submit</button>
<p id="submit-note">Complete all required fields to enable the Submit button.</p>
```

---

### 6.12 Testing and Validation Checklist

#### Automated checks

- [ ] Run axe-core `color-contrast` rule against all pages
- [ ] Run `color-contrast-enhanced` rule for AAA coverage
- [ ] Validate focus indicator contrast with `focus-visible` axe rules
- [ ] Integrate contrast checks into CI pipeline using [@axe-core/cli](https://www.npmjs.com/package/@axe-core/cli) or pa11y

#### Manual checks

- [ ] Check text contrast for all text sizes using a contrast checker tool
- [ ] Check non-text contrast for all form controls, icons, and data visualizations
- [ ] Verify focus ring is visible on all interactive elements in default and dark modes
- [ ] Test in Windows High Contrast / forced-colors mode
- [ ] Test with browser zoom at 200% and 400%
- [ ] Review all states: default, hover, focus, active, visited, error, disabled

#### Color-independence check

- [ ] View the page in grayscale and confirm all information conveyed by color is also conveyed by text, icons, or patterns

---

### 6.13 Common Mistakes

| Mistake | Why it fails | Fix |
|:---|:---|:---|
| Removing focus outline with `outline: none` | Focus invisible for keyboard users (2.4.7, 2.4.13) | Replace with visible custom focus style |
| Placeholder text uses low-contrast gray | Placeholder falls below 4.5:1 (1.4.3) | Use a placeholder color ≥ 4.5:1 or place labels outside the field |
| Error states shown only with a red border or red text | Color is sole cue for error (1.4.1) | Add error icon, text label, and `aria-invalid` |
| Contrast checked only in light mode | Dark mode or high contrast mode may fail | Test all modes |
| Gradient background behind text | Contrast varies across the gradient (1.4.3) | Verify contrast at the lowest-contrast region, or use a solid overlay |
| Icon-only buttons with low-contrast icons | Icon fails 3:1 non-text requirement (1.4.11) | Ensure icon color has 3:1 contrast against its background |
| Assuming WCAG pass = APCA pass | The two algorithms disagree for many color combinations | Use this tool to check both |
| SVG `fill` not inheriting theme colors | SVG colors may not adapt in forced-colors mode | Use `currentColor` and CSS variables for SVG fills |

---

### 6.14 WCAG 2.2 Success Criterion Quick Reference

| SC | Title | Level | Summary |
|:---|:---|:---:|:---|
| [1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) | Use of Color | A | Color is not the sole conveyor of information |
| [1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) | Contrast (Minimum) | AA | 4.5:1 normal text; 3:1 large text |
| [1.4.6](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html) | Contrast (Enhanced) | AAA | 7:1 normal text; 4.5:1 large text |
| [1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) | Non-text Contrast | AA | 3:1 for UI components and graphical objects |
| [2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) | Focus Visible | AA | Keyboard focus indicator is visible |
| [2.4.13](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html) | Focus Appearance | AA | Focus indicator must be sufficiently large and high-contrast |

---

## 7. Known limitations

- This project provides guidance and tools for research and education but does not certify accessibility compliance.
- The interactive tool outputs numerical scores and labels — not pass/fail certifications.
- Examples are illustrative and may need adaptation for specific contexts.
- Some visualizations (color swatches, contrast previews) are inherently visual; numeric equivalents are always provided.
- We rely on community feedback to identify gaps and outdated patterns.

## 8. Getting help

- **Questions:** Open a [discussion](https://github.com/mgifford/apca-wcag2/discussions)
- **Bugs or gaps:** Open an [issue](https://github.com/mgifford/apca-wcag2/issues)
- **Contributions:** See [README.md](./README.md)
- **Accommodations:** Request via the `accessibility-accommodation` label on issues

## 9. Continuous improvement

We regularly review and update:
- WCAG conformance as standards evolve
- APCA guidance as the algorithm and W3C Working Draft progress
- Best practices based on community feedback
- Tool recommendations and automation examples
- Inclusive language and terminology

## 10. References

### W3C Specifications

- [WCAG 2.2 Understanding 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)
- [WCAG 2.2 Understanding 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [WCAG 2.2 Understanding 1.4.6 Contrast (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html)
- [WCAG 2.2 Understanding 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- [WCAG 2.2 Understanding 2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)
- [CSS Color Adjust Module Level 1 (`forced-colors`)](https://www.w3.org/TR/css-color-adjust-1/)

### APCA Resources

- [APCA Contrast Calculator](https://apcacontrast.com/)
- [SAPC-APCA GitHub Repository](https://github.com/Myndex/SAPC-APCA)
- [Why APCA](https://github.com/Myndex/SAPC-APCA/blob/master/documentation/WhyAPCA.md)
- [WCAG 3.0 Working Draft](https://www.w3.org/TR/wcag-3.0/)

### Additional Reading

- [WebAIM: Contrast and Color Accessibility](https://webaim.org/articles/contrast/)
- [MDN: Understanding WCAG / Color Contrast](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Understanding_WCAG/Perceivable/Color_contrast)
- [Deque University: Color Contrast Checklist](https://dequeuniversity.com/checklists/web/color-contrast)
- [Sara Soueidan: A guide to designing accessible, WCAG-conformant focus indicators](https://www.sarasoueidan.com/blog/focus-indicators/)
- [Color Contrast Accessibility Best Practices (source template)](https://github.com/mgifford/ACCESSIBILITY.md/blob/main/examples/COLOR_CONTRAST_ACCESSIBILITY_BEST_PRACTICES.md)
- [ACCESSIBILITY.md template](https://github.com/mgifford/ACCESSIBILITY.md)

---

AGPL-3.0-or-later License — See [LICENSE](./LICENSE) file for full text
