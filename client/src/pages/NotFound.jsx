import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import { EduHubLogoText } from "../components/ui/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--color-ink)] px-4">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <EduHubLogoText />
        </div>
        <p className="text-8xl font-black text-[var(--color-accent)] mb-4">404</p>
        <h1 className="text-2xl font-black text-[var(--color-text)] mb-2">
          Page not found
        </h1>
        <p className="text-[var(--color-text-3)] mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button size="lg">Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
