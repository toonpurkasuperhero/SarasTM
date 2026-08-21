import { CURRENCIES } from '../../lib/constants';
import useCartStore from '../../store/cartStore';

export default function CurrencySelector({ compact = false }) {
  const { currency, setCurrency } = useCartStore();

  return (
    <div className="flex items-center gap-1 bg-paytm-bg rounded-xl p-1">
      {CURRENCIES.map((c) => (
        <button
          key={c.code}
          onClick={() => setCurrency(c.code)}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
            currency === c.code
              ? 'bg-paytm-cyan text-white shadow-sm'
              : 'text-paytm-navy hover:bg-white'
          }`}
        >
          {compact ? c.symbol : c.code}
        </button>
      ))}
    </div>
  );
}
