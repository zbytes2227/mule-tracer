export default function Card({
  children,
  variant = 'standard',
  className = '',
  as: Tag = 'div',
  ...props
}) {
  const variants = {
    standard: 'premium-card',
    interactive: 'premium-card premium-card-interactive',
    highlighted: 'premium-card premium-card-highlighted',
    danger: 'premium-card premium-card-danger',
  }

  return (
    <Tag className={`${variants[variant] || variants.standard} ${className}`} {...props}>
      {children}
    </Tag>
  )
}
