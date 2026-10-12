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
  const domain = new URL(project.links.live).hostname.replace(/^www\./, '')

  return (
    <div className="st-work-visual">
      <div className="st-work-visual__scene" ref={scene}>
        <img className="st-work-visual__setting" src="/visuals/work-studio.webp" alt="" width="1672" height="941" loading="lazy" decoding="async" />
        <div className="st-work-visual__desktop">
          <div className="st-work-visual__swap" key={project.name}>
            <a className="st-work-browser" href={project.links.live} target="_blank" rel="noreferrer noopener" aria-label={`Visit ${project.name} live website`}>
              <div className="st-work-browser__bar" aria-hidden="true"><span className="st-work-browser__dots"><i /><i /><i /></span><span>{domain}</span></div>
              <div className="st-work-browser__screen">
                <img src={preview.desktop} alt={`${project.name}, captured from the live desktop website`} width="1440" height="900" loading="lazy" decoding="async" />
              </div>
            </a>
          </div>
        </div>
        <div className={`st-work-visual__companion${tablet ? ' is-tablet' : ''}`}>
          <div className="st-work-visual__swap st-work-visual__swap--companion" key={project.name}>
            <a className={tablet ? 'st-work-tablet' : 'st-work-phone'} href={project.links.live} target="_blank" rel="noreferrer noopener" aria-label={`Open ${project.name} from the ${tablet ? 'tablet' : 'phone'} preview`}>
              <div className="st-work-companion__screen">
                <img src={preview.mobile || preview.desktop} alt={`${project.name}, captured from the live ${tablet ? 'website' : 'mobile website'}`} width={tablet ? 1440 : 390} height={tablet ? 900 : 844} loading="lazy" decoding="async" />
              </div>
              <span className="st-work-companion__camera" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
