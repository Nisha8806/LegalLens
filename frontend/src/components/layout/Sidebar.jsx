import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Scale,
  LayoutDashboard,
  FileSearch,
  Network,
  Swords,
  ShieldAlert,
  NotebookPen,
  Settings,
  LogOut,
} from "lucide-react";
import { SIDEBAR_LINKS, ROUTES } from "../../utils/constants";
import { useAuth } from "../../context/AuthContext";

const ICONS = {
  LayoutDashboard,
  FileSearch,
  Network,
  Swords,
  ShieldAlert,
  NotebookPen,
  Settings,
};

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate(ROUTES.HOME);
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "LL";

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-ink-3 bg-ink lg:flex">
      <Link to={ROUTES.HOME} className="flex items-center gap-2.5 px-6 py-6">
        <span className="seal-ring flex h-8 w-8 items-center justify-center text-brass-light">
          <Scale size={16} strokeWidth={2} />
        </span>
        <span className="font-display text-lg font-medium tracking-tight text-text-onink">
          LegalLens
        </span>
      </Link>

      <nav className="flex-1 space-y-0.5 px-3">
        {SIDEBAR_LINKS.map((link) => {
          const Icon = ICONS[link.icon];
          const active =
            link.to === ROUTES.DASHBOARD
              ? location.pathname === ROUTES.DASHBOARD
              : location.pathname.startsWith(link.to);
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                active
                  ? "bg-ink-3 text-text-onink"
                  : "text-text-onink-muted hover:bg-ink-2 hover:text-text-onink"
              }`}
            >
              <Icon size={16} strokeWidth={1.9} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 mb-5 rounded-lg border border-ink-3 bg-ink-2 px-3.5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brass text-[11px] font-bold text-ink">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-medium text-text-onink">
              {user?.name ?? "Lawyer of Record"}
            </p>
            <p className="truncate text-[11px] text-text-onink-muted">
              {user?.firm || user?.email || "Commercial Practice"}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border border-ink-4 py-1.5 text-[11.5px] font-medium text-text-onink-muted transition-colors hover:border-brass/40 hover:text-text-onink"
        >
          <LogOut size={12.5} /> Sign out
        </button>
      </div>
    </aside>
  );
}
