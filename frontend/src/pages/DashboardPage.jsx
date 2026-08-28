import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AppShell from "../components/layout/AppShell";
import StatsCard from "../components/dashboard/StatsCard";
import RecentDocuments from "../components/dashboard/RecentDocuments";
import QuickActions from "../components/dashboard/QuickActions";
import RecentQueries from "../components/dashboard/RecentQueries";
import DemoDataLabel from "../components/common/DemoDataLabel";
import { useAuth } from "../context/AuthContext";
import { fetchDashboardStats, fetchRecentDocuments, fetchRecentQueries } from "../services/api";

const statsContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchDashboardStats(), fetchRecentDocuments(), fetchRecentQueries()]).then(
      ([s, d, q]) => {
        setStats(s);
        setDocuments(d);
        setQueries(q);
        setLoading(false);
      }
    );
  }, []);

  const firstName = user?.name?.split(" ")[0];

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-wrap items-start justify-between gap-3"
        >
          <div>
            <h1 className="font-display text-[1.9rem] font-medium tracking-tight text-ink">
              {firstName ? `Welcome back, ${firstName}` : "Welcome to LegalLens"}
            </h1>
            <p className="mt-1.5 text-[14px] text-slate">Your AI-powered legal research workspace.</p>
          </div>
          <DemoDataLabel />
        </motion.div>

        <motion.div
          variants={statsContainer}
          initial="hidden"
          animate="visible"
          className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[104px] animate-pulse rounded-xl border border-line bg-paper-2"
                />
              ))
            : stats.map((s) => <StatsCard key={s.label} {...s} />)}
        </motion.div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            <RecentDocuments documents={documents} loading={loading} />
            <RecentQueries queries={queries} />
          </div>
          <QuickActions />
        </div>
      </div>
    </AppShell>
  );
}
