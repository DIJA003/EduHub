import {
  Home,
  LayoutDashboard,
  BookOpen,
  Upload,
  Bell,
  Activity,
  Star,
  User,
  Users,
  Shield,
  BarChart3,
  ClipboardList,
  Settings,
  FileText,
  Building2,
  GraduationCap,
} from "lucide-react";

export const ROLE_HOME = {
  student: "/student",
  mentor: "/mentor",
  admin: "/admin",
};

export const NAV_BY_ROLE = {
  student: [
    { to: "/", label: "Home", icon: Home, end: true },
    { to: "/student", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/student/courses", label: "My Courses", icon: BookOpen },
    { to: "/student/upload", label: "Upload Center", icon: Upload },
    { to: "/student/notifications", label: "Notifications", icon: Bell },
    { to: "/student/logs", label: "Activity Logs", icon: Activity },
    { to: "/student/reviews", label: "Reviews", icon: Star },
    { to: "/profile", label: "Profile", icon: User },
  ],
  mentor: [
    { to: "/", label: "Home", icon: Home, end: true },
    { to: "/mentor", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/mentor/courses", label: "Assigned Courses", icon: BookOpen },
    { to: "/mentor/reviews", label: "Review Queue", icon: ClipboardList },
    { to: "/mentor/notifications", label: "Notifications", icon: Bell },
    { to: "/mentor/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/mentor/logs", label: "Logs", icon: Activity },
  ],
  admin: [
    { to: "/", label: "Home", icon: Home, end: true },
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/users", label: "User Management", icon: Users },
    { to: "/admin/moderation", label: "Moderation", icon: Shield },
    { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/admin/logs", label: "Audit Logs", icon: Activity },
    { to: "/admin/settings", label: "Platform Settings", icon: Settings },
    { to: "/admin/notifications", label: "Notifications", icon: Bell },
    { to: "/admin/colleges", label: "Colleges", icon: Building2 },
    { to: "/admin/courses", label: "Courses", icon: GraduationCap },
    { to: "/admin/materials", label: "Materials", icon: FileText },
  ],
};

// Quick access items for the topbar
export const QUICK_ACTIONS = {
  student: [
    { label: "Browse Courses", to: "/academic-year", icon: BookOpen },
    { label: "Upload Material", to: "/student/upload", icon: Upload },
  ],
  mentor: [
    { label: "Review Queue", to: "/mentor/reviews", icon: ClipboardList },
  ],
  admin: [
    { label: "Manage Users", to: "/admin/users", icon: Users },
  ],
};
