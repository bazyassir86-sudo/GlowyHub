import { Gamepad2, LogOut, Menu, Shield, Upload, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navBase =
  "inline-flex min-h-10 items-center rounded-lg px-3 py-2 text-sm font-bold text-white/72 transition hover:bg-white/[0.08] hover:text-white";

function navClass({ isActive }) {
  return `${navBase} ${isActive ? "bg-white/10 text-white shadow-blueGlow" : ""}`;
}

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout();
    setOpen(false);
  }

  const links = (
    <>
      <NavLink to="/" className={navClass} onClick={() => setOpen(false)}>
        Home
      </NavLink>
      <NavLink to="/upload" className={navClass} onClick={() => setOpen(false)}>
        <Upload className="h-4 w-4" />
        Upload
      </NavLink>
      {isAdmin && (
        <NavLink to="/admin" className={navClass} onClick={() => setOpen(false)}>
          <Shield className="h-4 w-4" />
          Admin
        </NavLink>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/82 backdrop-blur-xl">
      <nav className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="GlowyHub home">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue shadow-glow">
            <Gamepad2 className="h-5 w-5 text-white" />
          </span>
          <span className="font-display text-xl font-black text-white">GlowyHub</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">{links}</div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <UserProfileChip user={user} />
              <button className="btn-soft" type="button" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navClass}>
                <UserRound className="h-4 w-4" />
                Login
              </NavLink>
              <Link to="/register" className="btn-primary">
                Join
              </Link>
            </>
          )}
        </div>

        <button className="btn-soft md:hidden" type="button" onClick={() => setOpen((value) => !value)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Menu</span>
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-ink px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {links}
            <div className="mt-2 grid gap-2 border-t border-white/10 pt-3">
              {user ? (
                <>
                  <UserProfileChip user={user} mobile />
                  <button className="btn-soft justify-start" type="button" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={navClass} onClick={() => setOpen(false)}>
                    Login
                  </NavLink>
                  <Link to="/register" className="btn-primary" onClick={() => setOpen(false)}>
                    Join
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function UserProfileChip({ user, mobile = false }) {
  const label = user.displayName || user.email || "Player";
  const fallbackInitial = label.trim().charAt(0).toUpperCase() || "P";

  return (
    <span
      className={`inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-white/78 ${
        mobile ? "w-full justify-start" : "max-w-56"
      }`}
    >
      {user.photoURL ? (
        <img className="h-7 w-7 shrink-0 rounded-full object-cover" src={user.photoURL} alt={`${label} avatar`} />
      ) : (
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-neon-purple to-neon-blue text-xs font-black text-white">
          {fallbackInitial}
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate leading-4">{label}</span>
        {user.email && user.email !== label && <span className="block truncate text-xs leading-4 text-white/45">{user.email}</span>}
      </span>
    </span>
  );
}
