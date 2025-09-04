import React from 'react';
import { Palette } from 'lucide-react';

export function ThemeToggle() {
  // This component is now deprecated since we removed theme switching
  // Keeping it as a placeholder for potential future palette switching
  return (
    <button
      className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
      aria-label="Theme options"
      disabled
    >
      <Palette className="h-5 w-5" />
    </button>
  );
}