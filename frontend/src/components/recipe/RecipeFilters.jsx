import Button from '../common/Button';

const TOGGLES = [
  { key: 'vegetarian', label: 'Vegetarian' },
  { key: 'vegan', label: 'Vegan' },
  { key: 'glutenFree', label: 'Gluten-free' },
];
const PREP = [15, 30, 45, 60, 120];
const select = 'w-full rounded-xl border border-line bg-white px-3 py-2 text-sm';

// `values` comes straight from the URL query; `onChange(patch)` merges a patch back into it.
export default function RecipeFilters({ values, onChange, onClear }) {
  return (
    <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex flex-wrap gap-5">
        {TOGGLES.map((t) => (
          <label key={t.key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
              checked={values[t.key] === 'true'}
              onChange={(e) => onChange({ [t.key]: e.target.checked ? 'true' : '' })}
            />
            {t.label}
          </label>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block text-ink/60">Difficulty</span>
          <select className={select} value={values.difficulty || ''} onChange={(e) => onChange({ difficulty: e.target.value })}>
            <option value="">Any</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-ink/60">Max prep time</span>
          <select className={select} value={values.maxPrepTime || ''} onChange={(e) => onChange({ maxPrepTime: e.target.value })}>
            <option value="">Any</option>
            {PREP.map((m) => (
              <option key={m} value={m}>{m} mins</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-ink/60">Min rating</span>
          <select className={select} value={values.minRating || ''} onChange={(e) => onChange({ minRating: e.target.value })}>
            <option value="">Any</option>
            {[1, 2, 3, 4].map((r) => (
              <option key={r} value={r}>{r}+ stars</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex justify-end">
        <Button variant="outline" size="sm" onClick={onClear}>Clear all</Button>
      </div>
    </div>
  );
}