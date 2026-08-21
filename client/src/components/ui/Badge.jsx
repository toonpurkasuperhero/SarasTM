export default function Badge({ children, variant = 'cyan', className = '' }) {
  const variants = {
    cyan: 'badge-cyan',
    green: 'badge-green',
    navy: 'badge-navy',
    orange: 'badge-orange',
    red: 'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700',
  };
  return (
    <span className={`${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
