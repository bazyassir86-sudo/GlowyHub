import { Send } from "lucide-react";
import { useState } from "react";
import { CATEGORIES } from "../constants";
import { useAuth } from "../context/AuthContext";
import { useSeo } from "../hooks/useSeo";
import { createGame } from "../services/gameService";

const initialForm = {
  title: "",
  description: "",
  category: "Action",
  version: "",
  size: "",
  fileUrl: "",
  coverUrl: "",
  screenshotsText: ""
};

export default function UploadGame() {
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useSeo({
    title: "Upload Game",
    description: "Submit a game to GlowyHub with title, description, category, version, download link, and images.",
    path: "/upload"
  });

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");
    console.log("[GlowyHub upload] start submit");

    try {
      await createGame(form, user);
      setForm(initialForm);
      event.target.reset();
      setMessage("Game submitted. Admin approval is required before it appears publicly.");
    } catch (submitError) {
      console.error("[GlowyHub upload] submit failed", submitError);
      setError(submitError.message || "Upload failed.");
    } finally {
      console.log("[GlowyHub upload] finish");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-6">
      <div>
        <p className="text-sm font-black uppercase text-neon-blue">Creator upload</p>
        <h1 className="font-display text-4xl font-black text-white">Submit a game</h1>
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
            <input
              className="field"
              name="version"
              value={form.version}
              onChange={updateField}
              placeholder="1.0.0"
              required
            />
          </FormField>

          <FormField label="Size">
            <input
              className="field"
              name="size"
              value={form.size}
              onChange={updateField}
              placeholder="450 MB"
              required
            />
          </FormField>
        </div>

        <FormField label="Download file link">
          <input
            className="field"
            type="url"
            name="fileUrl"
            value={form.fileUrl}
            onChange={updateField}
            placeholder="https://mediafire.com/..."
            required
          />
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
            <input
              className="field"
              type="url"
              name="coverUrl"
              value={form.coverUrl}
              onChange={updateField}
              placeholder="https://..."
              required
            />
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

        {message && <div className="rounded-lg border border-green-400/30 bg-green-500/10 p-4 text-green-100">{message}</div>}
        {error && <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-red-100">{error}</div>}

        <button className="btn-primary" type="submit" disabled={submitting}>
          <Send className="h-5 w-5" />
          {submitting ? "Submitting..." : "Submit for review"}
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
