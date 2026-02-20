import { useState } from 'react'
import Badge from './ui/Badge'
import Card from './ui/Card'

function getScoreClass(n) {
  if (n > 80) return 'badge-critical'
  if (n > 65) return 'badge-high'
  if (n > 50) return 'badge-medium'
  return 'badge-low'
}

function getRiskLevel(n) {
  if (n > 80) return 'critical'
  if (n > 65) return 'high'
  if (n > 50) return 'medium'
  return 'low'
}

export default function SuspiciousAccountsPanel({ accounts }) {
  const [selected, setSelected] = useState(null)

  if (!accounts?.length) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <p className="empty-text">No suspicious accounts detected.</p>
      </Card>
    )
  }

  const top10 = [...accounts]
    .sort((a, b) => Number(b.suspicion_score) - Number(a.suspicion_score))
    .slice(0, 10)

  return (
    <Card variant="danger" className="h-[600px] flex flex-col overflow-hidden">
      <div className="panel-head">
        <div>
          <h3 className="panel-title">Threat Actors</h3>
          <p className="panel-subtitle">Top {top10.length} sorted by risk</p>
        </div>
        <Badge tone="danger">Active</Badge>
      </div>

      <div className="flex-1 overflow-y-auto">
        {top10.map((acc, idx) => {
          const score = Number(acc.suspicion_score)
          const isActive = selected === idx
          const patterns = Array.isArray(acc.detected_patterns)
            ? acc.detected_patterns
            : acc.detected_patterns ? [acc.detected_patterns] : []

          return (
            <div key={acc.account_id ?? idx}>
              <button
                onClick={() => setSelected(isActive ? null : idx)}
                className={`account-row flex items-center gap-3 w-full ${isActive ? 'active' : ''}`}
              >
                <div className={`rank-pill ${idx < 3 ? 'top' : ''}`}>{idx + 1}</div>

                <div className="flex-1 min-w-0 text-left">
                  <div className="account-id truncate">{acc.account_id}</div>
                  {acc.name && <div className="account-name truncate">{acc.name}</div>}
                </div>

                <div className="flex items-center gap-2">
                  <span className={`badge ${getScoreClass(score)}`}>{score}%</span>
                  <svg className={`row-caret ${isActive ? 'open' : ''}`} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </button>

              {isActive && (
                <div className="account-expanded">
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-[var(--text-soft)] mb-1.5">
                      <span>Threat Score</span>
                      <span className={`risk-text ${getRiskLevel(score)}`}>{score}%</span>
                    </div>
                    <progress className={`premium-progress ${getRiskLevel(score)}`} value={score} max="100" />
                  </div>

                  {patterns.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-[var(--text-soft)] mb-1.5">Detected Patterns</div>
                      <div className="flex flex-wrap gap-1.5">
                        {patterns.map((p, i) => <span key={i} className="pattern-tag">{p}</span>)}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { l: 'Sent', v: acc.total_sent, prefix: '$' },
                      { l: 'Received', v: acc.total_received, prefix: '$' },
                      { l: 'Txns', v: acc.transaction_count, prefix: '' },
                    ].filter(x => x.v != null).map(({ l, v, prefix }) => (
                      <div key={l} className="account-stat-box">
                        <div className="account-stat-label">{l}</div>
                        <div className="account-stat-value">
                          {prefix}{typeof v === 'number' ? Number(v).toLocaleString() : v}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="panel-foot">Click row to expand details</div>
    </Card>
  )
}
