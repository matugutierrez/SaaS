export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-text-secondary text-xs tracking-[0.15em] uppercase mb-1">{label}</label>}
      <input
        className={`w-full px-3 py-2 bg-transparent border text-text text-xs outline-none transition ${
          error ? 'border-accent-terracotta' : 'border-border focus:border-text'
        }`}
        {...props}
      />
      {error && <p className="text-accent-terracotta text-xs mt-1">{error}</p>}
    </div>
  );
}
