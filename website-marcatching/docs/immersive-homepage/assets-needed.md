# Immersive Homepage Asset Requirements

The implementation does not require a binary 3D asset. The Intelligence Core, networks, bars, bridge, particles, and final mark are procedural and production-ready.

CMS imagery should be reviewed before launch. The page safely continues with existing images or branded procedural fallbacks when an image is absent.

## Founder portrait

- Preferred minimum: 1800 × 2400 px, portrait 3:4
- Format: AVIF or WebP source where the CMS pipeline permits; high-quality JPEG is acceptable
- Composition: eye line in upper third, neutral dark environment, clean negative space, no baked-in text
- Color: neutral/low-saturation editorial grade; avoid heavy blue lighting or extreme contrast
- Current behavior: uses `about_config.founder_photo_url`; shows a branded fallback if empty

## Article and editorial images

- Preferred minimum: 1600 × 1200 px, landscape 4:3
- Include meaningful editorial subject matter rather than abstract AI stock art
- Keep the focal subject inside the center 70% for responsive cropping
- Current behavior: uses the first image block in each referenced article

## Product and course covers

- Preferred minimum: 1400 × 1750 px, portrait 4:5, clean background
- Include a flat cover plus optional separate device/interface mockup in the CMS where available
- Current behavior: uses the existing product `image_url` and contains the artwork without destructive cropping

## UMKM documentary imagery

- Preferred minimum: 1800 px on the long edge
- Subjects: real owner, working environment, product/process detail, and customer context
- Required metadata: accurate alt text, business permission, location/context, and photographer/source
- Avoid generic stock photography or AI-generated people presented as real participants
- Current behavior: uses referenced survey/content imagery; shows an explicitly labeled business-diagnosis panel if unavailable

## Social proof and result data

- Supply only verified participant totals, product sales, reach methodology, and dates through `about_config`
- If geographic or time-series datasets become available, provide CSV/JSON with field definitions and update cadence before enabling a live dashboard treatment
- The current implementation deliberately labels values as published CMS totals and estimated reach where applicable
