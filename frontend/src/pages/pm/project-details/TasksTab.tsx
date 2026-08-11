import React from "react";
import type { Task } from "../../../types";

const formatDate = (date: string | Date | undefined): string => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

interface TasksTabProps {
  tasks: Task[];
  isPM: boolean;
  setTaskModalOpen: (open: boolean) => void;
  setSelectedTask: (task: Task | null) => void;
}

export const TasksTab: React.FC<TasksTabProps> = ({
  tasks,
  isPM,
  setTaskModalOpen,
  setSelectedTask,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-200">Sprint Tasks Kanban</h3>
          <p className="text-xs text-gray-555 mt-1">Develop specs, transition workflows, and collaborate</p>
        </div>
        {isPM && (
          <button
            onClick={() => setTaskModalOpen(true)}
            className="px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
          >
            ➕ Create Task
          </button>
        )}
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {(["todo", "in_progress", "testing", "done"] as const).map((col) => {
          const colTasks = tasks.filter((t) => t.status === col);
          const colLabel =
            col === "todo"
              ? "To Do"
              : col === "in_progress"
              ? "In Progress"
              : col === "testing"
              ? "Internal Testing"
              : "Completed Done";
          const colColor =
            col === "todo"
              ? "border-t-2 border-gray-600 text-gray-400 bg-gray-900/10"
              : col === "in_progress"
              ? "border-t-2 border-blue-500 text-blue-400 bg-blue-950/5"
              : col === "testing"
              ? "border-t-2 border-purple-500 text-purple-400 bg-purple-950/5"
              : "border-t-2 border-emerald-500 text-emerald-400 bg-emerald-950/5";

          return (
            <div key={col} className={`glass-card rounded-2xl p-4 border border-[#1e2e4f]/20 flex flex-col space-y-4 ${colColor}`}>
              <div className="flex items-center justify-between border-b border-[#1e2e4f]/15 pb-2">
                <h4 className="font-bold text-xs uppercase tracking-wider">{colLabel}</h4>
                <span className="px-2 py-0.5 bg-gray-950/40 border border-gray-800 rounded-full text-[10px] text-gray-400">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-100">
                {colTasks.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-650 italic">No tasks</div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task._id}
                      onClick={() => setSelectedTask(task)}
                      className="bg-[#0b0f19] hover:bg-[#0f1526]/85 border border-[#1e2e4f]/25 rounded-xl p-4 space-y-3 shadow cursor-pointer transition-all hover:scale-[1.01] hover:border-blue-500/20"
                    >
                      <h5 className="font-bold text-sm text-gray-200 line-clamp-1">{task.name}</h5>
                      <p className="text-[11px] text-gray-405 line-clamp-2 leading-relaxed">
                        {task.description.replace(/[#*`]/g, "")}
                      </p>

                      <div className="flex flex-wrap gap-1">
                        {task.techStack?.slice(0, 2).map((tech, i) => (
                          <span key={i} className="text-[9px] px-1 bg-gray-900 border border-gray-800 rounded text-gray-550">
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between border-t border-[#1e2e4f]/10 pt-2.5 text-[10px] text-gray-500">
                        <span className="capitalize px-1.5 py-0.5 bg-gray-900 rounded font-semibold text-gray-400">
                          {task.priority} Priority
                        </span>
                        <span className="font-mono">
                          {formatDate(task.deadline)}
                        </span>
                      </div>

                      {task.assignedEmployee && (
                        <div className="flex items-center gap-2 pt-1">
                          <div className="h-5 w-5 rounded-full bg-blue-900/30 flex items-center justify-center font-bold text-[9px] text-blue-400 border border-blue-800/40 uppercase">
                            {task.assignedEmployee.name.charAt(0)}
                          </div>
                          <span className="text-[10px] text-gray-400 truncate">
                            {task.assignedEmployee.name}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TasksTab;
