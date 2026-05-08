import { motion } from 'framer-motion';
import { scaleIn, hoverLift } from '../../lib/animations';

/**
 * AnimatedCard - Card component with entrance and hover animations
 * Uses Framer Motion for smooth, performant animations
 */
export function AnimatedCard({
  children,
  className = '',
  variant = 'default',
  animated = true,
  delay = 0,
  ...props
}) {
  const variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
        delay,
      },
    },
  };

  const content = (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );

  if (!animated) return content;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={variants}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
    >
      {content}
    </motion.div>
  );
}

export default AnimatedCard;
