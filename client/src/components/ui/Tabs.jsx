import { useState, createContext, useContext, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

const TabsContext = createContext(null);

export function Tabs({ defaultValue, value, onValueChange, children, className }) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value ?? internalValue;

  const handleChange = (newValue) => {
    if (onValueChange) {
      onValueChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, onChange: handleChange }}>
      <div className={cn("w-full", className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center gap-1 p-1",
        "bg-[var(--color-surface-2)] rounded-[var(--radius-lg)]",
        "border border-[var(--color-border)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, icon: Icon, className }) {
  const context = useContext(TabsContext);
  const isActive = context?.value === value;
  const id = useId();

  return (
    <button
      role="tab"
      id={`tab-${id}`}
      aria-selected={isActive}
      aria-controls={`panel-${id}`}
      onClick={() => context?.onChange(value)}
      className={cn(
        "relative flex items-center gap-2 px-4 py-2",
        "text-[var(--text-sm)] font-medium rounded-[var(--radius-md)]",
        "transition-colors duration-[var(--duration-fast)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
        isActive
          ? "text-[var(--color-text)]"
          : "text-[var(--color-text-3)] hover:text-[var(--color-text-2)]",
        className,
      )}
    >
      {isActive && (
        <motion.div
          layoutId="active-tab"
          className="absolute inset-0 bg-[var(--color-surface)] rounded-[var(--radius-md)] shadow-[var(--shadow-sm)]"
          transition={{ type: "spring", duration: 0.3, bounce: 0.15 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" strokeWidth={1.75} />}
        {children}
      </span>
    </button>
  );
}

export function TabsContent({ value, children, className }) {
  const context = useContext(TabsContext);
  const isActive = context?.value === value;
  const id = useId();

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          role="tabpanel"
          id={`panel-${id}`}
          aria-labelledby={`tab-${id}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className={cn("mt-4", className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Underline variant
export function TabsListUnderline({ children, className }) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center gap-6 border-b border-[var(--color-border)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TabsTriggerUnderline({ value, children, icon: Icon, className }) {
  const context = useContext(TabsContext);
  const isActive = context?.value === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => context?.onChange(value)}
      className={cn(
        "relative flex items-center gap-2 pb-3 -mb-px",
        "text-[var(--text-sm)] font-medium",
        "transition-colors duration-[var(--duration-fast)]",
        "focus-visible:outline-none",
        isActive
          ? "text-[var(--color-accent)]"
          : "text-[var(--color-text-3)] hover:text-[var(--color-text-2)]",
        className,
      )}
    >
      {Icon && <Icon className="w-4 h-4" strokeWidth={1.75} />}
      {children}
      {isActive && (
        <motion.div
          layoutId="active-tab-underline"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-accent)]"
          transition={{ type: "spring", duration: 0.3, bounce: 0.15 }}
        />
      )}
    </button>
  );
}
