# Wagon / Slide Visual Convention

The deck uses the train as the navigation metaphor. Each wagon represents one slide. When a wagon opens, the fullscreen slide must feel like the same object expanded, not a random new screen.

## Rule

**The fullscreen slide background color must match the color family of its wagon.**

- Wagon color lives in `src/styles.css` as `.wagon`, `.wagon-1`, `.wagon-2`, etc.
- Slide fullscreen color lives in:
  - `wagonPalettes` in `src/main.tsx`
  - `.wagon-theme-N` in `src/styles.css`

When adding or reordering slides, update both places together.

## Current mapping

- Slide 1 / `.wagon-theme-0`: blue steel — base/default wagon
- Slide 2 / `.wagon-theme-1`: green/teal
- Slide 3 / `.wagon-theme-2`: brown/copper
- Slide 4 / `.wagon-theme-3`: purple
- Slide 5 / `.wagon-theme-4`: maroon/red
- Slide 6 / `.wagon-theme-5`: blue-gray
- Slide 7 wraps to `.wagon-theme-0`

## Why

The user flow is: train overview → selected wagon → fullscreen slide. The color continuity makes the transition understandable and smoother.

Do not introduce arbitrary slide background colors or unrelated wallpapers unless they are heavily tinted by the wagon palette.
