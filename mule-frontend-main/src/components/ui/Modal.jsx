export default function Modal({ open, title, children, onClose }) {
  if (!open) return null

  return (
    <div className="premium-modal-overlay" onClick={onClose}>
      <div className="premium-modal" onClick={e => e.stopPropagation()}>
        <div className="premium-modal-head">
          <h3 className="premium-modal-title">{title}</h3>
          <button className="premium-modal-close" onClick={onClose} aria-label="Close modal">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="premium-modal-body">{children}</div>
      </div>
    </div>
  )
}
