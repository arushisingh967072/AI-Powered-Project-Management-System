import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";

// ==========================================
// Auth Pages
// ==========================================
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import VerifyOTP from "../pages/auth/VerifyOTP";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VerifyResetOTP from "../pages/auth/VerifyResetOTP";
import ResetPassword from "../pages/auth/ResetPassword";

// ==========================================
// Admin Pages
// ==========================================
import AdminDashboard from "../pages/admin/AdminDashboard";
import EmployeeManagement from "../pages/admin/EmployeeManagement";
import ProjectManagement from "../pages/admin/ProjectManagement";

// ==========================================
// Project Manager Pages
// ==========================================
import PMDashboard from "../pages/pm/PMDashboard";
import ProjectDetails from "../pages/pm/ProjectDetails";

// ==========================================
// Employee Pages
// ==========================================
import EmployeeDashboard from "../pages/employee/EmployeeDashboard";
import UserProfile from "../pages/UserProfile";
import Analytics from "../pages/Analytics";

// ==========================================
// Protected Route Guard
// ==========================================
interface ProtectedRouteProps {
  allowedRoles?: ("admin" | "project_manager" | "employee")[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const defaultRedirect =
      user.role === "admin"
        ? "/admin"
        : user.role === "project_manager"
        ? "/pm"
        : "/employee";

    return <Navigate to={defaultRedirect} replace />;
  }

  return <Outlet />;
};

// ==========================================
// Router Definitions
// ==========================================

const router = createBrowserRouter([
  // ==========================================
  // PUBLIC / AUTH ROUTES
  // ==========================================

  {
    path: "/",
    element: (
      <Navigate
        to="/login"
        replace
      />
    ),
  },

  {
    path: "/login",
    element: <Login />,
  },

  {
    path: "/signup",
    element: <Signup />,
  },

  {
  path: "/verify-otp",
  element: <VerifyOTP />,
},

  // Forgot Password - Public
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },

  // Reset OTP Verification - Public
  {
    path: "/verify-reset-otp",
    element: <VerifyResetOTP />,
  },

  // Reset Password - Public
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },

  // ==========================================
  // PROTECTED ADMIN ROUTES
  // ==========================================

  {
    path: "/admin",
    element: (
      <ProtectedRoute
        allowedRoles={["admin"]}
      />
    ),

    children: [
      {
        element: <DashboardLayout />,

        children: [
          {
            path: "",
            element: <AdminDashboard />,
          },

          {
            path: "employees",
            element: <EmployeeManagement />,
          },

          {
            path: "projects",
            element: <ProjectManagement />,
          },

          {
            path: "analytics",
            element: <Analytics />,
          },
        ],
      },
    ],
  },

  // ==========================================
  // PROTECTED PROJECT MANAGER ROUTES
  // ==========================================

  {
    path: "/pm",
    element: (
      <ProtectedRoute
        allowedRoles={["project_manager"]}
      />
    ),

    children: [
      {
        element: <DashboardLayout />,

        children: [
          {
            path: "",
            element: <PMDashboard />,
          },

          {
            path: "analytics",
            element: <Analytics />,
          },
        ],
      },
    ],
  },

  // ==========================================
  // PROTECTED EMPLOYEE ROUTES
  // ==========================================

  {
    path: "/employee",
    element: (
      <ProtectedRoute
        allowedRoles={["employee"]}
      />
    ),

    children: [
      {
        element: <DashboardLayout />,

        children: [
          {
            path: "",
            element: <EmployeeDashboard />,
          },

          {
            path: "analytics",
            element: <Analytics />,
          },
        ],
      },
    ],
  },

  // ==========================================
  // COMMON PROTECTED ROUTES
  // ==========================================

  {
    path: "/",
    element: (
      <ProtectedRoute
        allowedRoles={[
          "admin",
          "project_manager",
          "employee",
        ]}
      />
    ),

    children: [
      {
        element: <DashboardLayout />,

        children: [
          {
            path: "profile",
            element: <UserProfile />,
          },

          {
            path: "project/:projectId",
            element: <ProjectDetails />,
          },
        ],
      },
    ],
  },

  // ==========================================
  // FALLBACK
  // ==========================================

  {
    path: "*",
    element: (
      <Navigate
        to="/login"
        replace
      />
    ),
  },
]);

// ==========================================
// App Routes
// ==========================================

export const AppRoutes: React.FC = () => {
  return (
    <RouterProvider
      router={router}
    />
  );
};

export default AppRoutes;