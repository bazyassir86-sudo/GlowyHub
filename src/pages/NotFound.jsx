import { Link } from "react-router-dom";
import { useSeo } from "../hooks/useSeo";

export default function NotFound() {
  useSeo({
    title: "Page Not Found",
    description: "This GlowyHub page could not be found.",
    path: "/404"
  });

  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <section className="glass-panel max-w-md rounded-lg p-8">
        <p className="text-sm font-black uppercase text-neon-blue">404</p>
        <h1 className="mt-2 font-display text-4xl font-black text-white">Page not found</h1>
        <p className="mt-3 text-white/62">The page you opened does not exist on GlowyHub.</p>
        <Link to="/" className="btn-primary mt-6">
          Back home
        </Link>
      </section>
    </div>
  );
}
