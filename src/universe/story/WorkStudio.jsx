import { useRef } from 'react'
import useDeviceScroll from './useDeviceScroll.js'

const WORK_MOTION = {
  id: 'work-studio',
  layers: [
    { selector: '.st-work-visual__desktop', lift: -180, spread: 18, turn: -5, depth: 0.9 },
    { selector: '.st-work-visual__companion', lift: -300, spread: -16, turn: 12, depth: 0.82 },
  ],
  resizeSelector: '.st-project',
}

export default function WorkStudio({ project, preview }) {
  const scene = useRef(null)
  useDeviceScroll(scene, WORK_MOTION)
  const tablet = preview.companion === 'tablet'
  const companion = tablet ? 'st-tablet' : 'st-phone'

  return (
    <div className="st-work-visual">
      <div className="st-work-visual__scene" ref={scene}>
        <div className="st-work-visual__desktop">
          <div className="st-work-visual__swap" key={project.name}>
            <a className="st-computer" href={project.links.live} target="_blank" rel="noreferrer noopener" aria-label={`Visit ${project.name} live website`}>
              <div className="st-computer__frame">
                <span className="st-computer__camera" aria-hidden="true" />
                <div className="st-computer__screen">
                  <img src={preview.desktop} alt={`${project.name}, captured from the live desktop website`} width="1440" height="900" loading="lazy" decoding="async" />
                </div>
                <div className="st-computer__chin" aria-hidden="true"><span /></div>
              </div>
              <div className="st-computer__stand" aria-hidden="true" />
              <div className="st-computer__foot" aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className={`st-work-visual__companion${tablet ? ' is-tablet' : ''}`}>
          <div className="st-work-visual__swap st-work-visual__swap--companion" key={project.name}>
            <a className={companion} href={project.links.live} target="_blank" rel="noreferrer noopener" aria-label={`Open ${project.name} from the ${tablet ? 'tablet' : 'phone'} preview`}>
              <div className={`${companion}__screen`}>
                <img src={preview.mobile || preview.desktop} alt={`${project.name}, captured from the live ${tablet ? 'website' : 'mobile website'}`} width={tablet ? 1440 : 390} height={tablet ? 900 : 844} loading="lazy" decoding="async" />
              </div>
              <span className={`${companion}__camera`} aria-hidden="true" />
              {!tablet && <span className="st-phone__button" aria-hidden="true" />}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
