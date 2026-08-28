import { motion } from "framer-motion";

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

export default function StatsCard({ label, value, delta }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="rounded-xl border border-line bg-paper-3 p-5 shadow-panel transition-shadow hover:shadow-panel-lg"
    >
      <p className="text-[12.5px] font-medium text-slate">{label}</p>
      <p className="mt-2 font-display text-3xl font-medium text-ink">{value}</p>
      <p className="mt-1.5 text-[12px] text-verified">{delta}</p>
    </motion.div>
  );
}
