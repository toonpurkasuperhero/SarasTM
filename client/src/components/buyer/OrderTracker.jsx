import { ORDER_STATUSES } from '../../lib/constants';

export default function OrderTracker({ currentStatus }) {
  const currentIndex = ORDER_STATUSES.findIndex((s) => s.key === currentStatus);

  return (
    <div className="relative">
      <div className="flex items-start justify-between relative">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0">
          <div
            className="h-full bg-paytm-cyan transition-all duration-700"
            style={{ width: `${(currentIndex / (ORDER_STATUSES.length - 1)) * 100}%` }}
          />
        </div>

        {ORDER_STATUSES.map((status, index) => {
          const isDone = index <= currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <div key={status.key} className="flex flex-col items-center relative z-10 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isDone
                    ? 'bg-paytm-cyan text-white shadow-md'
                    : 'bg-gray-200 text-gray-400'
                } ${isCurrent ? 'ring-4 ring-paytm-cyan/30' : ''}`}
              >
                {isDone ? '✓' : index + 1}
              </div>
              <p className={`text-xs mt-2 text-center font-medium ${isDone ? 'text-paytm-navy' : 'text-gray-400'}`}>
                {status.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
