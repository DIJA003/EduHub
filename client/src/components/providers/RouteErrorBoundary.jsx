import { Component } from "react";
import Button from "../ui/Button";

export default class RouteErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[EduHub]", error?.message ?? error, info?.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.assign("/home");
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--color-ink)] px-4 py-16 text-center">
        <div className="glass max-w-md rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-8 shadow-[var(--shadow-xl)]">
          <p className="font-display text-2xl font-semibold text-[var(--color-text)]">
            Something broke
          </p>
          <p className="mt-3 text-[var(--text-sm)] leading-relaxed text-[var(--color-text-3)]">
            This page crashed unexpectedly. Try going home—the rest of EduHub should
            be fine.
          </p>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <pre className="mt-4 max-h-40 overflow-auto rounded-[var(--radius-md)] bg-[var(--color-surface-2)] p-3 text-left font-mono text-[10px] text-[var(--color-danger)]">
              {String(this.state.error?.message)}
            </pre>
          )}
          <div className="mt-8 flex justify-center gap-3">
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Reload
            </Button>
            <Button onClick={this.handleReset}>Go home</Button>
          </div>
        </div>
      </div>
    );
  }
}
