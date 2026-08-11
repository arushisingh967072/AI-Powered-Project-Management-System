import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import API from "../../services/api";
import toast from "react-hot-toast";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";

import type { User as Employee } from "../../types";

const employeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().optional(),
  role: z.enum(["project_manager", "employee"]),
  phone: z.string().optional(),
  department: z.string().optional(),
  experience: z.number().min(0, "Experience cannot be negative"),
  skills: z.string().optional(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
  });

  const fetchEmployees = async () => {
    try {
      const response = await API.get("/employees");
      if (response.data.success) {
        setEmployees(response.data.employees);
      }
    } catch (error) {
      toast.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const openAddModal = () => {
    setEditEmployee(null);
    reset({
      name: "",
      email: "",
      password: "",
      role: "employee",
      phone: "",
      department: "",
      experience: 0,
      skills: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditEmployee(emp);
    reset({
      name: emp.name,
      email: emp.email,
      password: "",
      role: emp.role === "admin" ? "employee" : emp.role, // clamp admin role edit safety
      phone: emp.phone || "",
      department: emp.department || "",
      experience: emp.experience || 0,
      skills: emp.skills?.join(", ") || "",
    });
    setModalOpen(true);
  };

  const openDeleteModal = (emp: Employee) => {
    setEmployeeToDelete(emp);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!employeeToDelete) return;

    try {
      setIsDeleting(true);

      const response = await API.delete(
        `/employees/${employeeToDelete._id}`
      );

      if (response.data.success) {
        toast.success("User deleted successfully");
        setDeleteModalOpen(false);
        setEmployeeToDelete(null);
        fetchEmployees();
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete user"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const onSubmit = async (data: EmployeeFormValues) => {
    try {
      const payload = {
        ...data,
        skills: data.skills ? data.skills.split(",").map((s) => s.trim()) : [],
      };

      if (editEmployee) {
        // Update
        const response = await API.put(`/employees/${editEmployee._id}`, payload);
        if (response.data.success) {
          toast.success("User updated successfully");
          setModalOpen(false);
          fetchEmployees();
        }
      } else {
        // Add
        const response = await API.post("/employees", payload);
        if (response.data.success) {
          toast.success("User created successfully");
          setModalOpen(false);
          fetchEmployees();
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save user");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-200">Staff Management</h2>
          <p className="text-xs text-gray-500 mt-1">Manage project managers and development staff credentials</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer flex items-center gap-2"
        >
          <FiPlus size={16} />
          Add Employee / PM
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-75">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-[#1e2e4f]/30 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="text-xs text-gray-500 uppercase bg-[#0d1627] border-b border-[#1e2e4f]/20">
                <tr>
                  <th className="px-6 py-4 font-semibold">Name / Email</th>
                  <th className="px-6 py-4 font-semibold">System Role</th>
                  <th className="px-6 py-4 font-semibold">Department</th>
                  <th className="px-6 py-4 font-semibold">Exp</th>
                  <th className="px-6 py-4 font-semibold">Skills</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2e4f]/15">
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 italic">
                      No employees or managers registered yet. Click above to add some.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp._id} className="hover:bg-gray-800/20 transition-all">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-200">{emp.name}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">{emp.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${emp.role === "project_manager"
                            ? "bg-purple-950/40 text-purple-400 border border-purple-900/40"
                            : "bg-blue-950/40 text-blue-400 border border-blue-900/40"
                            }`}
                        >
                          {emp.role === "project_manager" ? "Project Manager" : "Employee"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300 font-medium">
                        {emp.department || "—"}
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-300">
                        {emp.experience !== undefined ? `${emp.experience}y` : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-50">
                          {emp.skills && emp.skills.length > 0 ? (
                            emp.skills.slice(0, 3).map((skill, index) => (
                              <span
                                key={index}
                                className="px-1.5 py-0.5 bg-gray-900 border border-gray-800 rounded text-[10px] text-gray-400"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-600 italic text-xs">None</span>
                          )}
                          {emp.skills && emp.skills.length > 3 && (
                            <span className="text-[10px] text-gray-500">+{emp.skills.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(emp)}
                            title="Edit employee"
                            className="h-8 w-8 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700/50 text-gray-300 hover:text-white transition-all cursor-pointer"
                          >
                            <FiEdit2 size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openDeleteModal(emp)}
                            title="Delete employee"
                            className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 hover:text-red-300 transition-all cursor-pointer"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Dialog */}
      {/* Add / Edit Employee Modal */}
      {modalOpen &&
        createPortal(
          <div className="fixed inset-0 z-9999 bg-black/70 backdrop-blur-sm">

            {/* Full viewport scroll area */}
            <div className="absolute inset-0 overflow-y-auto">

              {/* Center modal */}
              <div className="min-h-full flex items-center justify-center p-4">

                <div
                  className="w-full max-w-3xl bg-[#0d1627] rounded-2xl border border-[#1e2e4f]/50 shadow-2xl p-6"
                >

                  {/* Header */}
                  <div className="flex items-center justify-between mb-5 border-b border-[#1e2e4f]/25 pb-3">

                    <h3 className="text-lg font-bold text-gray-100">
                      {editEmployee
                        ? "Edit Employee / PM Profile"
                        : "Register New Employee / PM"}
                    </h3>

                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="text-gray-500 hover:text-gray-200 text-xl leading-none cursor-pointer"
                    >
                      ×
                    </button>

                  </div>

                  {/* Form */}
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4"
                  >

                    {/* Name + Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">
                          Full Name
                        </label>

                        <input
                          type="text"
                          {...register("name")}
                          className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        />

                        {errors.name && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">
                          Email Address
                        </label>

                        <input
                          type="email"
                          {...register("email")}
                          className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        />

                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.email.message}
                          </p>
                        )}
                      </div>

                    </div>

                    {/* Password + Role */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">
                          Password {editEmployee && "(optional)"}
                        </label>

                        <input
                          type="password"
                          placeholder={
                            editEmployee
                              ? "Keep existing"
                              : "••••••••"
                          }
                          {...register("password")}
                          className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        />

                        {errors.password && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.password.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">
                          Role Type
                        </label>

                        <select
                          {...register("role")}
                          className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        >
                          <option value="employee">
                            Employee / Developer
                          </option>

                          <option value="project_manager">
                            Project Manager (PM)
                          </option>
                        </select>
                      </div>

                    </div>

                    {/* Phone + Department */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">
                          Phone Number
                        </label>

                        <input
                          type="text"
                          placeholder="+1 (555) 012-3456"
                          {...register("phone")}
                          className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">
                          Department
                        </label>

                        <input
                          type="text"
                          placeholder="Engineering / Product"
                          {...register("department")}
                          className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        />
                      </div>

                    </div>

                    {/* Experience + Skills */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">
                          Years of Exp
                        </label>

                        <input
                          type="number"
                          min="0"
                          {...register("experience", {
                            valueAsNumber: true,
                          })}
                          className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        />

                        {errors.experience && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.experience.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">
                          Skills (comma-separated)
                        </label>

                        <input
                          type="text"
                          placeholder="React, CSS, Express"
                          {...register("skills")}
                          className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        />
                      </div>

                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 justify-end pt-4 border-t border-[#1e2e4f]/25">

                      <button
                        type="button"
                        onClick={() => setModalOpen(false)}
                        className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-xs hover:bg-gray-700 cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-500 cursor-pointer font-semibold flex items-center justify-center min-w-20"
                      >
                        {isSubmitting ? (
                          <div
                            className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                          />
                        ) : (
                          "Save User"
                        )}
                      </button>

                    </div>

                  </form>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {deleteModalOpen && employeeToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0d1627] border border-[#1e2e4f]/50 shadow-2xl animate-fade-in">

            {/* Header */}
            <div className="flex items-start gap-4 p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-950/40 border border-red-900/40">
                <FiTrash2 className="text-red-400" size={20} />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-100">
                  Delete Employee?
                </h3>

                <p className="mt-1 text-sm text-gray-400 leading-relaxed">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-gray-200">
                    {employeeToDelete.name}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t border-[#1e2e4f]/30 px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setEmployeeToDelete(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700/50 text-gray-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 size={14} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
