import { Link, useLocation } from "react-router-dom";
import { Scale } from "lucide-react";
import { NAV_LINKS, ROUTES } from "../../utils/constants";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link to={ROUTES.HOME} className="flex items-center gap-2.5">
          <span className="seal-ring flex h-8 w-8 items-center justify-center text-ink">
            <Scale size={16} strokeWidth={2} />
          </span>
          <span className="font-display text-lg font-medium tracking-tight text-ink">
            LegalLens
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`text-[13.5px] font-medium transition-colors ${
                  active ? "text-ink" : "text-slate hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {isAuthenticated ? (
          <Link
            to={ROUTES.DASHBOARD}
            className="flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-[13px] font-semibold text-text-onink transition-colors hover:bg-ink-2"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brass text-[10px] font-bold text-ink">
              {user?.name?.[0]?.toUpperCase() ?? "L"}
            </span>
            Dashboard
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to={ROUTES.LOGIN}
              className="hidden text-[13px] font-semibold text-ink hover:text-brass-dark sm:inline"
            >
              Sign in
            </Link>
            <Link
              to={ROUTES.SIGNUP}
              className="rounded-md bg-ink px-4 py-2 text-[13px] font-semibold text-text-onink transition-colors hover:bg-ink-2"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
