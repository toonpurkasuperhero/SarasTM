export default function Button({ children, variant = 'primary', size = 'md', className = '', disabled, onClick, type = 'button', ...props }) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'bg-red-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-red-600 active:scale-95 transition-all duration-150',
  };
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: '',
    lg: 'px-8 py-4 text-lg',
  };
  return (
    <button
      type={type}
      className={`${variants[variant]} ${size !== 'md' ? sizes[size] : ''} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
