import React from "react";

export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded bg-[#3a57e8] text-white font-semibold hover:bg-[#2a3dbb] transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
} 