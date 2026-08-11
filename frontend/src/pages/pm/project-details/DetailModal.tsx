import React from "react";
import { createPortal } from "react-dom";
import type { User, Task, Bug, DiscussionMessage } from "../../../types";

const formatDate = (date: string | Date | undefined): string => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

interface DetailModalProps {
  user: User | null;
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  selectedBug: Bug | null;
  setSelectedBug: (bug: Bug | null) => void;
  messages: DiscussionMessage[];
  setMessages: React.Dispatch<React.SetStateAction<DiscussionMessage[]>>;
  typedMessage: string;
  setTypedMessage: (msg: string) => void;
  attachedFile: File | null;
  setAttachedFile: (file: File | null) => void;
  uploadingAttachment: boolean;
  handleStatusTransition: (id: string, type: "task" | "bug", status: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  user,
  selectedTask,
  setSelectedTask,
  selectedBug,
  setSelectedBug,
  messages,
  setMessages,
  typedMessage,
  setTypedMessage,
  attachedFile,
  setAttachedFile,
  uploadingAttachment,
  handleStatusTransition,
  handleSendMessage,
}) => {
  if (!selectedTask && !selectedBug) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 bg-black/75 backdrop-blur-md">
      <div className="absolute inset-0 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center p-4">
          <div className="w-full max-w-4xl min-h-150 max-h-[calc(100vh-32px)] bg-[#090e1a] rounded-2xl border border-[#1e2e4f]/60 shadow-2xl flex flex-col md:flex-row overflow-hidden">
            {/* ====================================================
              LEFT SIDE: ITEM DETAILS & WORKFLOW
            ==================================================== */}
            <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto border-b md:border-b-0 md:border-r border-[#1e2e4f]/30 text-xs">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-blue-950/40 text-blue-400 border border-blue-900/40">
                    {selectedTask ? "Task Ticket" : "Defect Bug Ticket"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTask(null);
                      setSelectedBug(null);
                      setMessages([]);
                    }}
                    className="text-gray-500 hover:text-gray-300 text-sm font-bold cursor-pointer"
                  >
                    ✕ Close
                  </button>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-gray-100">
                  {selectedTask ? selectedTask.name : selectedBug?.name}
                </h3>

                {/* Description */}
                <div className="bg-[#060b13] p-4 border border-gray-800 rounded-lg font-mono text-[11px] text-gray-300 whitespace-pre-line leading-relaxed max-h-55 overflow-y-auto">
                  {selectedTask ? selectedTask.description : selectedBug?.description}
                </div>

                {/* Details */}
                <div className="space-y-2 border-t border-[#1e2e4f]/15 pt-3">
                  {/* Status */}
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Current Status:</span>
                    <span className="font-bold text-blue-400 capitalize text-right">
                      {selectedTask ? selectedTask.status.replace("_", " ") : selectedBug?.status}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Target Date:</span>
                    <span className="text-gray-300 font-semibold font-mono text-right">
                      {formatDate(selectedTask ? selectedTask.deadline : selectedBug?.deadline)}
                    </span>
                  </div>

                  {/* Assignee */}
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Team Assignee:</span>
                    <span className="text-gray-300 font-semibold text-right">
                      {selectedTask
                        ? selectedTask.assignedEmployee?.name
                        : selectedBug?.assignedEmployee?.name || "Unassigned"}
                    </span>
                  </div>

                  {/* Reported By */}
                  {selectedBug && (
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">Reported By:</span>
                      <span className="text-gray-300 font-semibold text-right">
                        {selectedBug.reportedBy?.name || "N/A"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ====================================================
                 STATUS WORKFLOW
               ==================================================== */}
              <div className="border-t border-[#1e2e4f]/15 pt-4 mt-6 space-y-2">
                <span className="block font-semibold text-gray-500 mb-1">
                  Transition Workflow Stage:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {["todo", "in_progress", "testing", "done"].map((st) => {
                    const active = selectedTask
                      ? selectedTask.status === st
                      : selectedBug?.status === st;

                    const stLabel =
                      st === "todo"
                        ? "To Do"
                        : st === "in_progress"
                        ? "In Progress"
                        : st === "testing"
                        ? "Testing"
                        : "Done";

                    return (
                      <button
                        type="button"
                        key={st}
                        onClick={() =>
                          handleStatusTransition(
                            selectedTask ? selectedTask._id : selectedBug?._id || "",
                            selectedTask ? "task" : "bug",
                            st
                          )
                        }
                        className={`py-2 rounded-lg font-bold transition-all cursor-pointer border ${
                          active
                            ? "bg-blue-600 border-blue-500 text-white"
                            : "bg-[#0b0f19] hover:bg-gray-800 border-gray-800 text-gray-400"
                        }`}
                      >
                        {stLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ====================================================
               RIGHT SIDE: DISCUSSION PANEL
            ==================================================== */}
            <div className="w-full md:w-1/2 flex flex-col h-125 md:h-auto bg-[#070b14]">
              {/* Discussion Header */}
              <div className="p-4 border-b border-[#1e2e4f]/30 flex items-center justify-between bg-[#0a101f] shrink-0">
                <div>
                  <h4 className="font-bold text-xs text-gray-200">Discussion Panel</h4>
                  <span className="text-[10px] text-gray-550">
                    Clarify requirements & share updates
                  </span>
                </div>
                <span className="text-sm">💬</span>
              </div>

              {/* Message History */}
              <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-gray-650 italic text-center">
                    No messages posted. Share files or text updates below.
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex flex-col text-[11px] max-w-[85%] ${
                        msg.sender?._id === user?._id ? "ml-auto items-end" : "mr-auto items-start"
                      }`}
                    >
                      {/* Sender */}
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-gray-500">
                        <span className="font-bold text-gray-300">{msg.sender?.name}</span>
                        <span className="capitalize text-[8px] bg-gray-800 px-1 py-0.5 rounded text-gray-400">
                          {msg.sender?.role.replace("_", " ")}
                        </span>
                      </div>

                      {/* Message */}
                      <div
                        className={`p-3 rounded-xl border text-gray-200 leading-relaxed shadow-sm break-all ${
                          msg.sender?._id === user?._id
                            ? "bg-blue-950/20 border-blue-900/40 rounded-tr-none text-right"
                            : "bg-gray-900/40 border-gray-800 rounded-tl-none"
                        }`}
                      >
                        <p>{msg.message}</p>

                        {msg.fileUrl && (
                          <div className="mt-2 pt-2 border-t border-gray-800/40 flex items-center gap-2">
                            <span className="text-xs">📎</span>
                            <a
                              href={`${(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "")}${
                                msg.fileUrl
                              }`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:underline font-semibold font-mono truncate max-w-37.5"
                            >
                              {msg.fileName || "View Attachment"}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Time */}
                      <span className="text-[8px] text-gray-650 mt-1 font-mono">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* ====================================================
               CHAT INPUT
              ==================================================== */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-[#1e2e4f]/35 bg-[#0a101f] text-xs shrink-0"
              >
                {/* Attached File */}
                {attachedFile && (
                  <div className="px-2.5 py-1.5 bg-blue-950/20 border border-blue-900/40 rounded-lg mb-2 flex items-center justify-between text-[10px] text-blue-300">
                    <span className="truncate max-w-50">📎 File Selected: {attachedFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachedFile(null)}
                      className="text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div className="flex gap-2 items-center">
                  {/* File Upload */}
                  <label className="h-9 w-9 shrink-0 bg-gray-900 border border-gray-800 hover:bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer text-lg filter hover:brightness-110">
                    📎
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setAttachedFile(e.target.files[0]);
                        }
                      }}
                    />
                  </label>

                  {/* Message Input */}
                  <input
                    type="text"
                    placeholder="Type an update or clarify requirement details..."
                    className="flex-1 min-w-0 px-3 py-2 bg-[#080d1a] border border-[#1e2e4f]/30 rounded-lg text-gray-200 focus:outline-none h-9 text-xs"
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                  />

                  {/* Send */}
                  <button
                    type="submit"
                    disabled={uploadingAttachment}
                    className="h-9 px-4 shrink-0 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-all cursor-pointer text-xs"
                  >
                    {uploadingAttachment ? "Uploading..." : "Send"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DetailModal;
