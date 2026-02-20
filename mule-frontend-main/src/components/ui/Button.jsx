export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  const base = 'premium-btn'
  const variants = {
    primary: 'premium-btn-primary',
    secondary: 'premium-btn-secondary',
    ghost: 'premium-btn-ghost',
  }
  const sizes = {
    sm: 'premium-btn-sm',
    md: 'premium-btn-md',
    lg: 'premium-btn-lg',
  }

  const resolvedVariant = variants[variant] || variants.primary
  const resolvedSize = sizes[size] || sizes.md

  return (
    <button className={`${base} ${resolvedVariant} ${resolvedSize} ${className}`} {...props}>
      {children}
    </button>
  )
}
