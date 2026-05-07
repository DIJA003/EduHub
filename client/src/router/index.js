import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense } from "react";
import { RequireAuth, RoleRedirect, PageLoader } from "./guards";

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
const Home = lazy(() => import("../features/home/pages/Home"));
const NotFound = lazy(() => import("../pages/NotFound"));
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

const router = createBrowserRouter([
  { path: "/", element: <RoleRedirect /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/forgotpassword", element: <ForgotPassword /> },
  { path: "/verify-email", element: <EmailVerification /> },
  { path: "/auth/action", element: <FirebaseActionHandler /> },
  { path: "/home", element: <Home /> },
  {
    path: "/change-password",
    element: (
      <RequireAuth>
        <ChangePassword />
      </RequireAuth>
    ),
  },
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
      <RequireAuth requireVerified roles={["student"]}>
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
  {
    path: "/admin/*",
    element: (
      <RequireAuth roles={["admin"]} requireVerified>
        <AdminDashboard />
      </RequireAuth>
    ),
  },
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
