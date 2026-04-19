import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import { useAuth } from "../hooks/useAuth";

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const Home = lazy(() => import("../features/home/pages/Home"));
const Login = lazy(() => import("../features/auth/pages/Login"));
const Register = lazy(() => import("../features/auth/pages/Register"));
const ForgotPassword = lazy(
  () => import("../features/auth/pages/ForgotPassword"),
);
const EmailVerification = lazy(
  () => import("../features/auth/pages/EmailVerification"),
);
const ChangePassword = lazy(
  () => import("../features/auth/pages/ChangePassword"),
);
const FirebaseActionHandler = lazy(
  () => import("../features/auth/pages/FirebaseActionHandler"),
);

const AcademicYear = lazy(
  () => import("../features/courses/pages/AcademicYear"),
);
const YearDetail = lazy(() => import("../features/courses/pages/YearDetail"));
const CoursePlayer = lazy(
  () => import("../features/courses/pages/CoursePlayer"),
);
const StudentDashboard = lazy(
  () => import("../features/student/pages/StudentDashboard"),
);
const StudentProfile = lazy(
  () => import("../features/student/pages/StudentProfile"),
);

const AdminDashboard = lazy(
  () => import("../features/admin/pages/AdminDashboard"),
);
const MentorDashboard = lazy(
  () => import("../features/mentor/pages/MentorDashboard"),
);
const NotFound = lazy(() => import("../pages/NotFound"));

function RequireAuth({ children, roles = [], requireVerified = false }) {
  const { user, firebaseUser, loading, role } = useAuth();

  if (loading) return <PageLoader />;
  if (!firebaseUser) return <Navigate to="/login" replace />;
  if (requireVerified && !firebaseUser.emailVerified)
    return <Navigate to="/verify-email" replace />;

  if (!user) return <PageLoader />; // Waiting for dbUser

  if (roles.length > 0 && !roles.includes(role)) {
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "mentor") return <Navigate to="/mentor" replace />;
    return <Navigate to="/home" replace />;
  }

  return children;
}

function RoleRedirect() {
  const { user, firebaseUser, loading, role } = useAuth();
  if (loading) return <PageLoader />;
  if (!firebaseUser) return <Navigate to="/home" replace />;
  if (!user) return <PageLoader />;
  if (role === "admin") return <Navigate to="/admin" replace />;
  if (role === "mentor") return <Navigate to="/mentor" replace />;
  return <Navigate to="/home" replace />;
}

const router = createBrowserRouter([
  { path: "/", element: <RoleRedirect /> },

  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/forgotpassword", element: <ForgotPassword /> },
  { path: "/verify-email", element: <EmailVerification /> },
  { path: "/auth/action", element: <FirebaseActionHandler /> },
  {
    path: "/change-password",
    element: (
      <RequireAuth>
        <ChangePassword />
      </RequireAuth>
    ),
  },

  // Public
  { path: "/home", element: <Home /> },

  // Student
  {
    path: "/academic-year",
    element: (
      <RequireAuth requireVerified>
        <AcademicYear />
      </RequireAuth>
    ),
  },
  {
    path: "/academic-year/:yearId",
    element: (
      <RequireAuth requireVerified roles={["student"]}>
        <YearDetail />
      </RequireAuth>
    ),
  },
  {
    path: "/academic-year/:yearId/course/:courseId",
    element: (
      <RequireAuth requireVerified roles={["student"]}>
        <CoursePlayer />
      </RequireAuth>
    ),
  },
  {
    path: "/std-dashboard",
    element: (
      <RequireAuth requireVerified>
        <StudentDashboard />
      </RequireAuth>
    ),
  },
  {
    path: "/profile",
    element: (
      <RequireAuth requireVerified>
        <StudentProfile />
      </RequireAuth>
    ),
  },

  // Admin
  {
    path: "/admin/*",
    element: (
      <RequireAuth roles={["admin"]} requireVerified>
        <AdminDashboard />
      </RequireAuth>
    ),
  },

  // Mentor
  {
    path: "/mentor/*",
    element: (
      <RequireAuth roles={["mentor"]} requireVerified>
        <MentorDashboard />
      </RequireAuth>
    ),
  },

  { path: "*", element: <NotFound /> },
]);

export default function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
