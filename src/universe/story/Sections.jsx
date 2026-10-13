import { Head, Reveal, Section } from './parts.jsx'
import { process, team } from '../../data/business.js'

export function Process() {
  return (
    <Section id="process" label="How we work">
      <Head kicker="From first conversation to production" title={<>A clear path.<br /><em>All the way through.</em></>} />
      <ol className="st-steps">
        {process.map((step) => (
          <Reveal as="li" key={step.n} className="st-step">
            <span className="st-step__n">{step.n}</span>
            <h3>{step.title}</h3><p>{step.body}</p>
          </Reveal>
        ))}
      </ol>
      <div className="st-process-note"><span>Working software. Regular demos. A documented handover.</span><span>Built together, at every stage.</span></div>
    </Section>
  )
}

export function Team() {
  return (
    <Section id="team" label="Who we are">
      <div className="st-team">
        <div className="st-team__intro">
          <p className="st-kicker">Who we are</p>
          <h2 className="st-title">Shared craft.<br /><em>Collective purpose.</em></h2>
          <p className="st-lead">{team.body}</p>
          <p className="st-team__wordmark" aria-hidden="true">Trimugo<span>Engineering, together.</span></p>
        </div>
        <div className="st-team__leadership">
          <p className="st-kicker">Our founders</p>
          <ul className="st-team__founders">
            {team.founders.map((founder) => (
              <li key={founder.name} className="st-team__founder">
                <h3 className="st-team__name">{founder.name}</h3>
                <p className="st-team__role">{founder.role}</p>
                {founder.links.length > 0 && <div className="st-team__links">
                  {founder.links.map((link) => <a key={link.href} className="st-text-link" href={link.href} target="_blank" rel="noreferrer noopener" aria-label={`${founder.name} on ${link.label}`}>{link.label}</a>)}
                </div>}
              </li>
            ))}
          </ul>
          <dl className="st-practice">{team.practice.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>
        </div>
      </div>
    </Section>
  )
}
