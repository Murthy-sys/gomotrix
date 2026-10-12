# Earth hero assets

Acquired and optimized on 2026-10-13. These are geographic imagery textures, not AI-generated geography. All runtime files are served locally from `public/visuals/earth/`.

| Asset | Dimensions | Bytes | Purpose |
| --- | --- | ---: | --- |
| `earth-day.webp` | 2048 × 1024 | 175,556 | Earth color map, sRGB |
| `earth-clouds.webp` | 1024 × 512 | 92,322 | Grayscale alpha map: black is clear, white is cloud |
| `earth-night.webp` | 2048 × 1024 | 171,430 | Optional city-light map, sRGB |
| `earth-poster.webp` | 1024 × 1024 | 141,810 | Static eastern hemisphere fallback |

## Sources and attribution

The day map is Solar System Scope / INOVE's map, distributed in the [official Three.js Earth example](https://github.com/mrdoob/three.js/blob/dev/examples/webgpu_tsl_earth.html). [Solar System Scope](https://www.solarsystemscope.com/textures/) describes the Earth maps as combinations of geographic data and NASA Blue Marble imagery, distributed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Preserve the supplied public credit file when publishing.

Cloud and night maps were downloaded from the [official Three.js planetary texture collection](https://github.com/mrdoob/three.js/tree/dev/examples/textures/planets), specifically `earth_clouds_1024.png` and `earth_lights_2048.png`. The repository MIT license is saved locally. No separate upstream attribution for these older example files was present in that directory.

The fallback is [NASA's Blue Marble eastern hemisphere image](https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57723/globe_east_2048.jpg). NASA's [media usage guidance](https://www.nasa.gov/nasa-brand-center/images-and-media/) allows factual uses without suggesting endorsement. The image contains neither people nor NASA logos. The poster has a black outer background; use a circular CSS crop, with a slight image scale if needed, against the hero's ivory background.

Full source URLs, changes, and attribution are also included in `public/visuals/earth/ATTRIBUTION.txt`; the Three.js license is in `THREE-LICENSE.txt`.

## Processing

Existing system `cwebp` was used; no dependencies were installed. The day map was downscaled from 4096 × 2048 at quality 86, clouds encoded at quality 90 with alpha blended onto black, night encoded at quality 90, and the NASA poster downscaled from 2048 square at quality 85. All use method 6. No geographic features were drawn or synthesized.

## SHA-256

```text
earth-day.webp     790c529a46421257025ac4917c72efcc25a1dfde582dbcf62061dfaabf1b0772
earth-clouds.webp  2ce5d90d5d964e5d462fec16488e4162e522234f63a0f91f28a583be03750858
earth-night.webp   733e32f8fa0029620fe7431c3185c672fc3717dc6706fc8373aaeac441681296
earth-poster.webp  65d21861f4509eff57e1c3d1873b15697f8492883ed522678542ed9fd5be8527
```
