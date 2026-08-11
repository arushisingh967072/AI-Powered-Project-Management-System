import React from "react";
import { createPortal } from "react-dom";
import type { Project, Sprint } from "../../../types";

interface BugModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  sprints: Sprint[];
  bugForm: {
    name: string;
    description: string;
    severity: string;
    priority: string;
    assignedEmployee: string;
    sprint: string;
    deadline: string;
  };
  setBugForm: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => void;
}

export const BugModal: React.FC<BugModalProps> = ({
  isOpen,
  onClose,
  project,
  sprints,
  bugForm,
  setBugForm,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 bg-black/70 backdrop-blur-sm">
      <div className="absolute inset-0 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0d1627] rounded-2xl border border-[#1e2e4f]/50 shadow-2xl p-6">
            <h3 className="text-base font-bold text-gray-200 border-b border-[#1e2e4f]/25 pb-3 mb-4">
              Log Bug Ticket
            </h3>

            <form onSubmit={onSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-400 mb-1">
                  Bug Title / Issue
                </label>
                <input
                  type="text"
                  placeholder="JWT validation fails intermittently on Dashboard refresh"
                  className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={bugForm.name}
                  onChange={(e) =>
                    setBugForm({
                      ...bugForm,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-400 mb-1">
                  Defect Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide logs, error codes, and instructions to reproduce..."
                  className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  value={bugForm.description}
                  onChange={(e) =>
                    setBugForm({
                      ...bugForm,
                      description: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-400 mb-1">
                    Severity
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={bugForm.severity}
                    onChange={(e) =>
                      setBugForm({
                        ...bugForm,
                        severity: e.target.value,
                      })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-400 mb-1">
                    Priority
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={bugForm.priority}
                    onChange={(e) =>
                      setBugForm({
                        ...bugForm,
                        priority: e.target.value,
                      })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-400 mb-1">
                    Assign Developer
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={bugForm.assignedEmployee}
                    onChange={(e) =>
                      setBugForm({
                        ...bugForm,
                        assignedEmployee: e.target.value,
                      })
                    }
                  >
                    <option value="">-- Choose Dev --</option>
                    {project.assignedEmployees?.map((dev) => (
                      <option key={dev._id} value={dev._id}>
                        {dev.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-400 mb-1">
                    Sprint Context
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={bugForm.sprint}
                    onChange={(e) =>
                      setBugForm({
                        ...bugForm,
                        sprint: e.target.value,
                      })
                    }
                  >
                    <option value="">-- Choose Sprint --</option>
                    {sprints.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-400 mb-1">
                  Deadline Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={bugForm.deadline}
                  onChange={(e) =>
                    setBugForm({
                      ...bugForm,
                      deadline: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="flex gap-4 justify-end pt-3 border-t border-[#1e2e4f]/25">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg font-semibold hover:bg-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 cursor-pointer"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BugModal;
