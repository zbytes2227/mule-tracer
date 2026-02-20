import { useState } from 'react'
import Badge from './ui/Badge'
import Card from './ui/Card'

const PATTERN_STYLES = {
  smurfing: 'pill-purple',
  layering: 'pill-cyan',
  structuring: 'pill-amber',
  mule_chain: 'pill-rose',
  round_trip: 'pill-emerald',
  default: 'pill-neutral',
}

function getPatternStyle(type) {
  const key = Object.keys(PATTERN_STYLES).find(k => type?.toLowerCase().includes(k)) || 'default'
  return PATTERN_STYLES[key]
}

function getScoreLevel(score) {
  const n = Math.min(100, Math.max(0, Number(score)))
  if (n > 80) return 'critical'
  if (n > 65) return 'high'
  if (n > 50) return 'medium'
  return 'low'
}

function RiskBar({ score }) {
  const level = getScoreLevel(score)
  return (
    <div className="flex items-center gap-3 min-w-32">
      <progress className={`premium-progress ${level}`} value={Number(score) || 0} max="100" />
      <span className={`risk-text ${level}`}>{score}</span>
    </div>
  )
}

export default function FraudRingTable({ rings, onRingSelect, highlightedAccounts = [] }) {
  const [sortKey, setSortKey] = useState('risk_score')
  const [sortDir, setSortDir] = useState('desc')
  const [expanded, setExpanded] = useState(null)

  if (!rings?.length) {
    return (
      <Card className="p-8 text-center">
        <p className="empty-text">No fraud rings detected.</p>
      </Card>
    )
  }

  const handleSort = (k) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else {
      setSortKey(k)
      setSortDir('desc')
    }
  }

  const sorted = [...rings].sort((a, b) => {
    const av = a[sortKey] ?? 0
    const bv = b[sortKey] ?? 0
    if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    return sortDir === 'asc' ? av - bv : bv - av
  })

  const SortBtn = ({ col }) => (
    <span className={`sort-indicator ${sortKey === col ? 'active' : ''}`}>
      {sortKey === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  )

  const isRingActive = (members) =>
    members.length > 0 &&
    members.length === highlightedAccounts.length &&
    members.every(m => highlightedAccounts.includes(m))

  return (
    <Card variant="danger" className="overflow-hidden">
      <div className="panel-head">
        <div>
          <h3 className="panel-title">Detected Fraud Rings</h3>
          <p className="panel-subtitle">{rings.length} criminal network{rings.length !== 1 ? 's' : ''} identified</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {highlightedAccounts.length > 0 && <Badge tone="warning">Ring active on graph</Badge>}
          <Badge tone="danger">Active Threat</Badge>
        </div>
      </div>

      <div className="panel-info">Click any row to highlight that ring&apos;s nodes on the graph above</div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('ring_id')}>Ring ID <SortBtn col="ring_id" /></th>
              <th onClick={() => handleSort('pattern_type')}>Pattern <SortBtn col="pattern_type" /></th>
              <th onClick={() => handleSort('member_count')}>Members <SortBtn col="member_count" /></th>
              <th onClick={() => handleSort('risk_score')}>Risk Score <SortBtn col="risk_score" /></th>
              <th>Member Accounts</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((ring, idx) => {
              const members = Array.isArray(ring.member_accounts)
                ? ring.member_accounts
                : (ring.member_accounts || '').split(',').map(s => s.trim()).filter(Boolean)
              const isExp = expanded === idx
              const display = isExp ? members : members.slice(0, 3)
              const active = isRingActive(members)
              const patternClass = getPatternStyle(ring.pattern_type)

              return (
                <tr
                  key={ring.ring_id ?? idx}
                  onClick={() => onRingSelect?.(members)}
                  className={`table-row-clickable ${active ? 'active' : ''}`}
                >
                  <td>
                    <span className={`ring-id ${active ? 'active' : ''}`}>
                      #{String(ring.ring_id ?? idx + 1).padStart(3, '0')}
                    </span>
                  </td>
                  <td>
                    <span className={`pattern-pill ${patternClass}`}>{ring.pattern_type}</span>
                  </td>
                  <td>
                    <span className="ring-member-count">{ring.member_count ?? members.length}</span>
                  </td>
                  <td>
                    <RiskBar score={ring.risk_score} />
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1.5">
                      {display.map((m, i) => (
                        <span key={i} className={`member-pill ${active ? 'active' : ''}`}>{m}</span>
                      ))}
                      {!isExp && members.length > 3 && (
                        <span className="member-pill">+{members.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      {active ? <span className="row-active">Active</span> : <span className="row-hint">Click to highlight</span>}
                      {members.length > 3 && (
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            setExpanded(isExp ? null : idx)
                          }}
                          className="row-expander"
                        >
                          {isExp ? '↑' : '↓'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="panel-foot">
        {sorted.length} ring{sorted.length !== 1 ? 's' : ''} · click headers to sort · click rows to highlight graph
      </div>
    </Card>
  )
}
