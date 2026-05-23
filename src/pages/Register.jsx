import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSeo } from "../hooks/useSeo";
import { AuthShell, getAuthErrorMessage, GoogleButton } from "./Login";

export default function Register() {
  const { user, signInWithGoogle } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useSeo({
    title: "Register",
    description: "Create a GlowyHub account to submit games and rate downloads.",
    path: "/register"
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
    <AuthShell title="Register" subtitle="Create your profile and submit games for review.">
      <div className="grid gap-4">
        {error && <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</div>}
        <GoogleButton onClick={handleGoogleSignIn} disabled={loading}>
          {loading ? "Connecting..." : "Continue with Google"}
        </GoogleButton>
      </div>
      <p className="mt-5 text-center text-sm text-white/58">
        Already registered?{" "}
        <Link className="font-black text-neon-blue hover:text-white" to="/login">
          Login
        </Link>
      </p>
    </AuthShell>
  );
}
