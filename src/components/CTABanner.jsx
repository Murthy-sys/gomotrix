import { Calendar, ArrowRight } from 'lucide-react'
import Reveal from './Reveal.jsx'

export default function CTABanner() {
  return (
    <section className="py-12">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-brand-900 px-7 py-14 text-center sm:px-12">
            <div className="absolute inset-0 bg-grid-dark bg-[size:38px_38px] opacity-25 [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
            <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-amber-500/15 blur-[110px]" />
            <div className="absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-brand-400/20 blur-[110px]" />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-[2.6rem] sm:leading-[1.1]">
                Ready to transform your business?
              </h2>
              <p className="mt-4 text-lg text-slate-300">
                Join the businesses already growing faster with Trimugo as their technology partner.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <a href="#contact" className="btn-primary text-base">
                  <Calendar size={18} /> Book Free Consultation
                </a>
                <a href="#solutions" className="btn border border-white/30 text-white hover:bg-white/10">
                  Explore Solutions <ArrowRight size={18} />
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
