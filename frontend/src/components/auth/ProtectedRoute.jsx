import { Navigate, useLocation } from "react-router-dom";
import { Scale } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../utils/constants";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper">
        <span className="seal-ring flex h-11 w-11 items-center justify-center text-ink animate-pulse">
          <Scale size={20} />
        </span>
        <p className="text-[12.5px] font-medium text-slate">Loading LegalLens…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />;
  }

  return children;
}
