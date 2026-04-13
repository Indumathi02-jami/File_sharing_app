import { motion } from "framer-motion";

function EmptyState({ title, message }) {
  return (
    <motion.div
      className="empty-state-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="empty-state-icon">+</div>
      <h3>{title}</h3>
      <p>{message}</p>
    </motion.div>
  );
}

export default EmptyState;
