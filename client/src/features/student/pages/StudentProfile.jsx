import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Camera, Bell, Shield, User } from "lucide-react";
import DashboardShell from "../../../components/layout/DashboardShell";
import Button from "../../../components/ui/Button";
import useAuthStore from "../../../stores/auth.store";
import apiClient from "../../../lib/api/client";
import { useToast } from "../../../hooks/useToasts";
import { usersApi } from "../../../lib/api/users.api";

export default function StudentProfile() {
  const dbUser = useAuthStore((s) => s.dbUser);
  const refreshDbUser = useAuthStore((s) => s.refreshDbUser);
  const { addToast } = useToast();

  const [form, setForm] = useState({ name: "", bio: "" });
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const fileInputRef = useRef(null);
  useEffect(() => {
    if (dbUser) {
      setForm({
        name: dbUser.name || "",
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

  // Stable callback to prevent re-renders
  const handleAvatarClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      addToast("Please select an image file.", "error");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      addToast("Image must be less than 2MB.", "error");
      return;
    }

    setUploadingAvatar(true);
    try {
      const res = await usersApi.uploadAvatar(file);
      console.log("[Client] Upload response:", res.data);
      const photoURL = res.data?.data?.photoURL;
      if (photoURL) {
        // Update user profile with new photoURL
        await apiClient.put("/users/profile", { photoURL });
        await refreshDbUser();
        addToast("Profile picture updated.", "success");
        console.log("[Client] Profile updated, new photoURL:", photoURL);
      }
    } catch (err) {
      console.error("[Client] Upload error:", err);
      addToast(err.message || "Failed to upload avatar.", "error");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleDeleteAccount = () => {
    // Navigate to account deletion confirmation or show modal
    addToast("Account deletion requires admin approval.", "info");
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
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-5">
          <div className="relative">
            <div 
              className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-accent)] text-2xl font-black text-white cursor-pointer overflow-hidden hover:ring-2 hover:ring-[var(--color-accent)] transition-all"
              onClick={handleAvatarClick}
              title="Click to change photo"
            >
              {dbUser.photoURL ? (
                <img 
                  src={`${dbUser.photoURL}?v=${Date.now()}`}
                  alt={dbUser.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    console.error("[Client] Image failed to load:", dbUser.photoURL);
                    e.target.style.display = 'none';
                    e.target.parentElement.textContent = initials;
                  }}
                  onLoad={() => console.log("[Client] Image loaded:", dbUser.photoURL)}
                />
              ) : (
                initials
              )}
            </div>
            <button
              onClick={handleAvatarClick}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 p-1.5 bg-[var(--color-surface)] rounded-full border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors"
              title="Change photo"
            >
              <Camera className="w-4 h-4 text-[var(--color-text-2)]" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)]">{dbUser.name}</h2>
            <p className="text-sm text-[var(--color-text-3)]">{dbUser.email}</p>
            <span className="mt-1 inline-flex items-center rounded-full bg-[var(--color-accent-soft)] px-2.5 py-0.5 text-xs font-semibold capitalize text-[var(--color-accent)]">
              {dbUser.role}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-[var(--color-border)]">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "profile"
                  ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                  : "border-transparent text-[var(--color-text-2)] hover:text-[var(--color-text)]"
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "security"
                  ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                  : "border-transparent text-[var(--color-text-2)] hover:text-[var(--color-text)]"
              }`}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              Security
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "notifications"
                  ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                  : "border-transparent text-[var(--color-text-2)] hover:text-[var(--color-text)]"
              }`}
            >
              <Bell className="w-4 h-4 inline mr-2" />
              Notifications
            </button>
          </nav>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
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
            {dbUser.faculty && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--color-text-2)]">
                  Faculty
                </label>
                <input
                  value={typeof dbUser.faculty === 'object' ? dbUser.faculty.name : dbUser.faculty}
                  disabled
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-2.5 text-sm text-[var(--color-text-3)] cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-[var(--color-text-3)]">
                  Faculty is managed by the system.
                </p>
              </div>
            )}
            {dbUser.program && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--color-text-2)]">
                  Program
                </label>
                <input
                  value={typeof dbUser.program === 'object' ? dbUser.program.name : dbUser.program}
                  disabled
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-2.5 text-sm text-[var(--color-text-3)] cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-[var(--color-text-3)]">
                  Program is managed by the system.
                </p>
              </div>
            )}
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
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="surface p-8 shadow-sm space-y-6">
            <div>
              <h3 className="mb-6 text-sm font-bold text-[var(--color-text-2)]">
                Security Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg">
                  <div>
                    <h4 className="font-medium text-[var(--color-text)]">Password</h4>
                    <p className="text-sm text-[var(--color-text-3)]">Change your account password</p>
                  </div>
                  <Link
                    to="/change-password"
                    className="px-4 py-2 text-sm font-medium text-[var(--color-accent)] border border-[var(--color-accent)] rounded-md hover:bg-[var(--color-accent-soft)] transition-colors"
                  >
                    Change Password
                  </Link>
                </div>
                <div className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg">
                  <div>
                    <h4 className="font-medium text-[var(--color-text)]">Two-Factor Authentication</h4>
                    <p className="text-sm text-[var(--color-text-3)]">Add extra security to your account</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-medium text-[var(--color-text-3)] bg-[var(--color-surface-2)] rounded-full">
                    Coming Soon
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg">
                  <div>
                    <h4 className="font-medium text-[var(--color-text)]">Login History</h4>
                    <p className="text-sm text-[var(--color-text-3)]">View your recent login activity</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-medium text-[var(--color-text-3)] bg-[var(--color-surface-2)] rounded-full">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-6 border-t border-[var(--color-border)]">
              <h3 className="mb-4 text-sm font-bold text-red-600">
                Danger Zone
              </h3>
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50/10">
                <div>
                  <h4 className="font-medium text-[var(--color-text)]">Delete Account</h4>
                  <p className="text-sm text-[var(--color-text-3)]">Permanently delete your account and all data</p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="surface p-8 shadow-sm">
            <h3 className="mb-6 text-sm font-bold text-[var(--color-text-2)]">
              Notification Preferences
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg">
                <div>
                  <h4 className="font-medium text-[var(--color-text)]">Email Notifications</h4>
                  <p className="text-sm text-[var(--color-text-3)]">Receive updates via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-[var(--color-surface-2)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent)]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg">
                <div>
                  <h4 className="font-medium text-[var(--color-text)]">Course Updates</h4>
                  <p className="text-sm text-[var(--color-text-3)]">New materials, announcements, etc.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-[var(--color-surface-2)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent)]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg">
                <div>
                  <h4 className="font-medium text-[var(--color-text)]">Mentor Messages</h4>
                  <p className="text-sm text-[var(--color-text-3)]">Direct messages from mentors</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-[var(--color-surface-2)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent)]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg">
                <div>
                  <h4 className="font-medium text-[var(--color-text)]">System Announcements</h4>
                  <p className="text-sm text-[var(--color-text-3)]">Platform updates and news</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-[var(--color-surface-2)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent)]"></div>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
