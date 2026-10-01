import { Rss } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { getFeed } from '../../api/social.api';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import FeedItem from '../../components/social/FeedItem';
import { getErrorMessage } from '../../utils/helpers';

const LIMIT = 10;

export default function FeedPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let active = true;
    getFeed({ page: 1, limit: LIMIT })
      .then((d) => {
        if (!active) return;
        setItems(d.items);
        setHasMore(d.hasMore);
      })
      .catch((e) => active && toast.error(getErrorMessage(e)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const d = await getFeed({ page: page + 1, limit: LIMIT });
      setItems((prev) => [...prev, ...d.items]);
      setHasMore(d.hasMore);
      setPage(page + 1);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Feed</h1>
      {loading ? <Loader /> : items.length === 0 ? (
        <EmptyState
          icon={Rss}
          title="Your feed is empty"
          message="Follow other cooks to see their new recipes and reviews here."
          action={<Link to="/" className="font-medium text-primary">Find recipes and cooks</Link>}
        />
      ) : (
        <div className="space-y-4">
          {items.map((item, i) => (
            <FeedItem key={`${item.type}-${item.review?.id ?? item.recipe?.id}-${item.createdAt}-${i}`} item={item} />
          ))}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={loadMore} loading={loadingMore}>Load more</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}