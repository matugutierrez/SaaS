export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'px-4 py-2 text-xs font-sans tracking-[0.15em] uppercase transition disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-text text-page border border-border',
    secondary: 'bg-transparent text-text-secondary border border-border',
    danger: 'text-accent-terracotta border border-border',
    ghost: 'text-text-secondary hover:text-text',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
