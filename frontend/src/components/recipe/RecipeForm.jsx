import { ImagePlus, Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { getCategories } from '../../api/category.api';
import { buildRecipeFormData, getErrorMessage, resolveImage } from '../../utils/helpers';
import Button from '../common/Button';
import Loader from '../common/Loader';

const field = 'w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-primary';
const label = 'mb-1 block text-sm font-medium';

// `initial` is a full recipe (edit mode) or null (create mode).
export default function RecipeForm({ initial = null, onSubmit, submitting = false, submitLabel = 'Save recipe' }) {
  const keyRef = useRef(0);
  const newRow = (name = '', quantity = '') => ({ key: ++keyRef.current, name, quantity });

  const [values, setValues] = useState({
    title: '', description: '', instructions: '', prepTime: '', cookTime: '', servings: '',
    difficulty: '', isVegetarian: false, isVegan: false, isGlutenFree: false,
    ingredients: [newRow()], categoryIds: [],
  });
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((e) => toast.error(getErrorMessage(e)))
      .finally(() => setCatLoading(false));
  }, []);

  // Pre-fill in edit mode
  useEffect(() => {
    if (!initial) return;
    setValues({
      title: initial.title || '',
      description: initial.description || '',
      instructions: initial.instructions || '',
      prepTime: initial.prepTime ?? '',
      cookTime: initial.cookTime ?? '',
      servings: initial.servings ?? '',
      difficulty: initial.difficulty || '',
      isVegetarian: !!initial.isVegetarian,
      isVegan: !!initial.isVegan,
      isGlutenFree: !!initial.isGlutenFree,
      ingredients: initial.ingredients?.length ? initial.ingredients.map((i) => newRow(i.name, i.quantity || '')) : [newRow()],
      categoryIds: (initial.categories || []).map((c) => c.id),
    });
    setPreview(resolveImage(initial.image));
  }, [initial]); // eslint-disable-line react-hooks/exhaustive-deps

  // Preview for a newly picked file (revoked on change/unmount)
  useEffect(() => {
    if (!file) return undefined;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const set = (patch) => setValues((v) => ({ ...v, ...patch }));
  const setIngredient = (key, patch) =>
    set({ ingredients: values.ingredients.map((i) => (i.key === key ? { ...i, ...patch } : i)) });
  const toggleCategory = (id) =>
    set({ categoryIds: values.categoryIds.includes(id) ? values.categoryIds.filter((c) => c !== id) : [...values.categoryIds, id] });

  const pickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) return toast.error('Please choose an image file');
    if (f.size > 5 * 1024 * 1024) return toast.error('Image must be 5 MB or smaller');
    setFile(f);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (values.title.trim().length < 3) return toast.error('Title must be at least 3 characters');
    if (!values.instructions.trim()) return toast.error('Instructions are required');
    if (!values.ingredients.some((i) => i.name.trim())) return toast.error('Add at least one ingredient');
    if (values.servings !== '' && Number(values.servings) < 1) return toast.error('Servings must be at least 1');
    return onSubmit(buildRecipeFormData(values, file));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
      <div>
        <label className={label} htmlFor="title">Title *</label>
        <input id="title" className={field} value={values.title} onChange={(e) => set({ title: e.target.value })} />
      </div>
      <div>
        <label className={label} htmlFor="description">Description</label>
        <textarea id="description" rows={2} className={field} value={values.description} onChange={(e) => set({ description: e.target.value })} />
      </div>

      <div>
        <span className={label}>Photo</span>
        <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-line p-3 hover:bg-primary-soft/50">
          {preview ? (
            <img src={preview} alt="Preview" className="h-24 w-32 rounded-lg object-cover" />
          ) : (
            <span className="flex h-24 w-32 items-center justify-center rounded-lg bg-primary-soft text-primary"><ImagePlus size={28} /></span>
          )}
          <span className="text-sm text-ink/60">Click to choose an image (max 5 MB)</span>
          <input type="file" accept="image/*" className="hidden" onChange={pickFile} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[['prepTime', 'Prep time (min)'], ['cookTime', 'Cook time (min)'], ['servings', 'Servings']].map(([k, l]) => (
          <div key={k}>
            <label className={label} htmlFor={k}>{l}</label>
            <input id={k} type="number" min={k === 'servings' ? 1 : 0} className={field} value={values[k]} onChange={(e) => set({ [k]: e.target.value })} />
          </div>
        ))}
        <div>
          <label className={label} htmlFor="difficulty">Difficulty</label>
          <select id="difficulty" className={field} value={values.difficulty} onChange={(e) => set({ difficulty: e.target.value })}>
            <option value="">Not set</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-5">
        {[['isVegetarian', 'Vegetarian'], ['isVegan', 'Vegan'], ['isGlutenFree', 'Gluten-free']].map(([k, l]) => (
          <label key={k} className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-primary" checked={values[k]} onChange={(e) => set({ [k]: e.target.checked })} />
            {l}
          </label>
        ))}
      </div>

      <div>
        <span className={label}>Categories</span>
        {catLoading ? <Loader /> : categories.length === 0 ? (
          <p className="text-sm text-ink/60">No categories available yet.</p>
        ) : (
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {categories.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="h-4 w-4 accent-primary" checked={values.categoryIds.includes(c.id)} onChange={() => toggleCategory(c.id)} />
                {c.name}
              </label>
            ))}
          </div>
        )}
      </div>

      <div>
        <span className={label}>Ingredients *</span>
        <div className="space-y-2">
          {values.ingredients.map((i) => (
            <div key={i.key} className="flex gap-2">
              <input aria-label="Ingredient name" placeholder="Name (e.g. Flour)" className={field} value={i.name} onChange={(e) => setIngredient(i.key, { name: e.target.value })} />
              <input aria-label="Quantity" placeholder="Quantity (e.g. 200 g)" className={field} value={i.quantity} onChange={(e) => setIngredient(i.key, { quantity: e.target.value })} />
              <button
                type="button"
                aria-label="Remove ingredient"
                disabled={values.ingredients.length === 1}
                onClick={() => set({ ingredients: values.ingredients.filter((x) => x.key !== i.key) })}
                className="rounded-lg p-2 text-ink/60 hover:bg-primary-soft disabled:opacity-30"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => set({ ingredients: [...values.ingredients, newRow()] })}>
          <Plus size={16} /> Add ingredient
        </Button>
      </div>

      <div>
        <label className={label} htmlFor="instructions">Instructions *</label>
        <textarea id="instructions" rows={8} className={field} value={values.instructions} onChange={(e) => set({ instructions: e.target.value })} />
      </div>

      <Button type="submit" size="lg" loading={submitting}>{submitLabel}</Button>
    </form>
  );
}