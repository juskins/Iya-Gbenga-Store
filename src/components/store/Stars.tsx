import Icon from "./Icon";

export default function Stars({ rating, className = "text-sm" }: { rating: number; className?: string }) {
  return (
    <span className="flex text-secondary" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon
          key={n}
          filled
          className={className}
          name={rating >= n ? "star" : rating >= n - 0.5 ? "star_half" : "star"}
        />
      ))}
    </span>
  );
}
