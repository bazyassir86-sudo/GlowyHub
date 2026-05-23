import { Download, Star, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { formatNumber, getAverageRating } from "../utils/format";

export default function GameCard({ game, rank }) {
  const average = getAverageRating(game);

  return (
    <Link
      to={`/games/${game.slug}`}
      className="group overflow-hidden rounded-lg border border-white/10 bg-white/[0.055] shadow-glow transition duration-200 hover:-translate-y-1 hover:border-neon-blue/50 hover:bg-white/[0.08]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-panel">
        <img
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          src={game.coverUrl}
          alt={`${game.title} cover`}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/10 to-transparent" />
        {rank && (
          <span className="absolute left-3 top-3 inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-black/72 px-2 text-sm font-black text-neon-blue ring-1 ring-white/10">
            #{rank}
          </span>
        )}
        {game.featured && (
          <span className="absolute right-3 top-3 chip bg-neon-purple/[0.18] text-white">
            <Trophy className="h-3.5 w-3.5 text-yellow-300" />
            Featured
          </span>
        )}
      </div>

      <div className="grid gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg font-black text-white">{game.title}</h3>
            <p className="mt-1 text-sm font-semibold text-neon-blue">{game.category}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-lg bg-white/[0.07] px-2 py-1 text-sm font-black text-yellow-300">
            <Star className="h-4 w-4 fill-yellow-300" />
            {average ? average.toFixed(1) : "0.0"}
          </div>
        </div>

        <p className="line-clamp-2 min-h-10 text-sm leading-5 text-white/60">{game.description}</p>

        <div className="flex items-center justify-between border-t border-white/10 pt-3 text-sm text-white/56">
          <span className="font-bold">v{game.version}</span>
          <span className="inline-flex items-center gap-1 font-bold">
            <Download className="h-4 w-4 text-neon-green" />
            {formatNumber(game.downloads || 0)}
          </span>
        </div>
      </div>
    </Link>
  );
}
