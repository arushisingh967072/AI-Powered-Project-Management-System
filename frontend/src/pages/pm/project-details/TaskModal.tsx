import React from "react";
import { createPortal } from "react-dom";
import type { Project, Sprint } from "../../../types";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  sprints: Sprint[];
  taskForm: {
    name: string;
    description: string;
    techStack: string;
    priority: string;
    assignedEmployee: string;
    sprint: string;
    deadline: string;
    generateWithAI: boolean;
  };
  setTaskForm: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  project,
  sprints,
  taskForm,
  setTaskForm,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 bg-black/70 backdrop-blur-sm">
      <div className="absolute inset-0 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0d1627] rounded-2xl border border-[#1e2e4f]/50 shadow-2xl p-6">
            <h3 className="text-base font-bold text-gray-200 border-b border-[#1e2e4f]/25 pb-3 mb-4">
              Add Project Task
            </h3>

            <form onSubmit={onSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-400 mb-1">
                  Task Name
                </label>
                <input
                  type="text"
                  placeholder="Draft Backend Schemas and Models"
                  className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={taskForm.name}
                  onChange={(e) =>
                    setTaskForm({
                      ...taskForm,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="aiCheck"
                  checked={taskForm.generateWithAI}
                  onChange={(e) =>
                    setTaskForm({
                      ...taskForm,
                      generateWithAI: e.target.checked,
                    })
                  }
                  className="rounded border-[#1e2e4f]/40 bg-gray-900 text-blue-500 focus:ring-0 cursor-pointer"
                />
                <label
                  htmlFor="aiCheck"
                  className="font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
                >
                  Auto-generate task description using AI
                </label>
              </div>

              {!taskForm.generateWithAI && (
                <div>
                  <label className="block font-semibold text-gray-400 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter manual task specifications..."
                    className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                    value={taskForm.description}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        description: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-400 mb-1">
                    Target Tech Stack
                  </label>
                  <input
                    type="text"
                    placeholder="Mongoose, Node.js"
                    className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={taskForm.techStack}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        techStack: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-400 mb-1">
                    Priority
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={taskForm.priority}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
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
                    value={taskForm.assignedEmployee}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
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
                    Assign to Sprint
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={taskForm.sprint}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
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
                  value={taskForm.deadline}
                  onChange={(e) =>
                    setTaskForm({
                      ...taskForm,
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
                  Create
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

export default TaskModal;
