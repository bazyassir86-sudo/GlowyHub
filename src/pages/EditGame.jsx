import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { CATEGORIES } from "../constants";
import { auth } from "../firebase/config";
import { useSeo } from "../hooks/useSeo";
import { getGameBySlug, updateGame } from "../services/gameService";

const emptyForm = {
  title: "",
  description: "",
  category: "Action",
  version: "",
  size: "",
  fileUrl: "",
  coverUrl: "",
  screenshotsText: ""
};

export default function EditGame() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useSeo({
    title: game ? `Edit ${game.title}` : "Edit Game",
    description: "Edit your submitted GlowyHub game listing.",
    path: `/games/${slug}/edit`
  });

  useEffect(() => {
    let active = true;

    async function loadGame() {
      try {
        const data = await getGameBySlug(slug);
        if (!active) return;

        setGame(data);
        if (data) {
          setForm({
            title: data.title || "",
            description: data.description || "",
            category: data.category || "Action",
            version: data.version || "",
            size: data.size || "",
            fileUrl: data.fileUrl || "",
            coverUrl: data.coverUrl || "",
            screenshotsText: Array.isArray(data.screenshots) ? data.screenshots.join(", ") : ""
          });
        }
      } catch (loadError) {
        if (active) setError(loadError.message || "Could not load game.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadGame();
    return () => {
      active = false;
    };
  }, [slug]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await updateGame(game.id, form);
      navigate(`/games/${game.slug}`, { replace: true });
    } catch (saveError) {
      console.error("[GlowyHub owner] edit failed", saveError);
      setError(saveError.message || "Edit failed.");
    } finally {
      setSaving(false);
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
    return <Navigate to="/" replace />;
  }

  if (!auth.currentUser?.uid || game.ownerId !== auth.currentUser.uid) {
    return <Navigate to={`/games/${slug}`} replace />;
  }

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase text-neon-blue">Owner tools</p>
          <h1 className="font-display text-4xl font-black text-white">Edit game</h1>
        </div>
        <Link className="btn-soft" to={`/games/${game.slug}`}>
          Back
        </Link>
      </div>

      <form className="glass-panel grid gap-5 rounded-lg p-5 sm:p-7" onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Title">
            <input className="field" name="title" value={form.title} onChange={updateField} required />
          </FormField>

          <FormField label="Category">
            <select className="field" name="category" value={form.category} onChange={updateField} required>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Version">
            <input className="field" name="version" value={form.version} onChange={updateField} required />
          </FormField>

          <FormField label="Size">
            <input className="field" name="size" value={form.size} onChange={updateField} required />
          </FormField>
        </div>

        <FormField label="Download file link">
          <input className="field" type="url" name="fileUrl" value={form.fileUrl} onChange={updateField} required />
        </FormField>

        <FormField label="Description">
          <textarea
            className="field min-h-36 resize-y"
            name="description"
            value={form.description}
            onChange={updateField}
            required
          />
        </FormField>

        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Cover image URL">
            <input className="field" type="url" name="coverUrl" value={form.coverUrl} onChange={updateField} required />
          </FormField>

          <FormField label="Screenshots URLs">
            <textarea
              className="field min-h-28 resize-y"
              name="screenshotsText"
              value={form.screenshotsText}
              onChange={updateField}
              placeholder="https://image-1.jpg, https://image-2.jpg"
            />
          </FormField>
        </div>

        {error && <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-red-100">{error}</div>}

        <button className="btn-primary" type="submit" disabled={saving}>
          <Save className="h-5 w-5" />
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div className="grid gap-2">
      <span className="text-sm font-black text-white/70">{label}</span>
      {children}
    </div>
  );
}
