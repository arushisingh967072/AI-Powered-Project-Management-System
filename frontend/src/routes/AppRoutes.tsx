import React from "react";
import { createBrowserRouter, RouterProvider, Navigate, Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  FiBarChart2,
  FiUsers,
  FiFolder,
  FiBriefcase,
  FiClipboard,
  FiZap,
  FiLogOut,
  FiBell,
} from "react-icons/fi";

// Lazy / direct imports of pages (we'll implement them next)
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

import AdminDashboard from "../pages/admin/AdminDashboard";
import EmployeeManagement from "../pages/admin/EmployeeManagement";
import ProjectManagement from "../pages/admin/ProjectManagement";

import PMDashboard from "../pages/pm/PMDashboard";
import ProjectDetails from "../pages/pm/ProjectDetails";

import EmployeeDashboard from "../pages/employee/EmployeeDashboard";
import UserProfile from "../pages/UserProfile";

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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect unauthorized user to their respective default dashboards
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
// Dashboard Layout (Sidebar + Top Bar + Content Outlet)
// ==========================================
const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (err: any) {
      toast.error("Logout failed");
    }
  };

  if (!user) return <Navigate to="/login" replace />;

  // Determine navigation options based on role
  const getNavLinks = () => {
    switch (user.role) {
      case "admin":
        return [
          {
            to: "/admin",
            label: "Dashboard",
            icon: FiBarChart2,
          },
          {
            to: "/admin/employees",
            label: "Employee Management",
            icon: FiUsers,
          },
          {
            to: "/admin/projects",
            label: "Project Management",
            icon: FiFolder,
          },
        ];

      case "project_manager":
        return [
          {
            to: "/pm",
            label: "PM Dashboard",
            icon: FiBriefcase,
          },
        ];

      case "employee":
        return [
          {
            to: "/employee",
            label: "My Tasks & Bugs",
            icon: FiClipboard,
          },
        ];

      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="flex h-screen bg-[#080d1a] overflow-hidden text-[#e2e8f0]">
      {/* Sidebar Component */}
      <aside className="w-64 bg-[#0d1527] border-r border-[#1e2e4f]/40 flex flex-col justify-between z-10 shrink-0">
        <div>
          {/* Logo / Header */}
          <div className="p-5 border-b border-[#1e2e4f]/30">
  <div className="flex items-center gap-3">
    <div className="h-10 w-10 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
      <FiZap className="text-white" size={21} />
    </div>

    <h2 className="font-bold text-lg text-white">
      ProjectFlow
    </h2>
  </div>
</div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1">
            {navLinks.map((link) => {
              const isActive =
                link.to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(link.to);

              const Icon = link.icon;

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                      ? "bg-blue-600/15 text-blue-400 border-l-4 border-blue-500 font-medium"
                      : "text-gray-400 hover:bg-gray-800/40 hover:text-gray-200"
                    }`}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card at the bottom */}
        <div className="p-4 border-t border-[#1e2e4f]/30 space-y-2">
          <Link
            to="/profile"
            className={`flex items-center gap-3 p-2 rounded-xl transition-all hover:bg-gray-800/45 ${location.pathname === "/profile" ? "bg-gray-800/40" : ""
              }`}
          >
            <div className="h-10 w-10 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-300">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-medium text-sm text-gray-200 truncate leading-none mb-1">
                {user.name}
              </h4>
              <p className="text-[10px] text-gray-500 capitalize">{user.role.replace("_", " ")}</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-950/20 hover:bg-red-950/40 text-red-400 text-xs font-semibold rounded-lg border border-red-900/30 transition-all cursor-pointer"
          >
            <FiLogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-[#1e2e4f]/30 flex items-center justify-between px-8 bg-[#0a1122]">
          <h1 className="text-xl font-bold bg-linear-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
            {location.pathname.startsWith("/admin")
              ? "Administrator Portal"
              : location.pathname.startsWith("/pm")
                ? "Project Manager Workspace"
                : location.pathname.startsWith("/profile")
                  ? "Account Profile"
                  : "Employee Workstation"}
          </h1>
          <div className="flex items-center gap-6">
            <span className="px-3 py-1 bg-blue-950/40 border border-blue-900/40 rounded-full text-xs text-blue-400 font-medium capitalize">
              Role: {user.role.replace("_", " ")}
            </span>
            <div className="text-gray-400 hover:text-gray-200 relative cursor-pointer">
              <FiBell size={20} />

              <span className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full animate-ping" />
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// ==========================================
// Router Definitions
// ==========================================
const router = createBrowserRouter([
  // Public/Auth routes
  {
    path: "/",
    element: <Navigate to="/login" replace />,
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
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password/:token",
    element: <ResetPassword />,
  },

  // Protected Admin Routes
  {
    path: "/admin",
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "", element: <AdminDashboard /> },
          { path: "employees", element: <EmployeeManagement /> },
          { path: "projects", element: <ProjectManagement /> },
        ],
      },
    ],
  },

  // Protected Project Manager Routes
  {
    path: "/pm",
    element: <ProtectedRoute allowedRoles={["project_manager"]} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "", element: <PMDashboard /> },
        ],
      },
    ],
  },

  // Protected Employee Routes
  {
    path: "/employee",
    element: <ProtectedRoute allowedRoles={["employee"]} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "", element: <EmployeeDashboard /> },
        ],
      },
    ],
  },

  // Common Profile & Project Workspace Route
  {
    path: "/",
    element: <ProtectedRoute allowedRoles={["admin", "project_manager", "employee"]} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "profile", element: <UserProfile /> },
          { path: "project/:projectId", element: <ProjectDetails /> },
        ],
      },
    ],
  },

  // Fallback Route
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);

export const AppRoutes: React.FC = () => {
  return <RouterProvider router={router} />;
};
export default AppRoutes;
