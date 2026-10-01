import { Star } from 'lucide-react';
import { useState } from 'react';

// Read-only when `onChange` is omitted.
export default function StarRating({ value = 0, onChange, size = 18 }) {
  const [hover, setHover] = useState(0);
  const shown = hover || Math.round(Number(value) || 0);

  return (
    <div className="flex items-center gap-0.5" role={onChange ? 'radiogroup' : 'img'} aria-label={`${value || 0} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const star = <Star size={size} className="text-amber-500" fill={n <= shown ? 'currentColor' : 'none'} />;
        return onChange ? (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
          >
            {star}
          </button>
        ) : (
          <span key={n}>{star}</span>
        );
      })}
    </div>
  );
}