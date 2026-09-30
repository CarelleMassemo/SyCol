import { useCallback, useEffect, useState } from 'react';
import { fetchReviews, postReview } from '../lib/api';

// Les avis sont désormais stockés dans la vraie base de données du serveur
// (voir sycol-api/) : ils sont visibles par TOUS les visiteurs du site, et
// pas seulement dans le navigateur de la personne qui les a postés.
export default function useReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchReviews()
      .then((data) => {
        if (!cancelled) setReviews(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const addReview = useCallback(async (review) => {
    const created = await postReview(review);
    setReviews((prev) => [created, ...prev]);
    return created;
  }, []);

  const average = reviews.length
    ? reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length
    : 0;

  return { reviews, addReview, average, loading, error };
}
