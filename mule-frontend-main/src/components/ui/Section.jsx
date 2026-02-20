export default function Section({ title, subtitle, right, children, className = '' }) {
  return (
    <section className={`premium-section ${className}`}>
      {(title || subtitle || right) && (
        <div className="premium-section-head">
          <div>
            {title && <h2 className="premium-section-title">{title}</h2>}
            {subtitle && <p className="premium-section-subtitle">{subtitle}</p>}
          </div>
          {right && <div className="premium-section-right">{right}</div>}
        </div>
      )}
      {children}
    </section>
  )
}
