export default function Card({ children, className = '', hover = false, onClick }) {
  return (
    <div
      className={`${hover ? 'card-hover' : 'card'} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
