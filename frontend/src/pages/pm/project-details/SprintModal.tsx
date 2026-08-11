import React from "react";
import { createPortal } from "react-dom";

interface SprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  sprintForm: {
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
  };
  setSprintForm: React.Dispatch<
    React.SetStateAction<{
      name: string;
      goal: string;
      startDate: string;
      endDate: string;
    }>
  >;
  onSubmit: (e: React.FormEvent) => void;
}

export const SprintModal: React.FC<SprintModalProps> = ({
  isOpen,
  onClose,
  sprintForm,
  setSprintForm,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 bg-black/70 backdrop-blur-sm">
      <div className="absolute inset-0 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#0d1627] rounded-2xl border border-[#1e2e4f]/50 shadow-2xl p-7">
            <h3 className="text-base font-bold text-gray-200 border-b border-[#1e2e4f]/25 pb-3 mb-4">
              Create Agile Sprint
            </h3>

            <form onSubmit={onSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-400 mb-1">
                  Sprint Name
                </label>
                <input
                  type="text"
                  placeholder="Sprint 1 - Foundations & Core Auth"
                  className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={sprintForm.name}
                  onChange={(e) =>
                    setSprintForm({
                      ...sprintForm,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-400 mb-1">
                  Sprint Goal
                </label>
                <textarea
                  rows={2}
                  placeholder="Implement database Schemas, configure auth routes, and wire React dashboards..."
                  className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-blue-500 resize-none focus:ring-1"
                  value={sprintForm.goal}
                  onChange={(e) =>
                    setSprintForm({
                      ...sprintForm,
                      goal: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-400 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1"
                    value={sprintForm.startDate}
                    onChange={(e) =>
                      setSprintForm({
                        ...sprintForm,
                        startDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-400 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={sprintForm.endDate}
                    onChange={(e) =>
                      setSprintForm({
                        ...sprintForm,
                        endDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#1e2e4f]/25 pt-4 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 font-semibold hover:bg-gray-800 hover:text-gray-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md transition-all cursor-pointer"
                >
                  Create Sprint
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

export default SprintModal;
