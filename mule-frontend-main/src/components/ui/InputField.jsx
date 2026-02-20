export default function InputField({ label, hint, className = '', ...props }) {
  return (
    <label className={`premium-input-wrap ${className}`}>
      {label && <span className="premium-input-label">{label}</span>}
      <input className="premium-input" {...props} />
      {hint && <span className="premium-input-hint">{hint}</span>}
    </label>
  )
}
