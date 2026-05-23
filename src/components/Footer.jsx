import { Gamepad2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/30">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-white/58 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-center gap-2 font-bold text-white/78">
          <Gamepad2 className="h-4 w-4 text-neon-blue" />
          GlowyHub
        </div>
        <p>Gaming uploads, ratings, downloads, and admin approvals.</p>
      </div>
    </footer>
  );
}
