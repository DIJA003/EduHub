import { motion } from 'framer-motion';
import { pageTransition } from '../../lib/animations';

/**
 * PageTransition - Wraps page content with fade transition animation
 * Ensures smooth transitions between different pages/routes
 */
export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
