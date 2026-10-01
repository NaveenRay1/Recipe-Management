import { Route, Routes } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminRecipesPage from '../pages/admin/AdminRecipesPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import CollectionDetailPage from '../pages/collections/CollectionDetailPage';
import CollectionsPage from '../pages/collections/CollectionsPage';
import FavoritesPage from '../pages/favorites/FavoritesPage';
import BrowsePage from '../pages/home/BrowsePage';
import NotFoundPage from '../pages/NotFoundPage';
import MyProfilePage from '../pages/profile/MyProfilePage';
import PublicProfilePage from '../pages/profile/PublicProfilePage';
import CreateRecipePage from '../pages/recipes/CreateRecipePage';
import EditRecipePage from '../pages/recipes/EditRecipePage';
import MyRecipesPage from '../pages/recipes/MyRecipesPage';
import RecipeDetailPage from '../pages/recipes/RecipeDetailPage';
import FeedPage from '../pages/social/FeedPage';
import AdminRoute from './AdminRoute';
import ProtectedRoute from './ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public */}
        <Route path="/" element={<BrowsePage />} />
        <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        <Route path="/users/:id" element={<PublicProfilePage />} />

        {/* Logged-in only. "/recipes/new" is matched before "/recipes/:id" (static segments win). */}
        <Route element={<ProtectedRoute />}>
          <Route path="/recipes/new" element={<CreateRecipePage />} />
          <Route path="/recipes/:id/edit" element={<EditRecipePage />} />
          <Route path="/my-recipes" element={<MyRecipesPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/collections/:id" element={<CollectionDetailPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/profile" element={<MyProfilePage />} />
        </Route>

        {/* Admin only */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="recipes" element={<AdminRecipesPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
          </Route>
        </Route>
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}