"use client";

export function StatusFilter({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
    >
      <option value="">Tous les statuts</option>
      <option value="1">Actif</option>
      <option value="0">Inactif</option>
    </select>
  );
}
