import { Star } from "./icons";

export default function RatingStars({
  rating,
  size = 14,
}: {
  rating: number;
  size?: number;
}) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;

  return (
    <span
      className="stars"
      aria-label={`Calificación: ${rating} de 5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={i < full || (i === full && hasHalf) ? "star-on" : "star-off"}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
