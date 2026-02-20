import { useState, useEffect } from 'react'

const STEPS = [
  'Parsing transaction CSV...',
  'Building graph topology...',
  'Running PageRank algorithm...',
  'Detecting fraud ring clusters...',
  'Scoring suspicious nodes...',
  'Generating threat report...',
]

export default function LoadingOverlay() {
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setStep(s => Math.min(s + 1, STEPS.length - 1))
      setProgress(p => Math.min(p + Math.random() * 20 + 8, 95))
    }, 380)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="loading-overlay">
      <div className="loading-backdrop" />

      <div className="loading-card">
        <div className="loader-shell">
          <svg className="loader-orbit" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
            <circle cx="48" cy="48" r="44" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="70 206" />
          </svg>
          <svg className="loader-orbit reverse" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="32" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
            <circle cx="48" cy="48" r="32" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="30 170" />
          </svg>
          <div className="loader-core">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
        </div>

        <div className="text-center w-full">
          <div className="loading-title">Analyzing</div>
          <div className="loading-sub">Financial Crime Detection Engine</div>

          <div className="w-full mb-4">
            <div className="flex justify-between text-xs text-[var(--text-soft)] mb-2">
              <span>{STEPS[step]}</span>
              <span className="text-[var(--danger)]">{Math.floor(progress)}%</span>
            </div>
            <progress className="premium-progress critical" value={progress} max="100" />
          </div>

          <div className="text-left space-y-1.5">
            {STEPS.map((s, i) => (
              <div key={s} className={`loader-step ${i < step ? 'done' : i === step ? 'active' : ''}`}>
                <span>{i < step ? '✓' : i === step ? '›' : '·'}</span>
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
