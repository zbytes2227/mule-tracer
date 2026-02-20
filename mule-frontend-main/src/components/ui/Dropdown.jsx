import { useState } from 'react'

export default function Dropdown({ label, value, options = [], onChange, className = '' }) {
  const [open, setOpen] = useState(false)
  const active = options.find(o => o.value === value) || options[0]

  return (
    <div className={`premium-dropdown ${className}`}>
      <button
        className="premium-dropdown-trigger"
        onClick={() => setOpen(v => !v)}
        type="button"
        aria-expanded={open}
      >
        <span className="premium-dropdown-label">{label}</span>
        <span className="premium-dropdown-value">{active?.label}</span>
        <svg className={`premium-dropdown-chevron ${open ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="premium-dropdown-menu">
          {options.map(option => (
            <button
              key={option.value}
              className={`premium-dropdown-item ${value === option.value ? 'active' : ''}`}
              onClick={() => {
                onChange?.(option.value)
                setOpen(false)
              }}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
