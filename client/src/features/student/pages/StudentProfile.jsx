import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardShell from "../../../components/layout/DashboardShell";
import Button from "../../../components/ui/Button";
import useAuthStore from "../../../stores/auth.store";
import apiClient from "../../../lib/api/client";
import { useToast } from "../../../hooks/useToasts";

export default function StudentProfile() {
  const dbUser = useAuthStore((s) => s.dbUser);
  const refreshDbUser = useAuthStore((s) => s.refreshDbUser);
  const { addToast } = useToast();

  const [form, setForm] = useState({ name: "", college: "", bio: "" });
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (dbUser) {
      setForm({
        name: dbUser.name || "",
        college: dbUser.college || "",
        bio: dbUser.bio || "",
      });
      setDirty(false);
    }
  }, [dbUser]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setDirty(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return addToast("Name cannot be empty.", "error");
    setLoading(true);
    try {
      await apiClient.put("/users/profile", {
        name: form.name.trim(),
        college: form.college.trim(),
        bio: form.bio.trim(),
      });
      await refreshDbUser();
      setDirty(false);
      addToast("Profile updated successfully.", "success");
    } catch (err) {
      addToast(err.message || "Failed to update profile.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!dbUser) return null;

  const initials = dbUser.name
    ? dbUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <DashboardShell title="My Profile" user={dbUser}>
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent)] text-xl font-black text-white">
            {initials}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)]">{dbUser.name}</h2>
            <p className="text-sm text-[var(--color-text-3)]">{dbUser.email}</p>
            <span className="mt-1 inline-flex items-center rounded-full bg-[var(--color-accent-soft)] px-2.5 py-0.5 text-xs font-semibold capitalize text-[var(--color-accent)]">
              {dbUser.role}
            </span>
          </div>
        </div>

        <div className="surface p-8 shadow-sm">
          <h3 className="mb-6 text-sm font-bold text-[var(--color-text-2)]">
            Personal information
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="mb-1.5 block text-xs font-semibold text-[var(--color-text-2)]"
                htmlFor="name"
              >
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--color-text-2)]">
                Email
              </label>
              <input
                value={dbUser.email}
                disabled
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-2.5 text-sm text-[var(--color-text-3)] cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-[var(--color-text-3)]">
                Email is managed by your account settings.
              </p>
            </div>
            <div>
              <label
                className="mb-1.5 block text-xs font-semibold text-[var(--color-text-2)]"
                htmlFor="college"
              >
                College / Faculty
              </label>
              <input
                id="college"
                name="college"
                type="text"
                value={form.college}
                onChange={handleChange}
                placeholder="Your college or faculty"
                className="w-full rounded-lg border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
              />
            </div>
            <div>
              <label
                className="mb-1.5 block text-xs font-semibold text-[var(--color-text-2)]"
                htmlFor="bio"
              >
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                value={form.bio}
                onChange={handleChange}
                placeholder="A short bio (optional)"
                className="w-full resize-none rounded-lg border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" loading={loading} disabled={!dirty}>
                Save changes
              </Button>
              <Link
                to="/change-password"
                className="text-sm font-semibold text-[var(--color-text-2)] hover:text-[var(--color-accent)] transition-colors"
              >
                Change password →
              </Link>
            </div>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}
