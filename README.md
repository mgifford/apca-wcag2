# APCA vs WCAG 2.x Contrast Comparison Tool

A Node.js tool to compare contrast calculations between **WCAG 2.x** and **APCA (Accessible Perceptual Contrast Algorithm)** methodologies to identify disagreements between the two systems.

## Overview

This tool generates color combinations and compares how WCAG 2.x and APCA evaluate their contrast ratios. It's designed to help accessibility professionals understand the differences between these two contrast evaluation methods and identify edge cases where they disagree.

**Why this matters:** WCAG 3.0 is expected to include APCA as the new contrast algorithm, replacing the current WCAG 2.x contrast ratio calculations. Understanding where these systems disagree helps prepare for this transition.

## Features

- 🎨 **Visual color preview** in terminal output
- 🔗 **Direct links** to online contrast testing tools
- 📊 **CSV export** for data analysis
- 🎯 **Flexible filtering** (WCAG fails, APCA fails, or all disagreements)
- 🎲 **Multiple color selection modes** (random, fixed backgrounds, custom defaults)
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

# Export results to CSV
node apca-wcag2-diff.mjs --wcag-fails --csv > results.csv

# Use white background instead of black
node apca-wcag2-diff.mjs --bg=fff

# Completely random color combinations
node apca-wcag2-diff.mjs --random
```

## Command Line Options

```
Usage: node apca-wcag2-diff.mjs [options]

Color Selection:
  --fg=COLOR           Force foreground color (e.g., --fg=#ff0000 or --fg=f00)
  --bg=COLOR           Force background color (e.g., --bg=#ffffff or --bg=fff)
  --default-fg=COLOR   Set default foreground color for random combinations
  --default-bg=COLOR   Set default background color (default: #000000)
  --random             Generate completely random fg/bg combinations

Filtering:
  --wcag-fails         Show only combinations where WCAG passes but APCA fails
  --apca-fails         Show only combinations where APCA passes but WCAG fails
  (no filter)          Show all disagreements between WCAG and APCA

Output:
  --csv                Output results in CSV format
  --debug              Show debug information and statistics
  --help, -h           Show help message

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

### Filtering Results

```bash
# Show only cases where WCAG 2.x passes but APCA fails
node apca-wcag2-diff.mjs --wcag-fails

# Show only cases where APCA passes but WCAG 2.x fails (rare!)
node apca-wcag2-diff.mjs --apca-fails --random

# Get debug statistics about result distribution
node apca-wcag2-diff.mjs --debug
```

### CSV Export

```bash
# Export WCAG-fails cases to CSV
node apca-wcag2-diff.mjs --wcag-fails --csv > wcag-fails.csv

# Export random combinations to CSV
node apca-wcag2-diff.mjs --random --csv > random-combinations.csv

# Export with custom background
node apca-wcag2-diff.mjs --bg=f5f5f5 --csv > light-gray-bg.csv
```

## Output Formats

### Terminal Output
Shows colored preview of each color combination plus contrast scores:

```
  #1cc285 on #000000   → WCAG: 9.10 (PASS), APCA Lc: -57.2 (FAIL)
  Test links:
    APCA: https://apcacontrast.com/?BG=000000&TXT=1cc285
    Coolors: https://coolors.co/contrast-checker/000000-1cc285
```

### CSV Output
Structured data perfect for spreadsheet analysis:

```csv
Foreground,Background,WCAG_Score,WCAG_Pass,APCA_Score,APCA_Pass,APCA_Link,Coolors_Link
#b453f7,#000000,5.52,true,-36.9,false,https://apcacontrast.com/?BG=000000&TXT=b453f7,https://coolors.co/contrast-checker/000000-b453f7
```

## Understanding the Results

### Thresholds Used
- **WCAG 2.x**: Contrast ratio ≥ 4.5 (AA standard)
- **APCA**: Lightness contrast (Lc) ≥ 75

### Common Findings
- **WCAG passes, APCA fails**: Common with certain color combinations, especially greens and cyans
- **APCA passes, WCAG fails**: Very rare with random combinations
- **Both fail**: Most random color combinations fail both systems
- **Both pass**: High-contrast combinations typically pass both

### Debug Statistics Example
```
DEBUG STATISTICS (1000 combinations tested):
- WCAG pass + APCA fail: 90
- APCA pass + WCAG fail: 0  
- Both pass: 23
- Both fail: 887
```

## Dependencies

- **Node.js** 18.12.1+ (ES Modules support required)
- **APCA-W3** library for APCA contrast calculations

## Technical Details

### Algorithms Used

**WCAG 2.x Contrast Ratio:**
- Uses relative luminance calculation based on sRGB color space
- Formula: (L1 + 0.05) / (L2 + 0.05) where L1 > L2
- Threshold: 4.5 for AA compliance

**APCA (Accessible Perceptual Contrast Algorithm):**
- Uses perceptual lightness contrast (Lc)
- Accounts for spatial frequency, adaptation, and other visual factors
- Threshold: 75 Lc for this tool's comparison

### Color Processing
- Supports multiple hex formats (3-digit, 6-digit, with/without #)
- Automatic normalization to 6-digit hex format
- sRGB color space processing for APCA compatibility

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

## License

[Include your license here]

## About APCA

APCA is a new contrast algorithm being developed for WCAG 3.0 that aims to provide more accurate contrast predictions based on human vision research. Learn more:

- [APCA Documentation](https://github.com/Myndex/SAPC-APCA)
- [Why APCA](https://github.com/Myndex/SAPC-APCA/blob/master/documentation/WhyAPCA.md)
- [WCAG 3.0 Working Draft](https://www.w3.org/TR/wcag-3.0/)
