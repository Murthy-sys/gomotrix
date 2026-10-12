# Overview visual assets

Created for the “Digital products. Built with intent.” section using the built-in `image_gen` tool. No fallback CLI or external image API was used. The existing Trimugo logo is not part of these generated assets.

## Delivered files

| Asset | Workspace path | Dimensions | Size | Notes |
| --- | --- | --- | --- | --- |
| Cinematic office backdrop | `public/visuals/product-studio.webp` | 1672 × 941 | 76,426 bytes | Opaque photographic setting, no text or devices |
| Ceramic assistant robot | `public/visuals/product-robot.webp` | 400 × 600 | 42,706 bytes | Actual alpha transparency preserved by WebP encoder |

Generated PNGs remain at the tool's original destinations:

- `/Users/apple/.codex/generated_images/01a1318b-676f-76c0-90b4-003668a1441c/exec-04a198cb-2c0d-40a6-8a56-3fbd85e0a8db.png`
- `/Users/apple/.codex/generated_images/01a1318b-676f-76c0-90b4-003668a1441c/exec-f1174dda-95a3-4fc9-ab89-c4100d3d5f1a.png`

Optimized using installed `cwebp`. Office: quality 84 at its original resolution. Robot: resized to 400 × 600, quality 86, alpha quality 100. No image content edits or programmatic drawing were performed. Generated images were visually inspected; robot input reports an alpha channel and encoder output explicitly confirms alpha transparency.

The devices use existing project captures in `public/work/`. `lumo-mobile.webp` is an additional authentic 390 × 844 portrait capture of `https://www.lumo.rentals/vehicles`, with the app promotion dismissed and optional cookies declined before capture. Converted with `cwebp` at quality 84. The desktop displays Lisno India and the tablet displays WanderLux Journeys.

## Scroll behavior

`ProductStudio.jsx` uses the existing GSAP integration. ScrollTrigger reads native scroll, leaving Lenis and the original 3D journey in control of navigation. The computer, phone, tablet and robot each lift, rotate and change scale at distinct depths, assemble at the centre, and separate again on exit. The same sequence reverses on upward scrolling and repeats on every visit. Device images remain sharp throughout; no blur or new copy is added. The header and heading are outside this motion sequence.

The mobile layout reduces travel. Reduced motion restores the static complete composition, including when the preference changes at runtime. MatchMedia, ResizeObserver and scheduled refreshes are cleaned up on unmount. No new dependencies or additional canvas are used.

## Verification

- Production build and all 30 existing SEO/navigation tests pass. Local checks cover all 12 generated pages; snap and gallery checks pass. The existing large JavaScript chunk warning remains.
- Browser screenshots inspected at 320, 390, 768, 861, 1024 and 1440 CSS pixels wide, with no horizontal document overflow. Narrow desktop device framing and small-screen title wrapping were corrected during inspection.
- Desktop and mobile scroll positions were exercised in both directions. Device transforms change continuously and return to the same formation; all device filters remain `none`.
- Switching reduced motion on removes the section's ScrollTrigger and restores all device transforms to `none`. Switching back recreates one trigger. Leaving for Privacy removes it; returning creates one instance.
- Original header links and logo, selected-work navigation, Who we are navigation, CEO-first ordering, and contact navigation remain intact. No browser console errors during the final checks.
- Visual/runtime checks used the local Vite development server and emulated viewport sizes. These checks do not establish physical-device frame rates.

## Exact office prompt

```text
Use case: photorealistic-natural
Asset type: wide cinematic website hero background photograph, 16:9 landscape composition.
Primary request: a premium dark contemporary product design office with a beautiful tactile dark wood desk across the lower quarter of the frame. This is an EMPTY setting for later compositing a computer, phone, and tablet in the right half. Do not depict any devices.
Composition: camera at desk height looking slightly downward across the desk. The LEFT 40 percent is very dark charcoal olive negative space with only indistinct atmospheric office shapes, suitable for light typography. The RIGHT 60 percent contains empty desk surface, spacious empty central air above it, distant softly out of focus indoor plants and tall architectural windows near the upper right. Attractive natural depth, never cluttered.
Lighting: soft natural light from windows on the upper right, subtle warm champagne daylight catching the right side of the dark walnut desk, subdued realistic reflections. Deep charcoal olive shadows. Cinematic but physically plausible editorial architectural photography, intentional shallow depth of field, premium materials, photographic detail.
Color palette: nearly black olive, warm walnut, desaturated natural foliage, muted champagne highlights. Restrained and sophisticated.
Constraints: NO computers, phones, tablets, screens, robots, people, chairs in the foreground, logos, symbols, lettering, text, watermarks, charts or graphics. No bright neon, saturated lime, gradients, decorative orbs or added lens flare. The empty right-center and desk must be usable for separate product compositing. Entire image photographic with no overlaid interface.
```

Tool parameter: `transparent_background: false`.

## Exact robot prompt

```text
Use case: stylized-concept
Asset type: transparent isolated premium 3D robot character cutout to composite into a cinematic dark olive office website.
Primary request: a small charming premium assistant robot, full body, standing with feet visible. It has a friendly large rounded ceramic head, dark glossy charcoal visor with two softly illuminated muted warm olive oval eyes, a compact creamy ivory ceramic torso, carefully crafted brushed muted olive metal joints, short arms and legs, small tactile feet. Sophisticated believable manufactured product design with restrained detailing, not a toy covered in symbols.
Composition: three-quarter angle, robot face and body facing slightly toward the left of the image; entire body comfortably within frame with clean margin, one arm in a gentle welcoming half-open gesture, the other naturally at its side. A single isolated character, no accessories.
Lighting: premium realistic 3D product render, soft key light from the upper right with subtle champagne reflections, natural contact shading within the robot, gentle neutral fill on the left, crisp silhouette suitable for compositing over dark background.
Palette: warm ceramic ivory, charcoal visor, desaturated olive brushed metal, subdued olive eyes. No electric blue, neon, lime or rainbow.
Constraints: actual TRANSPARENT BACKGROUND with alpha, no backdrop, no floor, no ground plane, no pedestal, no shadow detached from the character, no props, no screens, no lettering or text, no logos, no watermark. Whole robot including hands and feet must be visible. No other object.
```

Tool parameter: `transparent_background: true`.

