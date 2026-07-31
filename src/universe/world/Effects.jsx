import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import { BlendFunction, KernelSize } from 'postprocessing'
import { state } from '../core/store'

// ─────────────────────────────────────────────────────────────────────────────
// The lens.
//
// Bloom is now a *highlight* effect, not a glow filter. At a 0.075 threshold it
// caught every lit surface and saturated whole panels to yellow-white; at 0.85
// it only catches genuine light sources — a specular hit, an emissive core, the
// accent on an active element. That one number was most of the difference
// between "premium" and "neon soup".
//
// Depth of field was removed. Cinematic in the abstract, but half of what this
// site shows is UI that has to be READ — a browser window, a phone screen,
// fifteen logos — and a shallow focal plane softens exactly the content that
// carries the meaning. Chromatic aberration is gone for the same reason: at any
// visible strength it cheapens the image.
// ─────────────────────────────────────────────────────────────────────────────

export default function Effects() {
  const q = state.quality

  if (q === 'low') {
    return (
      <EffectComposer multisampling={0} disableNormalPass>
        <Bloom
          intensity={0.28}
          luminanceThreshold={0.88}
          luminanceSmoothing={0.16}
          kernelSize={KernelSize.MEDIUM}
          mipmapBlur
        />
        <Vignette offset={0.5} darkness={0.42} blendFunction={BlendFunction.NORMAL} />
      </EffectComposer>
    )
  }

  return (
    <EffectComposer multisampling={q === 'high' ? 4 : 0} disableNormalPass>
      {/* Highlights only. */}
      <Bloom
        intensity={0.34}
        luminanceThreshold={0.85}
        luminanceSmoothing={0.14}
        kernelSize={KernelSize.LARGE}
        mipmapBlur
      />

      {/* Gentle — enough to seat the subject, not enough to crush the corners. */}
      <Vignette offset={0.5} darkness={0.45} blendFunction={BlendFunction.NORMAL} />

      {/* Fine grain: film, not coloured speckle. */}
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.07} />
    </EffectComposer>
  )
}
