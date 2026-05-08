import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * MobileMenu - Responsive menu component for mobile devices
 * Toggles sidebar visibility on small screens
 */
export function MobileMenu({ children, navItems = [], onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleNavClick = (item) => {
    setIsOpen(false);
    if (onNavigate) onNavigate(item);
  };

  return (
    <>
      {/* Mobile menu button - visible only on small screens */}
      <button
        onClick={toggleMenu}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-2)] transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay - closes menu when clicked */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed left-0 top-0 h-screen w-64 bg-[var(--color-ink)] z-45 pt-16 overflow-y-auto shadow-xl"
          >
            <div className="p-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id || item.label}
                  onClick={() => handleNavClick(item)}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-[var(--color-surface-2)] transition-colors text-[var(--color-text-2)] hover:text-[var(--color-text)]"
                >
                  <div className="flex items-center gap-3">
                    {item.icon && <span className="text-lg">{item.icon}</span>}
                    <span className="font-medium">{item.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Content */}
      <main className="md:ml-0">{children}</main>
    </>
  );
}

export default MobileMenu;
