import { useState, useEffect } from 'react'
import Card from './ui/Card'

export default function Header() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <header className="pt-12 pb-12">
      <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-start">
        <div className="anim-in">
          <div className="status-ribbon mb-6">
            <div className="status-ribbon-item success">
              <span className="status-ribbon-dot" />
              Systems Online
            </div>
            <div className="status-ribbon-item danger">
              <span className="status-ribbon-dot" />
              Threat Detection Active
            </div>
          </div>

          <div className="leading-[0.9] flex items-end gap-2 flex-wrap">
            <h1 className="brand-title">MuleTrace</h1>
            {/* <span className="brand-version">v2.4</span> */}
          </div>

          <p className="brand-sub mt-5 max-w-2xl">
            Autonomous financial crime intelligence for exposing mule chains, circular layering,
            and coordinated ring behavior hidden in transaction networks.
          </p>

          <div className="flex items-center gap-2 mt-6 flex-wrap">
            {['Graph Intelligence', 'Behavioral Signals', 'Ring Attribution', 'Risk Prioritization'].map(tag => (
              <span key={tag} className="chip-muted">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <Card variant="highlighted" className="hidden lg:block min-w-[320px] p-5 anim-in d2">
          <div className="terminal-kicker">System Status</div>
          {[
            { label: 'Engine', value: 'ACTIVE', tone: 'text-emerald-300' },
            { label: 'Model', value: 'GNN-v4.2', tone: 'text-cyan-300' },
            { label: 'Accuracy', value: '97.3%', tone: 'text-amber-300' },
            { label: 'Latency', value: '< 2ms', tone: 'text-emerald-300' },
          ].map(({ label, value, tone }) => (
            <div key={label} className="status-row">
              <span>{label}</span>
              <span className={tone}>{value}</span>
            </div>
          ))}
          <div className="status-time">
            <div>{time.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</div>
            <div>{time.toLocaleTimeString('en-US', { hour12: false })}</div>
          </div>
        </Card>
      </div>
    </header>
  )
}
