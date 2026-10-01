import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getRecipe, updateRecipe } from '../../api/recipe.api';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import RecipeForm from '../../components/recipe/RecipeForm';
import useAuth from '../../hooks/useAuth';
import { getErrorMessage } from '../../utils/helpers';

export default function EditRecipePage() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getRecipe(id)
      .then((r) => active && setRecipe(r))
      .catch((e) => {
        if (!active) return;
        setFailed(true);
        toast.error(getErrorMessage(e));
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <Loader />;
  if (failed || !recipe) {
    return <EmptyState title="Recipe not found" action={<Link to="/" className="text-primary">Back to recipes</Link>} />;
  }
  if (recipe.author.id !== user.id && !isAdmin) {
    return <EmptyState title="You can't edit this recipe" message="Only the author or an admin can edit it." action={<Link to={`/recipes/${id}`} className="text-primary">View recipe</Link>} />;
  }

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await updateRecipe(id, formData);
      toast.success('Recipe updated');
      navigate(`/recipes/${id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-5 text-2xl font-bold">Edit recipe</h1>
      <RecipeForm initial={recipe} onSubmit={handleSubmit} submitting={submitting} submitLabel="Save changes" />
    </div>
  );
}