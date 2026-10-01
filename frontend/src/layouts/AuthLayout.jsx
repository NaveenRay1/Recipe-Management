import { ChefHat } from 'lucide-react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import Loader from '../components/common/Loader';
import useAuth from '../hooks/useAuth';

export default function AuthLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader fullPage />;
  // Already logged in: go back to where the visitor came from, or home
  if (user) return <Navigate to={location.state?.from?.pathname || '/'} replace />;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 py-10">
      <Link to="/" className="mb-6 flex items-center gap-2 text-xl font-bold">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
          <ChefHat size={22} />
        </span>
        RecipeBox
      </Link>
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <Outlet />
      </div>
    </div>
  );
}