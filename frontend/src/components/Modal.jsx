import React from "react";

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-2xl bg-gray-950 border border-gray-800 shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div className="text-lg font-bold">{title}</div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-800 text-sm"
          >
            ✕
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
