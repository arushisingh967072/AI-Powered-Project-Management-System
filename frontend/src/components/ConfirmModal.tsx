import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { FiTrash2, FiAlertTriangle, FiInfo, FiX } from "react-icons/fi";

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          iconBg: "bg-red-950/50 border-red-900/50 text-red-400",
          icon: <FiTrash2 size={22} />,
          btn: "bg-red-600 hover:bg-red-500 text-white shadow-red-950/50",
        };
      case "warning":
        return {
          iconBg: "bg-amber-950/50 border-amber-900/50 text-amber-400",
          icon: <FiAlertTriangle size={22} />,
          btn: "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/50",
        };
      case "info":
      default:
        return {
          iconBg: "bg-blue-950/50 border-blue-900/50 text-blue-400",
          icon: <FiInfo size={22} />,
          btn: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-950/50",
        };
    }
  };

  const styles = getVariantStyles();

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-md bg-[#0d1627] rounded-2xl border border-[#1e2e4f]/60 shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 p-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          <FiX size={18} />
        </button>

        {/* Content Container */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-inner ${styles.iconBg}`}
            >
              {styles.icon}
            </div>

            <div className="flex-1 pr-4">
              <h3 className="text-lg font-bold text-gray-100 leading-snug">
                {title}
              </h3>
              <div className="mt-2 text-xs text-gray-400 leading-relaxed">
                {message}
              </div>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex justify-end gap-3 border-t border-[#1e2e4f]/30 px-6 py-4 bg-[#090f1c]/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700/50 text-gray-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${styles.btn}`}
          >
            {isLoading ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
