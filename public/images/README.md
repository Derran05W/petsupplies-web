# public/images

## hero-placeholder.jpg

Used by the homepage Hero and (until Phase 4) every placeholder product
card.

**Drop a single file here** named `hero-placeholder.jpg` — no code edit
needed. The `<Image>` slot is dimensioned via Tailwind, so the image
just needs to look good cropped to 4:3.

| Property         | Value                                                                         |
| ---------------- | ----------------------------------------------------------------------------- |
| Filename         | `hero-placeholder.jpg`                                                        |
| Aspect           | 4:3 (matches the hero slot)                                                   |
| Recommended size | 1600 × 1200 px                                                                |
| Subject          | Real lifestyle photo of a pet enjoying a meal — warm, natural light, on-brand |
| Format           | JPEG (progressive), ~85 quality                                               |

When the real photo lands, replace this file in-place. The page picks
it up on the next request — no rebuild required for the file itself,
though Vercel will rebuild on commit.
