import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { usePrefersReducedMotion } from "../../lib/motion";

/**
 * Animated wordmark orb used in shell + marketing headers.
 */
export default function BrandMark({
  size = "md",
  className,
  animated = true,
}) {
  const reduced = usePrefersReducedMotion();
  const sizeMap = {
    sm: "h-8 w-8 text-sm",
    md: "h-9 w-9 text-[15px]",
    lg: "h-14 w-14 text-2xl",
  };

  const classes = cn(
    "flex shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--color-accent)] to-[#516dff]",
    "font-black text-white shadow-[var(--shadow-accent)] ring-2 ring-[var(--color-accent)]/35",
    sizeMap[size],
    className,
  );

  if (!animated || reduced) {
    return <div className={classes}>E</div>;
  }

  return (
    <motion.div
      className={classes}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
    >
      E
    </motion.div>
  );
}
