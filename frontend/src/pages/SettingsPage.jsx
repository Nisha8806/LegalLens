import { Settings as SettingsIcon, User, LogOut, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../utils/constants";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate(ROUTES.HOME);
  }

  const initials = user?.name
    ? user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : "LL";

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-6 py-8 lg:px-10">
        <h1 className="font-display text-[1.9rem] font-medium tracking-tight text-ink">Settings</h1>
        <p className="mt-1.5 text-[14px] text-slate">Manage your account and workspace preferences.</p>

        <div className="mt-8 rounded-xl border border-line bg-paper-3 shadow-panel">
          <div className="flex items-center gap-2 border-b border-line px-5 py-4">
            <User size={16} className="text-slate" />
            <h3 className="font-display text-base font-medium text-ink">Profile</h3>
          </div>
          <div className="flex flex-wrap items-center gap-4 px-5 py-5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ink text-[16px] font-bold text-brass-light">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-medium text-ink">{user?.name ?? "Guest User"}</p>
              <p className="text-[13px] text-slate">{user?.email ?? "—"}</p>
              {user?.firm && <p className="mt-0.5 text-[12.5px] text-slate-light">{user.firm}</p>}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-md border border-line px-3.5 py-2 text-[12.5px] font-medium text-ink transition-colors hover:border-alert hover:text-alert"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-line bg-paper-3 shadow-panel">
          <div className="flex items-center gap-2 border-b border-line px-5 py-4">
            <Shield size={16} className="text-slate" />
            <h3 className="font-display text-base font-medium text-ink">Security</h3>
          </div>
          <div className="px-5 py-5 text-[13px] text-slate">
            Password changes, two-factor authentication and single sign-on will be available once
            LegalLens is connected to a production identity provider.
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-paper-3 px-6 py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-2 text-slate-light">
            <SettingsIcon size={20} />
          </span>
          <p className="mt-4 max-w-sm text-[13.5px] text-slate">
            Team management and integration settings arrive with the full backend build.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
