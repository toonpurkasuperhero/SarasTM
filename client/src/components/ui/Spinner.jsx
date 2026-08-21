export default function Spinner({ size = 'md', color = 'cyan' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  const colors = {
    cyan: 'border-paytm-cyan',
    navy: 'border-paytm-navy',
    white: 'border-white',
  };
  return (
    <div className={`${sizes[size]} border-4 ${colors[color]} border-t-transparent rounded-full animate-spin`} />
  );
}
