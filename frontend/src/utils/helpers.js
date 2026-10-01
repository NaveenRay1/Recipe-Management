// Turn an axios error into a readable message (message + validation errors).
export function getErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  const data = err?.response?.data;
  if (!data) return err?.message === 'Network Error' ? 'Cannot reach the server.' : fallback;
  const base = data.message || fallback;
  return Array.isArray(data.errors) && data.errors.length ? `${base}: ${data.errors.join(', ')}` : base;
}

// Image paths may be absolute URLs or server-relative paths (e.g. /uploads/x.jpg).
export function resolveImage(src) {
  if (!src) return null;
  if (/^(https?:|data:|blob:)/i.test(src)) return src;
  const origin = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
  return `${origin}${src.startsWith('/') ? '' : '/'}${src}`;
}

export const totalMinutes = (r) => (Number(r?.prepTime) || 0) + (Number(r?.cookTime) || 0);

export function formatMinutes(mins) {
  if (!mins) return '—';
  if (mins < 60) return `${mins} mins`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export const formatRating = (avg) => (Number(avg) > 0 ? Number(avg).toFixed(1) : 'New');

export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';

export const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?';

// Remove empty values so they are not sent as query params.
export function cleanParams(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== '' && v != null && v !== false));
}

// Build the multipart body exactly as the backend expects.
export function buildRecipeFormData(values, imageFile) {
  const fd = new FormData();
  fd.append('title', values.title.trim());
  fd.append('instructions', values.instructions.trim());
  fd.append('description', values.description?.trim() || '');
  ['prepTime', 'cookTime', 'servings'].forEach((k) => {
    if (values[k] !== '' && values[k] != null) fd.append(k, String(values[k]));
  });
  if (values.difficulty) fd.append('difficulty', values.difficulty);
  ['isVegetarian', 'isVegan', 'isGlutenFree'].forEach((k) => fd.append(k, values[k] ? 'true' : 'false'));
  const ingredients = values.ingredients
    .map((i) => ({ name: i.name.trim(), quantity: i.quantity.trim() }))
    .filter((i) => i.name);
  fd.append('ingredients', JSON.stringify(ingredients));
  fd.append('categoryIds', JSON.stringify(values.categoryIds.map(Number)));
  if (imageFile) fd.append('image', imageFile);
  return fd;
}