const SERVICES = [
  { id: 'mobile', title: 'Mobile Apps', detail: 'iOS & Android' },
  { id: 'ai', title: 'AI Solutions', detail: 'Smarter workflows' },
  { id: 'web', title: 'Web Platforms', detail: 'Scalable & modern' },
  { id: 'automation', title: 'Workflow Automation' },
  { id: 'integrations', title: 'API Integrations' },
  { id: 'cloud', title: 'Cloud Solutions' },
  { id: 'design', title: 'Product Design' },
]

function ServiceIcon({ type }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {type === 'mobile' && <><rect x="11" y="4" width="18" height="32" rx="3" /><path d="M17 8h6M18 31h4" /></>}
      {type === 'ai' && <><path d="M18 8c-4-5-10-1-9 4-5 1-6 7-2 10-3 5 1 10 5 10 1 4 6 5 8 1V8c2-4 7-3 8 1 5 0 8 6 4 10 5 3 3 9-1 10 0 5-7 8-11 3" /><path d="M13 12v5l-3 3M14 25l3-3M26 12v5l4 4M25 25v4M20 15h3M17 29v-4" /></>}
      {type === 'web' && <><path d="m5 14 15-8 15 8-15 8-15-8Zm0 7 15 8 15-8M5 28l15 8 15-8" /></>}
      {type === 'automation' && <><rect x="3" y="15" width="9" height="10" rx="1" /><rect x="28" y="5" width="9" height="10" rx="1" /><rect x="28" y="26" width="9" height="10" rx="1" /><path d="M12 20h8V10h8M20 20v11h8" /></>}
      {type === 'integrations' && <><path d="m14 12-9 8 9 8m12-16 9 8-9 8M23 7l-6 26" /></>}
      {type === 'cloud' && <><path d="M11 30h19a7 7 0 0 0 0-14 11 11 0 0 0-21-3A9 9 0 0 0 11 30Z" /><path d="M15 23h10m-10 4h6" /></>}
      {type === 'design' && <><path d="m7 28 3-9L26 3l10 10-16 16-10 3-3-4Z" /><path d="m22 7 10 10M10 19l10 10M5 37h30" /></>}
    </svg>
  )
}

export default function ServiceBadges({ labelRefs }) {
  return (
    <ul className="uv-hero__services" aria-label="Our services">
      {SERVICES.map((service, index) => (
        <li className={`uv-hero-service uv-hero-service--${service.id}${service.detail ? '' : ' uv-hero-service--compact'}`} key={service.id} ref={(element) => { labelRefs.current[index] = element }}>
          <span className="uv-hero-service__icon"><ServiceIcon type={service.id} /></span>
          <span className="uv-hero-service__copy"><strong>{service.title}</strong>{service.detail && <span>{service.detail}</span>}</span>
        </li>
      ))}
    </ul>
  )
}
