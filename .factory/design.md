# Keyboard Route Check — visual thesis

## Direction

**Cassette-era zine.** A keyboard route is a recorded sequence, so the product
looks like a field tape: numbered clips on warm recycled paper, a black tape
window, hard ink outlines, and a signal-red mark for defects. It makes a dry
audit feel like a concrete piece of evidence someone can pass to a teammate.
This is deliberately not a soft dashboard or a generic accessibility scanner.

## Tokens

- Background: `#f4ecd8` (paper)
- Surface: `#fff9ea` (label stock)
- Ink: `#17211c` (near-black green)
- Muted ink: `#49544c`
- Tape: `#20231f`
- Acid lime: `#b9df49` (current focus and confirmation)
- Signal red: `#b42a35` (a finding)
- Ochre: `#d49431` (caution)
- Spacing: an 8px rhythm: 8, 16, 24, 32, 48, 64, 96.

The product is intentionally single-mode. Paper is painted explicitly; the
high-contrast ink, red, and lime marks keep every interface state legible.

## Type and shapes

`ui-monospace` is the route counter and metadata voice. `Georgia` is the
editorial headline and explanation voice. Both are local system fonts, so no
font request or third-party CDN is needed. UI is dense but body text stays at
16px or above. Elements use square corners, 2px ink outlines, offset tape-like
shadows, and torn-edge separators made with CSS.

## Motion

The active route clip advances with a 180ms horizontal nudge, like tape moving
past a play head. Findings stamp in with a brief opacity change. Under
`prefers-reduced-motion`, all state changes are instant. Nothing loops.

## Art direction and asset plan

Hero art shows an original overhead cassette tape with a punched paper route
label and small focus-ring symbols. It provides context, not readable UI text.
Generated artwork is a decorative scene; the route report itself is real HTML.

Prompt sheet:

> Use case: stylized-concept. Asset type: landing hero and social card. Primary
> request: an overhead editorial still life of a translucent smoky black audio
> cassette on warm recycled cream paper, its hand-cut label marked only by
> abstract numbered focus rings and route arrows. Style/medium: 1980s indie
> accessibility zine, screen-print ink and halftone grain, tactile paper and
> plastic. Lighting/mood: late afternoon desk light, deliberate and practical.
> Color palette: cream, charcoal green-black, acid lime, signal red, ochre.
> Composition: wide landscape, cassette right of center with quiet paper space
> at left. Constraints: no letters, no words, no logos, no brands, no people,
> no watermark, no UI screenshots.

Asset provenance: generated with the factory image deployment through
`/opt/fleet/lib/gen-image.sh` on 2026-08-28. The selected asset is original to
this product and is optimized to WebP for delivery. `public/social-card.webp`
is a 1200×630 center crop made from that reviewed hero asset on 2026-08-29;
it supplies the matching social card for every public route.
