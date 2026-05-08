import { useMemo, useState } from "react";
import Button from "../../../components/ui/Button";
import { toast } from "../../../hooks/useToasts";

const SETTINGS_KEY = "eduhub-admin-settings";

export default function AdminSettingsPage() {
  const initialSettings = useMemo(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore invalid local storage data
    }
    return {
      maintenanceMode: false,
      allowStudentUploads: true,
      emailNotifications: true,
    };
  }, []);

  const [settings, setSettings] = useState(initialSettings);

  const toggle = (key) =>
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

  const saveSettings = () => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      toast.success("Platform settings saved locally.");
    } catch {
      toast.error("Unable to persist settings.");
    }
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <div>
        <h1 className="text-[var(--text-3xl)] font-black text-[var(--color-text)]">
          Platform Settings
        </h1>
        <p className="text-[var(--text-sm)] text-[var(--color-text-3)] mt-1">
          Configure operational defaults and communication policies.
        </p>
      </div>

      <div className="surface p-5 space-y-4">
        {[
          ["maintenanceMode", "Maintenance Mode", "Temporarily restrict write operations."],
          ["allowStudentUploads", "Allow Student Uploads", "Enable student upload center."],
          ["emailNotifications", "Email Notifications", "Send system alerts by email."],
        ].map(([key, label, description]) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4"
          >
            <div>
              <p className="text-sm font-semibold text-[var(--color-text)]">{label}</p>
              <p className="text-xs text-[var(--color-text-3)] mt-1">{description}</p>
            </div>
            <button
              onClick={() => toggle(key)}
              className={`h-7 w-12 rounded-full transition-colors relative ${
                settings[key] ? "bg-[var(--color-accent)]" : "bg-[var(--color-surface-3)]"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
                  settings[key] ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>
        ))}
        <div className="pt-2">
          <Button onClick={saveSettings}>Save Settings</Button>
        </div>
      </div>
    </div>
  );
}
