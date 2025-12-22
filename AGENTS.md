# AGENTS.md

## Project Purpose
apca-wcag2 is a public-facing reference and demonstration project exploring the relationship between the Advanced Perceptual Contrast Algorithm (APCA) and WCAG 2.x contrast requirements.

The project exists to:
- Explain differences between WCAG 2.x contrast ratios and APCA concepts
- Demonstrate contrast calculations and comparisons
- Support learning, discussion, and experimentation

This project is **not** a normative standard, compliance checker, or certification tool.

## Audience and Responsibility
This project is intended for:
- Accessibility practitioners
- Designers and developers
- Standards contributors and reviewers

All outputs are informational and educational.
They must not be presented as definitive accessibility compliance determinations.

Responsibility for interpreting and applying results rests with qualified human experts.

## Scope
The project consists of:
- Explanatory content about contrast models
- Static HTML/CSS/JS tools or demos for contrast comparison
- Client-side calculations only

No server-side processing or authoritative evaluation is assumed unless explicitly documented.

## Conceptual Integrity
The project must preserve clear distinctions between:
- WCAG 2.x contrast ratios
- APCA contrast values
- Draft, experimental, or exploratory guidance

The UI and documentation must avoid implying that APCA results replace or override WCAG 2.x requirements.

Language must clearly indicate when content is:
- Informational
- Experimental
- Draft or exploratory

## UI Contract
The UI must:
- Clearly identify which algorithm is being shown (WCAG 2.x vs APCA)
- Display inputs, assumptions, and outputs explicitly
- Avoid hiding conversions, rounding, or thresholds
- Allow users to adjust inputs and see results change predictably

No UI element may imply pass/fail certification.

## Accessibility Position
Accessibility is a core concern of this project.

The project aims to follow WCAG 2.2 AA patterns where feasible, but does not claim formal conformance.

Given the visual nature of contrast exploration, some visualizations may not be fully accessible. These limitations must be documented.

## Accessibility Expectations (Minimum Bar)

### Structure and Semantics
- Use semantic HTML and landmarks.
- One `<h1>` per page with logical heading hierarchy.
- Inputs and outputs grouped logically.

### Keyboard and Focus
- All interactive elements must be keyboard operable.
- Focus order must follow logical reading order.
- Focus indicators must remain visible.

### Labels, Instructions, and Feedback
- All inputs have programmatic labels.
- Units and meaning of values are clearly explained.
- Results are provided in text, not color alone.

### Dynamic Updates
- Changes to calculated values are perceivable.
- Important updates announced using `aria-live` or `role="status"` where appropriate.

### Color and Perception
- Do not rely on color alone to convey meaning.
- Provide numeric or textual equivalents for visual outputs.

## Error Handling and Reliability
- Invalid inputs must be handled gracefully.
- Errors must be explained in plain language.
- The UI must not fail silently.

## Data Handling and Privacy
- No personal data collection.
- No analytics or tracking by default.
- Any client-side storage must be optional and documented.

## Dependencies
- Prefer minimal, well-understood dependencies.
- Avoid external scripts with unclear provenance.
- Document any third-party libraries used, including purpose and limitations.
- Do not commit secrets or API keys.

## Testing Expectations
Manual testing is required for meaningful changes:
- Keyboard-only interaction testing
- Focus visibility verification
- Verification that results are perceivable without color
- Zoom testing up to 200%

Automated tests are encouraged for calculation logic but do not replace manual review.

## Contribution Standards
Pull requests should include:
- Description of the change and rationale
- Notes on conceptual or explanatory impact
- Notes on accessibility impact
- Documentation of known limitations introduced

## Definition of Done
A change is complete only when:
- Calculations are correct and transparent
- UI behavior is predictable and understandable
- Accessibility has not regressed
- Distinctions between WCAG 2.x and APCA are preserved
- Limitations and assumptions are explicit

## GitHub Pages constraints (required)

All pages must work when hosted under the repository subpath:
- `https://<user>.github.io/<repo>/`

Rules:
- Use relative URLs that respect the repo base path.
  - Prefer `./assets/...` or `assets/...` from the current page.
  - Avoid absolute root paths like `/assets/...` unless you explicitly set and use a base path.
- Navigation links must work from every page (no assumptions about being at site root).
- Do not rely on server-side routing. Every page must be reachable as a real file.
- Avoid build steps unless documented and reproducible. Prefer “works from static files”.
- If using Jekyll:
  - Treat Jekyll processing as optional unless `_config.yml` and layouts are part of the repo.
  - If you use `{{ site.baseurl }}`, use it consistently for links and assets.
- Provide a failure-safe: pages should render a readable error if required data files are missing.

Static asset rules:
- Pin external CDN dependencies (exact versions) and document why each exists.
- Prefer vendoring critical JS/CSS locally to reduce breakage.
- Don’t depend on blocked resources (mixed content, HTTP, or fragile third-party endpoints).

Caching/versioning:
- If you fetch JSON/data files, include a lightweight cache-busting strategy (e.g., query param using a version string) OR document that users must hard refresh after updates.


## Local preview (required before publish)

Test pages via a local HTTP server (not `file://`) to match GitHub Pages behavior.

Examples:
- `python3 -m http.server 8000`
- `npx serve`

Verify:
- links resolve under a subpath
- fetch requests succeed
- no console errors on load

This project values clarity, honesty, and educational usefulness over compliance claims or false certainty.
