import { Link } from "react-router-dom";
import { Scale } from "lucide-react";
import { ROUTES } from "../utils/constants";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <span className="seal-ring flex h-14 w-14 items-center justify-center text-ink">
        <Scale size={24} />
      </span>
      <h1 className="mt-5 font-display text-2xl font-medium text-ink">Page not found</h1>
      <p className="mt-2 max-w-sm text-[13.5px] text-slate">
        The page you're looking for doesn't exist in this build of LegalLens.
      </p>
      <Link
        to={ROUTES.DASHBOARD}
        className="mt-6 rounded-md bg-ink px-5 py-2.5 text-[13px] font-semibold text-text-onink hover:bg-ink-2"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
