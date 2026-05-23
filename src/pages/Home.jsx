import { Download, Flame, Search, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import GameCard from "../components/GameCard";
import { CATEGORIES } from "../constants";
import { useSeo } from "../hooks/useSeo";
import { getApprovedGames } from "../services/gameService";
import { formatNumber, toTimestamp } from "../utils/format";

export default function Home() {
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useSeo({
    title: "Latest Indie Games",
    description: "Browse latest games, top downloads, categories, ratings, and creator uploads on GlowyHub.",
    path: "/"
  });

  useEffect(() => {
    let active = true;

    async function loadGames() {
      try {
        const data = await getApprovedGames();
        if (active) setGames(data);
      } catch (loadError) {
        if (active) setError(loadError.message || "Could not load games.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadGames();
    return () => {
      active = false;
    };
  }, []);

  const filteredGames = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return games.filter((game) => {
      const matchesCategory = category === "All" || game.category === category;
      const matchesSearch =
        !normalizedSearch ||
        game.title.toLowerCase().includes(normalizedSearch) ||
        game.description.toLowerCase().includes(normalizedSearch) ||
        game.category.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [category, games, search]);

  const latestGames = useMemo(
    () => [...filteredGames].sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt)),
    [filteredGames]
  );

  const topDownloads = useMemo(
    () => [...games].sort((a, b) => (b.downloads || 0) - (a.downloads || 0)).slice(0, 5),
    [games]
  );

  const featuredGame = useMemo(() => games.find((game) => game.featured) || games[0], [games]);
  const totalDownloads = games.reduce((sum, game) => sum + (game.downloads || 0), 0);

  return (
    <div className="grid gap-8">
      <section className="grid gap-6 py-2 lg:grid-cols-[1.2fr_0.8fr] lg:items-stretch">
        <div className="glass-panel grid min-h-[360px] content-between overflow-hidden rounded-lg p-5 sm:p-7">
          <div className="grid gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip">
                <Sparkles className="h-3.5 w-3.5 text-neon-blue" />
                Latest drops
              </span>
              <span className="chip">{formatNumber(totalDownloads)} downloads</span>
            </div>

            <div className="max-w-3xl">
              <h1 className="font-display text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                GlowyHub
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/64 sm:text-lg">
                A clean gaming platform for finding indie games, browser games, Android builds, ratings, and fast
                downloads.
              </p>
            </div>

            <div className="relative max-w-2xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/42" />
              <input
                className="field min-h-14 pl-12 text-base"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search games, categories, keywords..."
              />
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            {["All", ...CATEGORIES].map((item) => (
              <button
                key={item}
                className={`chip transition hover:border-neon-blue/50 hover:text-white ${
                  category === item ? "border-neon-blue/70 bg-neon-blue/[0.14] text-white shadow-blueGlow" : ""
                }`}
                type="button"
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {featuredGame && (
          <Link
            to={`/games/${featuredGame.slug}`}
            className="group relative min-h-[360px] overflow-hidden rounded-lg border border-white/10 bg-panel"
          >
            <img
              className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
              src={featuredGame.coverUrl}
              alt={`${featuredGame.title} cover`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 grid gap-3 p-5 sm:p-6">
              <span className="chip w-fit bg-neon-purple/[0.18] text-white">
                <Flame className="h-3.5 w-3.5 text-neon-pink" />
                Featured
              </span>
              <h2 className="font-display text-3xl font-black text-white">{featuredGame.title}</h2>
              <p className="line-clamp-2 text-sm leading-6 text-white/66">{featuredGame.description}</p>
              <div className="flex flex-wrap gap-2 text-sm font-bold text-white/70">
                <span className="chip">{featuredGame.category}</span>
                <span className="chip">
                  <Download className="h-3.5 w-3.5 text-neon-green" />
                  {formatNumber(featuredGame.downloads || 0)}
                </span>
              </div>
            </div>
          </Link>
        )}
      </section>

      {error && <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-red-100">{error}</div>}

      <section className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase text-neon-blue">Library</p>
            <h2 className="font-display text-2xl font-black text-white">Latest games</h2>
          </div>
          <p className="text-sm font-bold text-white/54">{filteredGames.length} games found</p>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-80 animate-pulse rounded-lg border border-white/10 bg-white/[0.055]" />
            ))}
          </div>
        ) : latestGames.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {latestGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-lg p-8 text-center text-white/62">No games match this search.</div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel rounded-lg p-5">
          <div className="mb-4 flex items-center gap-2">
            <Flame className="h-5 w-5 text-neon-pink" />
            <h2 className="font-display text-2xl font-black text-white">Top downloads</h2>
          </div>
          <div className="grid gap-3">
            {topDownloads.map((game, index) => (
              <Link
                key={game.id}
                to={`/games/${game.slug}`}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.045] p-3 transition hover:border-neon-blue/50 hover:bg-white/[0.08]"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 font-black text-neon-blue">
                  {index + 1}
                </span>
                <img className="h-14 w-20 rounded object-cover" src={game.coverUrl} alt="" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-black text-white">{game.title}</p>
                  <p className="text-sm font-bold text-white/52">{game.category}</p>
                </div>
                <span className="shrink-0 text-sm font-black text-white/70">{formatNumber(game.downloads || 0)}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-lg p-5">
          <h2 className="font-display text-2xl font-black text-white">Categories</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CATEGORIES.map((item) => {
              const count = games.filter((game) => game.category === item).length;
              return (
                <button
                  key={item}
                  className="rounded-lg border border-white/10 bg-white/[0.045] p-4 text-left transition hover:-translate-y-1 hover:border-neon-purple/55 hover:bg-white/[0.08]"
                  type="button"
                  onClick={() => setCategory(item)}
                >
                  <span className="block font-black text-white">{item}</span>
                  <span className="mt-1 block text-sm font-bold text-white/50">{count} games</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
