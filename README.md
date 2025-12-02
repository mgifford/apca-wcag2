# APCA vs WCAG 2.- ⚙️ **Configurable thresholds** (both WCAG and APCA thresholds can be adjusted)
- 🎲 **Multiple color selection modes** (random, fixed backgrounds, custom defaults)
- 🔧 **Flexible color format support** (3-digit, 6-digit, with/without #)
- 📈 **Debug statistics** for understanding result distributions
- 👁️ **Color blindness simulation** (protanopia, deuteranopia, tritanopia for universal accessibility testing)ntrast Comparison Tool

A Node.js tool to compare contrast calculations between **WCAG 2.x** and **APCA (Accessible Perceptual Contrast Algorithm)** methodologies to identify disagreements between the two systems.

## Overview

This tool generates color combinations and compares how WCAG 2.x and APCA evaluate their contrast ratios. It's designed to help accessibility professionals understand the differences between these two contrast evaluation methods and identify edge cases where they disagree.

**Why this matters:** WCAG 3.0 is expected to include APCA as the new contrast algorithm, replacing the current WCAG 2.x contrast ratio calculations. Understanding where these systems disagree helps prepare for this transition.

## Features

- 🎨 **Visual color preview** in terminal output
- 🔗 **Direct links** to online contrast testing tools
- 📊 **CSV export** for data analysis
- 🎯 **Advanced filtering** (WCAG fails, APCA fails, both pass, or all disagreements)
- � **Color range targeting** (focus on specific color families like greens, warm colors, etc.)
- ⚙️ **Configurable thresholds** (both WCAG and APCA thresholds can be adjusted)
- �🎲 **Multiple color selection modes** (random, fixed backgrounds, custom defaults)
- 🔧 **Flexible color format support** (3-digit, 6-digit, with/without #)
- 📈 **Debug statistics** for understanding result distributions

## Quick Start

```bash
# Clone the repository
git clone https://github.com/mgifford/apca-wcag2.git
cd apca-wcag2

# Install dependencies
npm install

# Run with default settings (random foregrounds on black background)
node apca-wcag2-diff.mjs

# Show only cases where WCAG passes but APCA fails
node apca-wcag2-diff.mjs --wcag-fails

# Find color combinations that pass both systems
node apca-wcag2-diff.mjs --both-pass

# Focus on green color combinations
node apca-wcag2-diff.mjs --color-range=green --both-pass

# Export results to CSV
node apca-wcag2-diff.mjs --wcag-fails --csv > results.csv

# Use AAA threshold for WCAG
node apca-wcag2-diff.mjs --wcag-threshold=7.0 --both-pass

# Test color combinations for color blindness accessibility
node apca-wcag2-diff.mjs --color-blind=deuteranopia --color-range=green

# Export color blindness test results
node apca-wcag2-diff.mjs --color-blind=protanopia --csv > colorblind-results.csv
```

## Command Line Options

```
Usage: node apca-wcag2-diff.mjs [options]

Color Selection:
  --fg=COLOR           Force foreground color (e.g., --fg=#ff0000 or --fg=f00)
  --bg=COLOR           Force background color (e.g., --bg=#ffffff or --bg=fff)
  --default-fg=COLOR   Set default foreground color for random combinations
  --default-bg=COLOR   Set default background color (default: #000000)
  --color-range=RANGE  Generate colors within specific range (see Color Ranges below)
  --random             Generate completely random fg/bg combinations

Thresholds:
  --wcag-threshold=NUM Set WCAG contrast threshold (default: 4.5, options: 3.0, 4.5, 7.0)
  --apca-threshold=NUM Set APCA Lc threshold (default: 60, normal text minimum)

Filtering:
  --wcag-fails         Show only combinations where WCAG passes but APCA fails
  --apca-fails         Show only combinations where APCA passes but WCAG fails
  --both-pass          Show only combinations where both WCAG and APCA pass
  (no filter)          Show all disagreements between WCAG and APCA

Accessibility:
  --color-blind=TYPE   Simulate color blindness (protanopia, deuteranopia, tritanopia)

Output:
  --csv                Output results in CSV format
  --debug              Show debug information and statistics
  --help, -h           Show help message

Color Ranges:
  red, green, blue     Primary color ranges
  orange, purple       Secondary color ranges  
  yellow, cyan         Bright color ranges
  gray                 Grayscale colors
  warm, cool           Temperature-based ranges

WCAG Threshold Options:
  3.0   - AA Large text minimum (18pt+ regular, 14pt+ bold)
  4.5   - AA Normal text minimum (default)
  7.0   - AAA contrast standard

APCA Threshold Guidelines:
  15   - Large text (24px+ regular, 18.7px+ bold)
  30   - Medium text (18px+ regular, 14px+ bold)  
  45   - Small text (16px regular, 12px+ bold)
  60   - Normal body text (default, 14-16px regular)
  75   - Small body text (12-14px regular)
  90   - Very small text (under 12px)

Color Blindness Types:
  protanopia     - Red-blind (affects ~1% of males)
  deuteranopia   - Green-blind (affects ~5% of males, most common)
  tritanopia     - Blue-blind (affects ~0.01%, very rare)

Color Formats Supported:
  #ffffff, ffffff, #fff, fff, #f0f0f0, f0f0f0
```

## Examples

### Basic Usage

```bash
# Find disagreements with random colors on black background
node apca-wcag2-diff.mjs

# Find disagreements with random colors on white background  
node apca-wcag2-diff.mjs --bg=ffffff

# Test specific color combination
node apca-wcag2-diff.mjs --fg=666666 --bg=ffffff
```

### Color Range Targeting

```bash
# Focus on green color combinations
node apca-wcag2-diff.mjs --color-range=green

# Find accessible warm color combinations
node apca-wcag2-diff.mjs --color-range=warm --both-pass

# Test orange colors that pass both systems
node apca-wcag2-diff.mjs --color-range=orange --both-pass --csv

# Explore grayscale accessibility
node apca-wcag2-diff.mjs --color-range=gray --wcag-threshold=3.0
```

### Threshold Customization

```bash
# Use AA Large text threshold (more permissive)
node apca-wcag2-diff.mjs --wcag-threshold=3.0 --both-pass

# Use AAA threshold (most strict)
node apca-wcag2-diff.mjs --wcag-threshold=7.0 --both-pass

# Adjust APCA threshold for small text
node apca-wcag2-diff.mjs --apca-threshold=45 --wcag-fails

# Compare different thresholds
node apca-wcag2-diff.mjs --wcag-threshold=3.0 --apca-threshold=30 --debug
```

### Advanced Filtering

```bash
# Show only cases where WCAG 2.x passes but APCA fails
node apca-wcag2-diff.mjs --wcag-fails

# Show only cases where APCA passes but WCAG 2.x fails
node apca-wcag2-diff.mjs --apca-fails --random

# Find combinations that pass both systems
node apca-wcag2-diff.mjs --both-pass

# Debug statistics about result distribution
node apca-wcag2-diff.mjs --debug --color-range=blue
```

### CSV Export and Analysis

```bash
# Export accessible green combinations for designers
node apca-wcag2-diff.mjs --color-range=green --both-pass --csv > accessible-greens.csv

# Export WCAG-fails cases for analysis
node apca-wcag2-diff.mjs --wcag-fails --csv > wcag-apca-disagreements.csv

# Export AAA-compliant color combinations
node apca-wcag2-diff.mjs --wcag-threshold=7.0 --both-pass --csv > aaa-colors.csv

# Generate warm color palette that passes both systems
node apca-wcag2-diff.mjs --color-range=warm --both-pass --wcag-threshold=3.0 --csv > warm-palette.csv
```

### Color Blindness Testing

```bash
# Test color combinations for deuteranopia (green-blindness, most common)
node apca-wcag2-diff.mjs --color-blind=deuteranopia

# Test red colors for protanopia (red-blindness)
node apca-wcag2-diff.mjs --color-range=red --color-blind=protanopia

# Test blue/yellow combinations for tritanopia (blue-blindness)
node apca-wcag2-diff.mjs --color-range=blue --color-blind=tritanopia

# Export color blindness accessibility report
node apca-wcag2-diff.mjs --color-blind=deuteranopia --csv > deuteranopia-test.csv

# Test specific brand colors for all color blindness types
node apca-wcag2-diff.mjs --fg=#d32f2f --bg=#ffffff --color-blind=deuteranopia
```

```

## Output Formats

### Terminal Output
Shows colored preview of each color combination plus contrast scores:

```
  #1cc285 on #000000   → WCAG: 9.10 (PASS), APCA Lc: -57.2 (FAIL)
  Test links:
    https://apcacontrast.com/?BG=000000&TXT=1cc285
    https://coolors.co/contrast-checker/000000-1cc285
```

**With Color Blindness Simulation:**
```
  #31bf1b on #000000   → WCAG: 6.71 (PASS), APCA Lc: -43.9 (FAIL)
  deuteranopia:   #665c4c on #000000   → WCAG: 3.44 (FAIL), APCA Lc: -20.8 (FAIL)
  Test links:
    https://apcacontrast.com/?BG=000000&TXT=31bf1b
    https://coolors.co/contrast-checker/000000-31bf1b
```

### CSV Output
Structured data perfect for spreadsheet analysis:

```csv
Foreground,Background,WCAG_Score,WCAG_Pass,APCA_Score,APCA_Pass,APCA_Link,Coolors_Link
#b453f7,#000000,5.52,true,-36.9,false,https://apcacontrast.com/?BG=000000&TXT=b453f7,https://coolors.co/contrast-checker/000000-b453f7
```

**With Color Blindness Simulation:**
```csv
Foreground,Background,WCAG_Score,WCAG_Pass,APCA_Score,APCA_Pass,ColorBlind_Type,ColorBlind_Color,ColorBlind_WCAG,ColorBlind_WCAG_Pass,ColorBlind_APCA,ColorBlind_APCA_Pass,APCA_Link,Coolors_Link
#31bf1b,#000000,6.71,true,-43.9,false,deuteranopia,#665c4c,3.44,false,-20.8,false,https://apcacontrast.com/?BG=000000&TXT=31bf1b,https://coolors.co/contrast-checker/000000-31bf1b
```

## Understanding the Results

### Default Thresholds
- **WCAG 2.x**: Contrast ratio ≥ 4.5 (AA standard, configurable: 3.0, 4.5, 7.0)
- **APCA**: Lightness contrast (Lc) ≥ 60 (normal text, configurable: 15-90)

### Filter Results
- **`--wcag-fails`**: Shows combinations where WCAG passes but APCA fails
- **`--apca-fails`**: Shows combinations where APCA passes but WCAG fails  
- **`--both-pass`**: Shows combinations that pass both systems (great for finding accessible colors)
- **No filter**: Shows all disagreements between the two systems

### Color Range Results
- **Green/Cyan ranges**: Often show WCAG pass + APCA fail patterns
- **Red/Orange ranges**: Good for finding both-pass combinations
- **Gray range**: Useful for testing neutral palettes
- **Warm/Cool ranges**: Temperature-based design exploration

### Common Findings by Threshold
**Standard (WCAG 4.5, APCA 60):**
- WCAG passes, APCA fails: Common (especially greens)
- APCA passes, WCAG fails: Rare
- Both pass: High-contrast combinations
- Both fail: Most random combinations

**Relaxed (WCAG 3.0, APCA 30):**
- More APCA pass + WCAG fail cases emerge
- Useful for large text scenarios
- Higher both-pass rates

**Strict (WCAG 7.0, APCA 75):**
- Very few both-pass combinations
- Useful for AAA compliance testing

### Color Blindness Testing Results
- **Protanopia (red-blind)**: Reds often shift to browns/yellows, can improve or worsen contrast
- **Deuteranopia (green-blind)**: Greens become dark purples/browns, often causes dramatic contrast failures
- **Tritanopia (blue-blind)**: Blues shift to teals/cyans, sometimes improves contrast unexpectedly
- **Universal Design**: Colors that pass normal vision + color blindness simulation ensure maximum accessibility

### Debug Statistics Example
```
DEBUG STATISTICS (1000 combinations tested):
- WCAG threshold: 4.5
- APCA threshold: 60
- Color range: green
- WCAG pass + APCA fail: 125
- APCA pass + WCAG fail: 3
- Both pass: 87
- Both fail: 785
```

## Dependencies

- **Node.js** 18.12.1+ (ES Modules support required)
- **APCA-W3** library for APCA contrast calculations

## Technical Details

### Algorithms Used

**WCAG 2.x Contrast Ratio:**
- Uses relative luminance calculation based on sRGB color space
- Formula: (L1 + 0.05) / (L2 + 0.05) where L1 > L2
- Configurable thresholds: 3.0 (AA Large), 4.5 (AA), 7.0 (AAA)

**APCA (Accessible Perceptual Contrast Algorithm):**
- Uses perceptual lightness contrast (Lc)
- Accounts for spatial frequency, adaptation, and other visual factors
- Configurable thresholds: 15-90 Lc based on text size and weight

### Color Range Processing
- **Primary colors**: Emphasize single color channels (pure reds, greens, blues)
- **Secondary colors**: Combine two primary channels (orange, purple, yellow, cyan)
- **Temperature ranges**: Warm (red/yellow bias) vs Cool (blue/cyan bias)
- **Grayscale**: Equal RGB values for neutral testing
- **Custom ranges**: Mathematically defined color boundaries for targeted testing

### Color Processing
- Supports multiple hex formats (3-digit, 6-digit, with/without #)
- Automatic normalization to 6-digit hex format
- sRGB color space processing for APCA compatibility
- Color range algorithms generate targeted RGB values within specified bounds

### Color Blindness Simulation
- **Scientific Accuracy**: Uses Brettel/Viénot/Mollon and Machado transformation matrices
- **Three Types**: Protanopia (red-blind), Deuteranopia (green-blind), Tritanopia (blue-blind)
- **Real-time Transformation**: Original colors are mathematically transformed to simulate color vision deficiency
- **Dual Analysis**: Shows both original and simulated color contrast scores for comprehensive accessibility testing

## Use Cases

### For Designers
- **Palette Generation**: Use `--both-pass` with color ranges to find accessible color families
- **Brand Color Testing**: Test specific brand colors against both systems
- **Threshold Exploration**: Compare AA vs AAA compliance rates for different color strategies
- **Universal Design**: Use `--color-blind` to ensure colors work for all vision types

### For Developers
- **CSV Export**: Generate data for automated testing or design system validation
- **Edge Case Discovery**: Find problematic color combinations before they reach production
- **Accessibility Auditing**: Compare current WCAG compliance with future APCA standards
- **Color Blindness QA**: Systematically test UI elements for color vision deficiency compatibility

### For Researchers
- **Algorithm Comparison**: Study systematic differences between WCAG 2.x and APCA
- **Threshold Analysis**: Understand impact of different accessibility standards
- **Color Psychology**: Explore how color temperature affects accessibility compliance
- **Vision Science**: Analyze how color blindness affects contrast perception using scientific transformation models

## Contributing

This tool is designed for accessibility research and education. Contributions welcome for:

- Additional output formats
- Different threshold testing
- Performance optimizations
- Extended color format support

## Related Tools

- [APCA Contrast Calculator](https://apcacontrast.com/) - Official APCA testing tool
- [Coolors Contrast Checker](https://coolors.co/contrast-checker/) - Popular contrast testing tool
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - WCAG 2.x contrast testing
- [Mydex Bridge](https://github.com/Myndex/bridge-pca)

## License

[Include your license here]

## About APCA

APCA is a new contrast algorithm being developed for WCAG 3.0 that aims to provide more accurate contrast predictions based on human vision research. Learn more:

- [APCA Documentation](https://github.com/Myndex/SAPC-APCA)
- [Why APCA](https://github.com/Myndex/SAPC-APCA/blob/master/documentation/WhyAPCA.md)
- [WCAG 3.0 Working Draft](https://www.w3.org/TR/wcag-3.0/)
