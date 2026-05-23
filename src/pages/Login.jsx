import { Chrome } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSeo } from "../hooks/useSeo";

export default function Login() {
  const { user, signInWithGoogle } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useSeo({
    title: "Login",
    description: "Login to GlowyHub to upload and rate games.",
    path: "/login"
  });

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setError("");

    try {
      await signInWithGoogle();
      navigate("/", { replace: true });
    } catch (error) {
      console.error(error);
      setError(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Login" subtitle="Access uploads, ratings, and private tools.">
      <div className="grid gap-4">
        {error && <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</div>}
        <GoogleButton onClick={handleGoogleSignIn} disabled={loading}>
          {loading ? "Connecting..." : "Continue with Google"}
        </GoogleButton>
      </div>
      <p className="mt-5 text-center text-sm text-white/58">
        New here?{" "}
        <Link className="font-black text-neon-blue hover:text-white" to="/register">
          Create account
        </Link>
      </p>
    </AuthShell>
  );
}

export function getAuthErrorMessage(error) {
  const code = error?.code ? `${error.code}: ` : "";
  const message = error?.message || "Google sign-in failed. Please try again.";
  return `${code}${message}`;
}

export function GoogleButton({ children, disabled, onClick }) {
  return (
    <button className="btn-primary w-full" type="button" disabled={disabled} onClick={onClick}>
      <Chrome className="h-5 w-5" />
      {children}
    </button>
  );
}

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="grid min-h-[70vh] place-items-center py-6">
      <section className="glass-panel w-full max-w-md rounded-lg p-6 shadow-glow sm:p-8">
        <div className="mb-6 text-center">
          <p className="text-sm font-black uppercase text-neon-blue">GlowyHub</p>
          <h1 className="font-display text-4xl font-black text-white">{title}</h1>
          <p className="mt-2 text-sm text-white/58">{subtitle}</p>
        </div>
        {children}
      </section>
    </div>
  );
}
