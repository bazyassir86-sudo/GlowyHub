export function formatNumber(value = 0) {
  return new Intl.NumberFormat("en", {
    notation: value >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1
  }).format(value);
}

export function getAverageRating(game) {
  if (!game?.ratingCount) return 0;
  return game.ratingTotal / game.ratingCount;
}

export function formatDate(value) {
  if (!value) return "New";
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return "New";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export function toTimestamp(value) {
  if (!value) return 0;
  if (value?.toMillis) return value.toMillis();
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}
