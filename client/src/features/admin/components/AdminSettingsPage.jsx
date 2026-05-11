import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "../../../lib/api/settings.api";
import Button from "../../../components/ui/Button";
import { toast } from "../../../hooks/useToasts";
import { Save, RotateCcw, Settings, Shield, Bell, Palette, GraduationCap, Globe } from "lucide-react";

const CATEGORIES = {
  general: { label: "General", icon: Globe, color: "blue" },
  security: { label: "Security", icon: Shield, color: "red" },
  notifications: { label: "Notifications", icon: Bell, color: "amber" },
  academic: { label: "Academic", icon: GraduationCap, color: "green" },
  appearance: { label: "Appearance", icon: Palette, color: "purple" },
};

const SettingInput = ({ setting, value, onChange }) => {
  const { type, key } = setting;

  if (type === "boolean") {
    return (
      <button
        onClick={() => onChange(key, !value)}
        className={`h-7 w-12 rounded-full transition-colors relative ${
          value ? "bg-[var(--color-accent)]" : "bg-[var(--color-surface-3)]"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
            value ? "right-1" : "left-1"
          }`}
        />
      </button>
    );
  }

  if (type === "number") {
    return (
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(key, parseInt(e.target.value, 10))}
        className="w-24 rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      />
    );
  }

  if (type === "array") {
    return (
      <input
        type="text"
        value={Array.isArray(value) ? value.join(", ") : value}
        onChange={(e) => onChange(key, e.target.value.split(",").map((s) => s.trim()))}
        placeholder="Comma-separated values"
        className="w-48 rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(key, e.target.value)}
      className="w-48 rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
    />
  );
};

export default function AdminSettingsPage() {
  const [activeCategory, setActiveCategory] = useState("general");
  const [editedValues, setEditedValues] = useState({});
  const qc = useQueryClient();

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsApi.getAll(),
  });

  const settings = useMemo(() => {
    const data = settingsData?.data || settingsData || [];
    return Array.isArray(data) ? data : [];
  }, [settingsData]);

  const groupedSettings = useMemo(() => {
    const grouped = {};
    settings.forEach((s) => {
      if (!grouped[s.category]) grouped[s.category] = [];
      grouped[s.category].push(s);
    });
    return grouped;
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: ({ key, value }) => settingsApi.update(key, { value }),
    onSuccess: () => {
      qc.invalidateQueries(["settings"]);
      toast.success("Setting updated");
    },
    onError: (e) => toast.error(e.message),
  });

  const resetMutation = useMutation({
    mutationFn: (key) => settingsApi.reset(key),
    onSuccess: () => {
      qc.invalidateQueries(["settings"]);
      toast.success("Setting reset to default");
    },
    onError: (e) => toast.error(e.message),
  });

  const handleValueChange = (key, value) => {
    setEditedValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (key) => {
    if (editedValues[key] !== undefined) {
      updateMutation.mutate({ key, value: editedValues[key] });
      setEditedValues((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleReset = (key) => {
    resetMutation.mutate(key);
    setEditedValues((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const getDisplayValue = (setting) => {
    if (editedValues[setting.key] !== undefined) {
      return editedValues[setting.key];
    }
    return setting.value;
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-up">
        <div className="h-8 w-48 bg-[var(--color-surface-2)] rounded animate-pulse" />
        <div className="surface p-5 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[var(--color-surface-2)] rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <div>
        <h1 className="text-[var(--text-3xl)] font-black text-[var(--color-text)]">Platform Settings</h1>
        <p className="text-[var(--text-sm)] text-[var(--color-text-3)] mt-1">
          Configure system-wide settings and operational policies.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(CATEGORIES).map(([key, { label, icon: Icon }]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] text-sm font-semibold transition-colors ${
              activeCategory === key
                ? "bg-[var(--color-accent)] text-white"
                : "bg-[var(--color-surface-2)] border border-[var(--color-border-2)] text-[var(--color-text-3)] hover:text-[var(--color-text)]"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Settings List */}
      <div className="surface p-5 space-y-4">
        {groupedSettings[activeCategory]?.length === 0 ? (
          <div className="text-center py-8 text-[var(--color-text-3)]">
            <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No settings in this category</p>
          </div>
        ) : (
          groupedSettings[activeCategory]?.map((setting) => (
            <div
              key={setting.key}
              className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4"
            >
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  {setting.key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </p>
                <p className="text-xs text-[var(--color-text-3)] mt-1">{setting.description}</p>
                <p className="text-xs text-[var(--color-text-3)] mt-0.5 font-mono">
                  Key: {setting.key} | Type: {setting.type}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <SettingInput
                  setting={setting}
                  value={getDisplayValue(setting)}
                  onChange={handleValueChange}
                />
                {editedValues[setting.key] !== undefined && (
                  <Button size="sm" onClick={() => handleSave(setting.key)} loading={updateMutation.isPending}>
                    <Save className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleReset(setting.key)}
                  loading={resetMutation.isPending}
                  title="Reset to default"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Card */}
      <div className="surface p-4 bg-[var(--color-accent-soft)] border-[var(--color-accent)]">
        <p className="text-sm text-[var(--color-text-2)]">
          <strong>Note:</strong> Changes to settings take effect immediately. Some settings may require a page refresh to be fully applied.
        </p>
      </div>
    </div>
  );
}

