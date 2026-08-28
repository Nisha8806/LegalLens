import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Scale } from "lucide-react";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import CaseExplorerPage from "./pages/CaseExplorerPage";
import ArgumentAnalysisPage from "./pages/ArgumentAnalysisPage";
import ConflictDetectorPage from "./pages/ConflictDetectorPage";
import ResearchBriefPage from "./pages/ResearchBriefPage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { ROUTES } from "./utils/constants";

// Lazy-loaded: pulls in react-pdf, which is by far the heaviest
// dependency in this bundle, so keep it out of the main chunk.
const DocumentResearchPage = lazy(() => import("./pages/DocumentResearchPage"));

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <span className="seal-ring flex h-11 w-11 items-center justify-center text-ink">
        <Scale size={20} className="animate-pulse" />
      </span>
    </div>
  );
}

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

function AnimatedPage({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path={ROUTES.HOME} element={<AnimatedPage><LandingPage /></AnimatedPage>} />
        <Route path={ROUTES.LOGIN} element={<AnimatedPage><LoginPage /></AnimatedPage>} />
        <Route path={ROUTES.SIGNUP} element={<AnimatedPage><SignupPage /></AnimatedPage>} />

        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <AnimatedPage><DashboardPage /></AnimatedPage>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.RESEARCH}
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageFallback />}>
                <AnimatedPage><DocumentResearchPage /></AnimatedPage>
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CASE_EXPLORER}
          element={
            <ProtectedRoute>
              <AnimatedPage><CaseExplorerPage /></AnimatedPage>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ARGUMENTS}
          element={
            <ProtectedRoute>
              <AnimatedPage><ArgumentAnalysisPage /></AnimatedPage>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CONFLICTS}
          element={
            <ProtectedRoute>
              <AnimatedPage><ConflictDetectorPage /></AnimatedPage>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.BRIEF}
          element={
            <ProtectedRoute>
              <AnimatedPage><ResearchBriefPage /></AnimatedPage>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AnimatedPage><SettingsPage /></AnimatedPage>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<AnimatedPage><NotFoundPage /></AnimatedPage>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AnimatedRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
