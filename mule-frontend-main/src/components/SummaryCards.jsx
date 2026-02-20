import { useEffect, useState } from 'react'
import Card from './ui/Card'

function formatScanTime(seconds) {
  const s = Number(seconds)
  if (!Number.isFinite(s)) return '—'
  if (s <= 0) return '<0.1s'
  if (s < 1) return `${Math.max(1, Math.round(s * 1000))}ms`
  if (s < 10) return `${s.toFixed(2)}s`
  return `${s.toFixed(1)}s`
}

function AnimatedNumber({ target }) {
  const [val, setVal] = useState(0)

  useEffect(() => {
    const n = parseFloat(String(target).replace(/[^0-9.]/g, ''))
    if (isNaN(n)) {
      setVal(target)
      return
    }

    let start = 0
    const step = n / 40
    const t = setInterval(() => {
      start += step
      if (start >= n) {
        setVal(target)
        clearInterval(t)
      } else {
        setVal(Math.floor(start))
      }
    }, 24)

    return () => clearInterval(t)
  }, [target])

  return <>{val}</>
}

export default function SummaryCards({ summary }) {
  if (!summary) return null

  const riskScore = summary.overall_risk_score ?? 0
  const riskTone = riskScore > 70 ? 'danger' : riskScore > 40 ? 'warning' : 'info'

  const cards = [
    {
      label: 'Total Accounts',
      value: summary.total_accounts ?? 0,
      suffix: '',
      tone: 'info',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      sub: 'nodes analyzed',
    },
    {
      label: 'Transactions',
      value: summary.total_transactions ?? 0,
      suffix: '',
      tone: 'accent',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      sub: 'edges in graph',
    },
    {
      label: 'Flagged',
      value: summary.suspicious_count ?? 0,
      suffix: '',
      tone: 'danger',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
      sub: 'suspicious accounts',
    },
    {
      label: 'Fraud Rings',
      value: summary.fraud_ring_count ?? 0,
      suffix: '',
      tone: 'danger-2',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
      sub: 'detected networks',
    },
    {
      label: 'Risk Score',
      value: riskScore,
      suffix: '%',
      tone: riskTone,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      sub: 'portfolio threat level',
    },
    {
      label: 'Scan Time',
      value: formatScanTime(summary.processing_time),
      suffix: '',
      isString: true,
      tone: 'success',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      sub: 'processing time',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <Card key={card.label} variant="interactive" className={`stat-card-premium anim-in d${index + 1}`}>
          <div className={`stat-icon tone-${card.tone}`}>{card.icon}</div>

          <div className={`stat-value tone-${card.tone}`}>
            {card.isString || typeof card.value === 'string'
              ? card.value
              : <><AnimatedNumber target={card.value} />{card.suffix}</>}
          </div>

          <div className="stat-label">{card.label}</div>
          <div className="stat-sub">{card.sub}</div>
        </Card>
      ))}
    </div>
  )
}
