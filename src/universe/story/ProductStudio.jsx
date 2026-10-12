import { useRef } from 'react'
import useDeviceScroll from './useDeviceScroll.js'

const DEVICE_MOTION = {
  id: 'product-studio',
  layers: [
    { selector: '.st-studio__computer', lift: -180, spread: -12, turn: -5, depth: 0.87 },
    { selector: '.st-studio__phone', lift: -310, spread: 35, turn: 14, depth: 0.8 },
    { selector: '.st-studio__tablet', lift: -230, spread: -35, turn: -12, depth: 0.86 },
    { selector: '.st-studio__robot', lift: -350, spread: 25, turn: 10, depth: 0.76 },
  ],
  connectionsSelector: '.st-studio__connections',
  resizeSelector: '.st-overview__composition',
}

// Native scroll drives a reversible spatial sequence. GSAP owns only the outer
// layers; the device shells retain their CSS poses. Nothing pins or takes over
// the scroll controller, and the covered WebGL journey remains parked.
export default function ProductStudio() {
  const scene = useRef(null)
  useDeviceScroll(scene, DEVICE_MOTION)

  return (
    <figure className="st-studio" ref={scene} aria-label="Trimugo projects on a computer, mobile phone and tablet, with a small robot">
      <div className="st-studio__connections" aria-hidden="true">
        <svg viewBox="0 0 800 600" fill="none">
          <path d="M90 380V135Q90 115 110 115H310M525 110H700Q725 110 725 135V390M340 420V480Q340 505 365 505H600" />
          <circle cx="90" cy="380" r="4" /><circle cx="310" cy="115" r="4" />
          <circle cx="525" cy="110" r="4" /><circle cx="725" cy="390" r="4" />
        </svg>
      </div>

      <div className="st-studio__computer st-studio__arrival">
        <div className="st-computer">
          <div className="st-computer__frame">
            <span className="st-computer__camera" aria-hidden="true" />
            <div className="st-computer__screen">
              <img src="/work/lisno-india.webp" alt="Lisno India's interiors website on the desktop display" width="1440" height="900" loading="lazy" decoding="async" />
            </div>
            <div className="st-computer__chin" aria-hidden="true"><span /></div>
          </div>
          <div className="st-computer__stand" aria-hidden="true" />
          <div className="st-computer__foot" aria-hidden="true" />
        </div>
      </div>

      <div className="st-studio__phone st-studio__arrival">
        <div className="st-phone">
          <div className="st-phone__screen">
            <img src="/work/lumo-mobile.webp" alt="Lumo Rentals' mobile booking website on the phone" width="390" height="844" loading="lazy" decoding="async" />
          </div>
          <span className="st-phone__camera" aria-hidden="true" />
          <span className="st-phone__button" aria-hidden="true" />
        </div>
      </div>

      <div className="st-studio__tablet st-studio__arrival">
        <div className="st-tablet">
          <span className="st-tablet__camera" aria-hidden="true" />
          <div className="st-tablet__screen">
            <img src="/work/wanderlux-journeys.webp" alt="WanderLux Journeys' interactive travel experience on the tablet" width="1440" height="900" loading="lazy" decoding="async" />
          </div>
        </div>
      </div>

      <div className="st-studio__robot st-studio__arrival">
        <img src="/visuals/product-robot.webp" alt="A small ceramic robot with olive details" width="400" height="600" loading="lazy" decoding="async" />
      </div>
    </figure>
  )
}
