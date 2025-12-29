# Pre-Push Checklist

## ✅ Resolved Issues

### Stashed files
- **Dropped `stash@{0}`:** Old calculator version superseded by newer explorer  
- **Current staged files:** All contain final integrated edits (logo, social metadata, manual APCA math)

### Files Updated
- ✅ **index.html** — Social metadata (OG + Twitter), canonical URL, theme color, logo image
- ✅ **script.js** — Manual APCA/WCAG calculations, color range filtering, local thresholds
- ✅ **style.css** — Footer, Bluesky integration, contrast card styling

### Assets Generated
- ✅ **assets/logo.svg** — Venn diagram mark (4KB, scalable)
- ✅ **assets/social-card.svg** — Vector social preview (4KB)
- ✅ **assets/social-card.png** — Raster PNG for LinkedIn/Twitter (100KB, 1200×630)

### Infrastructure
- ✅ **.gitignore** — Prevents .DS_Store commits
- ✅ **LOCAL_PREVIEW.md** — Setup guide for local server testing

---

## 📋 Before Pushing

1. **Start local server:**
   ```bash
   cd /Users/mgifford/Documents/GitHub/apca-wcag2
   python3 -m http.server 8010
   ```

2. **Visual review:**
   - [ ] Logo displays above heading
   - [ ] All controls render correctly
   - [ ] Generate button works
   - [ ] External links functional
   - [ ] Keyboard navigation works

3. **Social card preview:**
   - [ ] Visit https://www.opengraph.xyz/
   - [ ] Paste `http://localhost:8010`
   - [ ] Verify branded card image shows (1200×630)

4. **Console check:**
   - [ ] No JS errors (F12 → Console)
   - [ ] All assets load (Network tab)
   - [ ] No 404s or CORS issues

---

## 🚀 Ready to Push

Once satisfied with local preview:

```bash
git push origin main
```

This will deploy to: **https://mgifford.github.io/apca-wcag2/**

---

## Social Share Test (Post-Push)

1. **LinkedIn Post Inspector:**
   - URL: `https://mgifford.github.io/apca-wcag2/`
   - Should show branded preview with PNG card

2. **Twitter Card Validator:**
   - URL: `https://mgifford.github.io/apca-wcag2/`
   - Verify card displays correctly

3. **Bluesky Post:**
   - Already integrated with Likes display
   - Post ID: `3m6z6uvvjqc2s`

---

**All files staged. Ready for your local review.**
