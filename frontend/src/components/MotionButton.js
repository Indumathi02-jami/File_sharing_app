import { motion } from "framer-motion";

function MotionButton({ children, className = "", type = "button", ...props }) {
  return (
    <motion.button
      type={type}
      className={`motion-button ${className}`.trim()}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.14, ease: "easeOut" }}
      {...props}
    >
      <span className="motion-button__glow" />
      <span className="motion-button__content">{children}</span>
    </motion.button>
  );
}

export default MotionButton;
