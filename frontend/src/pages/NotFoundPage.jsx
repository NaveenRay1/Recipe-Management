import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
      <p className="mt-1 text-ink/60">The page you are looking for doesn't exist or has moved.</p>
      <Link to="/" className="mt-6 rounded-xl bg-primary px-5 py-3 font-medium text-white hover:bg-primary-dark">
        Back to recipes
      </Link>
    </div>
  );
}