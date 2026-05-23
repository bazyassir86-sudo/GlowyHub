import { ArrowLeft, CalendarDays, Download, Edit, Gamepad2, HardDrive, ShieldCheck, Tag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import StarRating from "../components/StarRating";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase/config";
import { useSeo } from "../hooks/useSeo";
import { deleteGame, getGameBySlug, getUserRating, incrementDownload, rateGame } from "../services/gameService";
import { formatDate, formatNumber, getAverageRating } from "../utils/format";

export default function GameDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [userRating, setUserRating] = useState(0);

  useSeo({
    title: game?.title || "Game Details",
    description: game?.description || "View game details, screenshots, ratings, and download links on GlowyHub.",
    path: `/games/${slug}`
  });

  useEffect(() => {
    let active = true;

    async function loadGame() {
      try {
        setLoadError("");
        const data = await getGameBySlug(slug);
        if (!active) return;
        setGame(data);

        if (data && user?.uid) {
          const rating = await getUserRating(data.id, user.uid);
          if (active) setUserRating(rating);
        }
      } catch (detailsError) {
        if (active) setLoadError(detailsError.message || "Game is not available.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadGame();
    return () => {
      active = false;
    };
  }, [slug, user?.uid]);

  async function handleDownload() {
    if (!game?.fileUrl) return;

    const updated = await incrementDownload(game.id);
    if (updated) setGame(updated);
    window.open(game.fileUrl, "_blank", "noopener,noreferrer");
  }

  async function handleRate(rating) {
    if (!user) {
      setMessage("Login required to rate this game.");
      return;
    }

    const updated = await rateGame(game.id, user, rating);
    setUserRating(rating);
    if (updated) setGame(updated);
    setMessage("Rating saved.");
  }

  async function handleDelete() {
    if (!game || !confirm(`Delete ${game.title}?`)) return;

    setDeleting(true);
    setMessage("");

    try {
      await deleteGame(game.id);
      navigate("/", { replace: true });
    } catch (deleteError) {
      console.error("[GlowyHub owner] delete failed", deleteError);
      setMessage(deleteError.message || "Delete failed.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[55vh] place-items-center">
        <div className="glass-panel rounded-lg px-5 py-4 text-white/70">Loading game...</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="grid min-h-[55vh] place-items-center text-center">
        <div className="glass-panel max-w-md rounded-lg p-8">
          <h1 className="font-display text-3xl font-black text-white">Game not found</h1>
          {loadError && <p className="mt-3 text-sm text-white/58">{loadError}</p>}
          <Link to="/" className="btn-primary mt-5">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = Boolean(auth.currentUser?.uid && game.ownerId === auth.currentUser.uid);

  if (game.status !== "approved" && !isAdmin && !isOwner) {
    return (
      <div className="grid min-h-[55vh] place-items-center text-center">
        <div className="glass-panel max-w-md rounded-lg p-8">
          <h1 className="font-display text-3xl font-black text-white">Waiting for approval</h1>
          <p className="mt-3 text-white/62">This game is submitted and will appear publicly after admin review.</p>
          <Link to="/" className="btn-primary mt-5">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  const average = getAverageRating(game);
  const screenshots = game.screenshots?.length ? game.screenshots : [game.coverUrl].filter(Boolean);

  return (
    <div className="grid gap-6">
      <Link to="/" className="btn-soft w-fit">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="overflow-hidden rounded-lg border border-white/10 bg-panel shadow-glow">
          <div className="relative aspect-[16/10]">
            <img className="h-full w-full object-cover" src={game.coverUrl} alt={`${game.title} cover`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
              <span className="chip bg-black/45">
                <Tag className="h-3.5 w-3.5 text-neon-blue" />
                {game.category}
              </span>
              {game.featured && (
                <span className="chip bg-neon-purple/[0.18]">
                  <ShieldCheck className="h-3.5 w-3.5 text-neon-green" />
                  Featured
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-lg p-5 sm:p-6">
          <div className="grid gap-5">
            <div>
              <p className="text-sm font-black uppercase text-neon-blue">Game details</p>
              <h1 className="mt-1 font-display text-4xl font-black leading-tight text-white">{game.title}</h1>
              <p className="mt-3 text-white/64">{game.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InfoTile icon={<Gamepad2 />} label="Version" value={`v${game.version}`} />
              <InfoTile icon={<HardDrive />} label="Size" value={game.size} />
              <InfoTile icon={<Download />} label="Downloads" value={formatNumber(game.downloads || 0)} />
              <InfoTile icon={<CalendarDays />} label="Added" value={formatDate(game.createdAt)} />
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-white/52">Rating</p>
                  <StarRating value={average} count={game.ratingCount || 0} />
                </div>
                <div>
                  <p className="mb-1 text-right text-sm font-bold text-white/52">Your rating</p>
                  <StarRating value={userRating} onRate={handleRate} compact />
                </div>
              </div>
              {message && <p className="mt-3 text-sm font-bold text-neon-blue">{message}</p>}
            </div>

            <button className="btn-primary w-full" type="button" onClick={handleDownload} disabled={!game.fileUrl}>
              <Download className="h-5 w-5" />
              Download game
            </button>

            {isOwner && (
              <div className="grid gap-2 sm:grid-cols-2">
                <Link className="btn-soft" to={`/games/${game.slug}/edit`}>
                  <Edit className="h-4 w-4" />
                  Edit
                </Link>
                <button className="btn-soft" type="button" onClick={handleDelete} disabled={deleting}>
                  <Trash2 className="h-4 w-4 text-red-300" />
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        <h2 className="font-display text-2xl font-black text-white">Screenshots</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {screenshots.map((screenshot, index) => (
            <img
              key={`${screenshot}-${index}`}
              className="aspect-video rounded-lg border border-white/10 object-cover"
              src={screenshot}
              alt={`${game.title} screenshot ${index + 1}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function InfoTile({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-neon-blue">
        {icon}
      </div>
      <p className="text-xs font-black uppercase text-white/40">{label}</p>
      <p className="mt-1 break-words font-black text-white">{value}</p>
    </div>
  );
}
