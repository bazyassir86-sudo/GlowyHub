import { Check, Download, Star, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSeo } from "../hooks/useSeo";
import { deleteGame, getAllGames, setGameStatus, toggleFeatured } from "../services/gameService";
import { formatNumber, getAverageRating } from "../utils/format";

const filters = ["all", "pending", "approved", "rejected"];

export default function AdminPanel() {
  const [games, setGames] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [error, setError] = useState("");

  useSeo({
    title: "Admin Panel",
    description: "Approve, reject, delete, and feature submitted GlowyHub games.",
    path: "/admin"
  });

  const loadGames = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllGames();
      setGames(data);
    } catch (loadError) {
      setError(loadError.message || "Could not load admin data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  const visibleGames = useMemo(
    () => games.filter((game) => filter === "all" || game.status === filter),
    [filter, games]
  );

  const summary = useMemo(
    () => ({
      pending: games.filter((game) => game.status === "pending").length,
      approved: games.filter((game) => game.status === "approved").length,
      downloads: games.reduce((sum, game) => sum + (game.downloads || 0), 0)
    }),
    [games]
  );

  async function runAction(gameId, action) {
    setWorkingId(gameId);
    setError("");
    try {
      await action();
      await loadGames();
    } catch (actionError) {
      setError(actionError.message || "Action failed.");
    } finally {
      setWorkingId("");
    }
  }

  async function handleDelete(game) {
    if (!confirm(`Delete ${game.title}?`)) return;
    await runAction(game.id, () => deleteGame(game.id));
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase text-neon-blue">Private area</p>
          <h1 className="font-display text-4xl font-black text-white">Admin panel</h1>
        </div>
        <button className="btn-soft" type="button" onClick={loadGames}>
          Refresh
        </button>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <AdminStat label="Pending" value={summary.pending} />
        <AdminStat label="Approved" value={summary.approved} />
        <AdminStat label="Downloads" value={formatNumber(summary.downloads)} />
      </section>

      <section className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item}
            className={`chip capitalize transition hover:border-neon-blue/50 hover:text-white ${
              filter === item ? "border-neon-blue/70 bg-neon-blue/[0.14] text-white" : ""
            }`}
            type="button"
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </section>

      {error && <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-red-100">{error}</div>}

      <section className="grid gap-4">
        {loading ? (
          <div className="glass-panel rounded-lg p-8 text-white/62">Loading games...</div>
        ) : visibleGames.length ? (
          visibleGames.map((game) => (
            <article
              key={game.id}
              className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.055] p-4 transition hover:border-neon-blue/45 md:grid-cols-[150px_1fr]"
            >
              <img
                className="aspect-video w-full rounded-lg object-cover md:aspect-square"
                src={game.coverUrl}
                alt={`${game.title} cover`}
              />
              <div className="grid gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-2xl font-black text-white">{game.title}</h2>
                      <StatusBadge status={game.status} />
                      {game.featured && <span className="chip text-yellow-200">Featured</span>}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/60">{game.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="chip">{game.category}</span>
                  <span className="chip">v{game.version}</span>
                  <span className="chip">{game.size}</span>
                  <span className="chip">
                    <Download className="h-3.5 w-3.5 text-neon-green" />
                    {formatNumber(game.downloads || 0)}
                  </span>
                  <span className="chip">
                    <Star className="h-3.5 w-3.5 fill-yellow-300 text-yellow-300" />
                    {getAverageRating(game).toFixed(1)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    className="btn-soft"
                    type="button"
                    disabled={workingId === game.id}
                    onClick={() => runAction(game.id, () => setGameStatus(game.id, "approved"))}
                  >
                    <Check className="h-4 w-4 text-neon-green" />
                    Approve
                  </button>
                  <button
                    className="btn-soft"
                    type="button"
                    disabled={workingId === game.id}
                    onClick={() => runAction(game.id, () => setGameStatus(game.id, "rejected"))}
                  >
                    <X className="h-4 w-4 text-red-300" />
                    Reject
                  </button>
                  <button
                    className="btn-soft"
                    type="button"
                    disabled={workingId === game.id}
                    onClick={() => runAction(game.id, () => toggleFeatured(game.id, !game.featured))}
                  >
                    <Star className="h-4 w-4 text-yellow-300" />
                    {game.featured ? "Unfeature" : "Feature"}
                  </button>
                  <button
                    className="btn-soft"
                    type="button"
                    disabled={workingId === game.id}
                    onClick={() => handleDelete(game)}
                  >
                    <Trash2 className="h-4 w-4 text-red-300" />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="glass-panel rounded-lg p-8 text-center text-white/62">No games in this filter.</div>
        )}
      </section>
    </div>
  );
}

function AdminStat({ label, value }) {
  return (
    <div className="glass-panel rounded-lg p-5">
      <p className="text-sm font-black uppercase text-white/45">{label}</p>
      <p className="mt-2 font-display text-3xl font-black text-white">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    approved: "border-green-400/30 bg-green-500/10 text-green-100",
    pending: "border-yellow-400/30 bg-yellow-500/10 text-yellow-100",
    rejected: "border-red-400/30 bg-red-500/10 text-red-100"
  };

  return <span className={`chip capitalize ${styles[status] || ""}`}>{status}</span>;
}
