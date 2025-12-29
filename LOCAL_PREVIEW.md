# Local Preview Guide

## To preview before pushing to GitHub:

### Option 1: Python HTTP Server (Recommended)
```bash
cd /Users/mgifford/Documents/GitHub/apca-wcag2
python3 -m http.server 8010
```
Then open: **http://localhost:8010**

### Option 2: Node.js http-server
```bash
npm install -g http-server
cd /Users/mgifford/Documents/GitHub/apca-wcag2
http-server -p 8010
```

### Option 3: Using `npx serve`
```bash
cd /Users/mgifford/Documents/GitHub/apca-wcag2
npx serve -p 8010
```

## What to test locally:

✅ **Visual checks:**
- Logo displays centered above h1
- Social card preview renders correctly
- All controls and buttons work
- Color generator produces valid pairs
- External links (OddContrast, Contrast.tools) work

✅ **Social share preview:**
1. Open DevTools → Network → check assets load
2. Visit https://www.opengraph.xyz/ and paste `http://localhost:8010`
3. Verify OG image shows the branded card (1200×630)

✅ **Keyboard & Accessibility:**
- Tab navigation through all inputs
- Lock checkboxes toggle correctly
- Dropdowns are functional
- Focus indicators visible

✅ **Responsive:**
- Test at 375px, 768px, 1024px widths
- Logo scales properly
- Cards wrap on mobile

## To push after review:
```bash
git push origin main
```

---

**Files staged and ready:**
- `.gitignore` (ignores .DS_Store)
- `assets/logo.svg` (Venn diagram)
- `assets/social-card.svg` (vector card)
- `assets/social-card.png` (LinkedIn-friendly PNG)
- `index.html` (with OG/Twitter meta + logo)
- `script.js` (manual APCA math + filtering)
- `style.css` (footer + Bluesky styling)
