import { useState, useRef, useEffect } from 'react';

export default function BeforeAfterSlider({ beforeUrl, afterUrl }) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const getPos = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const pos = ((clientX - rect.left) / rect.width) * 100;
    return Math.max(2, Math.min(98, pos));
  };

  useEffect(() => {
    const onMove = (e) => { if (isDragging.current) setSliderPos(getPos(e)); };
    const onUp = () => { isDragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative select-none overflow-hidden rounded-xl cursor-col-resize"
      onMouseDown={(e) => { isDragging.current = true; setSliderPos(getPos(e)); }}
      onTouchStart={(e) => { isDragging.current = true; setSliderPos(getPos(e)); }}
    >
      <img src={afterUrl} alt="Enhanced" className="w-full h-64 object-cover" />

      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <img
          src={beforeUrl}
          alt="Original"
          className="w-full h-full object-cover"
          style={{ width: `${(100 / sliderPos) * 100}%`, minWidth: '100%' }}
        />
      </div>

      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-xl"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-paytm-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8M8 12h8M8 17h8" />
          </svg>
        </div>
      </div>

      <div className="absolute top-3 left-3 bg-paytm-navy/70 text-white text-xs px-2 py-1 rounded-lg">Before</div>
      <div className="absolute top-3 right-3 bg-paytm-green/90 text-white text-xs px-2 py-1 rounded-lg">After</div>
    </div>
  );
}
