import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { followUser, unfollowUser } from '../../api/social.api';
import useAuth from '../../hooks/useAuth';
import { getErrorMessage } from '../../utils/helpers';
import Button from '../common/Button';

// Hidden on your own profile. `onChange(isFollowing)` lets the parent update counts.
export default function FollowButton({ userId, initialFollowing = false, onChange, size = 'sm' }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, setPending] = useState(false);

  useEffect(() => setFollowing(initialFollowing), [initialFollowing]);

  if (user?.id === userId) return null;

  const toggle = async () => {
    if (!user) return navigate('/login', { state: { from: location } });
    setPending(true);
    try {
      if (following) await unfollowUser(userId);
      else await followUser(userId);
      setFollowing(!following);
      onChange?.(!following);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setPending(false);
    }
    return undefined;
  };

  return (
    <Button size={size} variant={following ? 'outline' : 'dark'} loading={pending} onClick={toggle}>
      {following ? 'Following' : 'Follow'}
    </Button>
  );
}