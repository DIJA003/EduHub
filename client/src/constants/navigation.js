export const ROLE_HOME = {
  student: "/student",
  mentor: "/mentor",
  admin: "/admin",
};

export const NAV_BY_ROLE = {
  student: [
    { to: "/student", label: "Dashboard", icon: "⬡", end: true },
    { to: "/student/courses", label: "My Courses", icon: "◈" },
    { to: "/student/upload", label: "Upload Center", icon: "⊕" },
    { to: "/student/notifications", label: "Notifications", icon: "◉" },
    { to: "/student/logs", label: "Activity Logs", icon: "◎" },
    { to: "/student/reviews", label: "Reviews", icon: "◇" },
    { to: "/profile", label: "Profile", icon: "◌" },
  ],
  mentor: [
    { to: "/mentor", label: "Dashboard", icon: "⬡", end: true },
    { to: "/mentor/courses", label: "Assigned Courses", icon: "◈" },
    { to: "/mentor/reviews", label: "Review Queue", icon: "◎" },
    { to: "/mentor/uploads", label: "Student Uploads", icon: "⊕" },
    { to: "/mentor/notifications", label: "Notifications", icon: "◉" },
    { to: "/mentor/analytics", label: "Analytics", icon: "◇" },
    { to: "/mentor/logs", label: "Logs", icon: "◌" },
  ],
  admin: [
    { to: "/admin", label: "Dashboard", icon: "⬡", end: true },
    { to: "/admin/users", label: "User Management", icon: "◉" },
    { to: "/admin/moderation", label: "Moderation", icon: "◎" },
    { to: "/admin/analytics", label: "Analytics", icon: "◈" },
    { to: "/admin/logs", label: "Audit Logs", icon: "◇" },
    { to: "/admin/settings", label: "Platform Settings", icon: "◌" },
    { to: "/admin/notifications", label: "Notifications", icon: "⊕" },
  ],
};
