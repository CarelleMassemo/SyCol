import { useEffect, useRef, useState } from 'react';

// Hook léger (pas de librairie externe) : révèle un élément avec un fondu
// quand il entre dans le viewport. Un seul IntersectionObserver par élément,
// déconnecté après la première apparition pour ne pas consommer de ressources.
export default function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}
