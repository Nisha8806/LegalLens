import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Scale, LogOut } from "lucide-react";
import Sidebar from "./Sidebar";
import { SIDEBAR_LINKS, ROUTES } from "../../utils/constants";
import { useAuth } from "../../context/AuthContext";

export default function AppShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleLogout() {
    setMobileOpen(false);
    logout();
    navigate(ROUTES.HOME);
  }

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-paper-3/95 px-4 backdrop-blur-md lg:hidden">
        <Link to={ROUTES.HOME} className="flex items-center gap-2">
          <span className="seal-ring flex h-7 w-7 items-center justify-center text-ink">
            <Scale size={14} />
          </span>
          <span className="font-display text-base font-medium text-ink">LegalLens</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
          className="rounded-md p-2 text-ink hover:bg-paper-2"
        >
          <Menu size={20} />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="w-72 bg-ink px-3 py-5">
            <div className="flex items-center justify-between px-3 pb-5">
              <span className="font-display text-lg font-medium text-text-onink">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="rounded-md p-1.5 text-text-onink-muted hover:bg-ink-2 hover:text-text-onink"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="space-y-0.5">
              {SIDEBAR_LINKS.map((link) => {
                const active = location.pathname.startsWith(link.to) && link.to !== "/";
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`block rounded-md px-3 py-2.5 text-sm font-medium ${
                      active ? "bg-ink-3 text-text-onink" : "text-text-onink-muted"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-text-onink-muted hover:bg-ink-2 hover:text-text-onink"
              >
                <LogOut size={16} strokeWidth={1.9} />
                Sign out
              </button>
            </nav>
          </div>
          <button
            className="flex-1 bg-ink/60"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation overlay"
          />
        </div>
      )}

      <main className="min-w-0 flex-1 pt-14 lg:pt-0">{children}</main>
    </div>
  );
}
