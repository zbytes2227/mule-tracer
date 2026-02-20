export default function ErrorAlert({ message, onDismiss }) {
  return (
    <div className="error-alert">
      <div className="error-icon">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <div className="flex-1">
        <p className="error-title">Detection Engine Error</p>
        <p className="error-msg">{message}</p>
      </div>

      <button onClick={onDismiss} className="error-close" aria-label="Dismiss error">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}
