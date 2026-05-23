import { Star } from "lucide-react";
import { useState } from "react";

export default function StarRating({ value = 0, count = 0, onRate, compact = false }) {
  const [hover, setHover] = useState(0);
  const displayValue = hover || Math.round(value);
  const label = value ? value.toFixed(1) : "0.0";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const active = star <= displayValue;
          const IconWrapper = onRate ? "button" : "span";

          return (
            <IconWrapper
              key={star}
              type={onRate ? "button" : undefined}
              onClick={onRate ? () => onRate(star) : undefined}
              onMouseEnter={onRate ? () => setHover(star) : undefined}
              onMouseLeave={onRate ? () => setHover(0) : undefined}
              className={onRate ? "rounded p-0.5 transition hover:scale-110" : "p-0.5"}
              aria-label={onRate ? `Rate ${star} stars` : undefined}
            >
              <Star
                className={`h-4 w-4 ${compact ? "sm:h-4 sm:w-4" : "sm:h-5 sm:w-5"} ${
                  active ? "fill-yellow-300 text-yellow-300" : "text-white/24"
                }`}
              />
            </IconWrapper>
          );
        })}
      </div>
      {!compact && (
        <span className="text-sm font-bold text-white/62">
          {label} {count ? `(${count})` : ""}
        </span>
      )}
    </div>
  );
}
