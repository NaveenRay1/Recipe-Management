import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={`flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 shadow-sm ${className}`}>
      <Search size={18} className="shrink-0 text-ink/60" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full bg-transparent text-sm outline-none placeholder:text-ink/40"
      />
    </div>
  );
}