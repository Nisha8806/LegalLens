// Central place for route paths, status enums, and labels.
// Keeping these out of components means Step 2/3/4 can extend
// statuses (e.g. "processing", "indexed") without touching UI code.

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  RESEARCH: "/research",
  CASE_EXPLORER: "/cases",
  CASE_DETAIL: "/cases/:caseId",
  ARGUMENTS: "/arguments",
  CONFLICTS: "/conflicts",
  BRIEF: "/brief",
};

export const NAV_LINKS = [
  { label: "Home", to: ROUTES.HOME },
  { label: "Dashboard", to: ROUTES.DASHBOARD },
  { label: "Research", to: ROUTES.RESEARCH },
  { label: "Case Explorer", to: ROUTES.CASE_EXPLORER },
  { label: "Research Brief", to: ROUTES.BRIEF },
];

export const SIDEBAR_LINKS = [
  { label: "Dashboard", to: ROUTES.DASHBOARD, icon: "LayoutDashboard" },
  { label: "Research Documents", to: ROUTES.RESEARCH, icon: "FileSearch" },
  { label: "Case Explorer", to: ROUTES.CASE_EXPLORER, icon: "Network" },
  { label: "Argument Analysis", to: ROUTES.ARGUMENTS, icon: "Swords" },
  { label: "Conflict Detector", to: ROUTES.CONFLICTS, icon: "ShieldAlert" },
  { label: "Research Brief", to: ROUTES.BRIEF, icon: "NotebookPen" },
  { label: "Settings", to: "/settings", icon: "Settings" },
];

export const VERIFICATION_STATUS = {
  AVAILABLE: "source_available",
  RECOMMENDED: "verification_recommended",
  UNVERIFIED: "unverified",
};

export const RELATIONSHIP_TYPES = {
  CITES: "Cites",
  FOLLOWS: "Follows",
  SUPPORTS: "Supports",
  SIMILAR: "Similar To",
  DISTINGUISHES: "Distinguishes",
  CONFLICT: "Potential Conflict",
};

export const DEMO_DATA_LABEL = "Demo Data — For Prototype Demonstration";
