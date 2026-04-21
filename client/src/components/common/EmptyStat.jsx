import Button from "../ui/Button";

export default function EmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="mb-4 text-5xl" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-slate-500 max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {action && typeof action === "function" && actionLabel && (
        <Button className="mt-5" size="sm" onClick={action}>
          {actionLabel}
        </Button>
      )}
      {action && typeof action !== "function" && (
        <div className="mt-5">{action}</div>
      )}
    </div>
  );
}

export { EmptyState };
