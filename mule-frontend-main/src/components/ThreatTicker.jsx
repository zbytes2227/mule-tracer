import { useState, useEffect } from 'react'

const ALERTS = [
  'Circular transfer pattern detected in node cluster 7F-44',
  'High velocity micro-transactions flagged for ACC-3812',
  'Model refresh completed for anomaly profile v4.2.1',
  'Smurfing behavior active across three linked accounts',
  'Suspicious offshore route detected with high-value chain',
]

export default function ThreatTicker() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % ALERTS.length), 4200)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="ticker-wrap">
      <div className="max-w-[1500px] mx-auto px-5 md:px-8 py-2.5 flex items-center gap-4">
        <div className="ticker-flag">
          <span className="ticker-live">LIVE</span>
          <span className="ticker-label">Incident Feed</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <p key={idx} className="ticker-message anim-in">{ALERTS[idx]}</p>
        </div>
        <span className="ticker-time">{new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
      </div>
    </div>
  )
}
