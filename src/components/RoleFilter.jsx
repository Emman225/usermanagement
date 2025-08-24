"use client";

export function RoleFilter({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
    >
      <option value="">Tous les rôles</option>
      <option value="admin">Admin</option>
      <option value="user">Utilisateur</option>
    </select>
  );
}
