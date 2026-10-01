import { ArrowUpDown } from 'lucide-react';

const OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'rating', label: 'Top rated' },
  { value: 'quickest', label: 'Quickest' },
];

export default function SortDropdown({ value, onChange }) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-sm">
      <ArrowUpDown size={16} />
      <span className="sr-only">Sort by</span>
      <select value={value || 'newest'} onChange={(e) => onChange(e.target.value)} className="bg-transparent outline-none">
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}