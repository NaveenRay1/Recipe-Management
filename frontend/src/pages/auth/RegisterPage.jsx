import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';
import { getErrorMessage } from '../../utils/helpers';

const field = 'w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-primary';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setSubmitting(true);
    try {
      // The server logs the user in immediately after registering
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      toast.success('Account created!');
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
      setSubmitting(false);
    }
    return undefined;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-2xl font-bold">Create your account</h1>
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">Name</label>
        <input id="name" required autoComplete="name" className={field} value={form.name} onChange={set('name')} />
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
        <input id="email" type="email" required autoComplete="email" className={field} value={form.email} onChange={set('email')} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
        <input id="password" type="password" required minLength={6} autoComplete="new-password" className={field} value={form.password} onChange={set('password')} />
        <p className="mt-1 text-xs text-ink/50">At least 6 characters</p>
      </div>
      <Button type="submit" size="lg" loading={submitting} className="w-full">Sign up</Button>
      <p className="text-center text-sm text-ink/60">
        Already have an account? <Link to="/login" state={location.state} className="font-medium text-primary">Log in</Link>
      </p>
    </form>
  );
}