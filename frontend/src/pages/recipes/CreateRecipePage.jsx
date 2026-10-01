import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { createRecipe } from '../../api/recipe.api';
import RecipeForm from '../../components/recipe/RecipeForm';
import { getErrorMessage } from '../../utils/helpers';

export default function CreateRecipePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const recipe = await createRecipe(formData);
      toast.success('Recipe published!');
      navigate(`/recipes/${recipe.id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-5 text-2xl font-bold">Add a Recipe</h1>
      <RecipeForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Publish recipe" />
    </div>
  );
}