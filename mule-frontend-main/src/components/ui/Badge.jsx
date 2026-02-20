export default function Badge({ children, tone = 'default', className = '' }) {
  const tones = {
    default: 'premium-badge premium-badge-default',
    success: 'premium-badge premium-badge-success',
    warning: 'premium-badge premium-badge-warning',
    danger: 'premium-badge premium-badge-danger',
    info: 'premium-badge premium-badge-info',
  }

  return <span className={`${tones[tone] || tones.default} ${className}`}>{children}</span>
}
